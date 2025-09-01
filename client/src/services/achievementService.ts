/**
 * Achievement Service
 * Handles achievement tracking, unlocking, and persistence
 */

import type { Achievement } from '../lib/achievements';
import { achievements, checkAchievementProgress } from '../lib/achievements';
import { supabaseAPI } from '../lib/supabase-api';

export interface UserAchievementData {
  achievementId: string;
  unlockedAt: Date;
  progress: number;
}

export interface UserStats {
  totalMeals: number;
  averageNutritionScore: number;
  currentStreak: number;
  longestStreak: number;
  trainingDays: number;
  recoveryMeals: number;
  weeklyAverageEnergy: number;
  weeklyAverageSleep: number;
  leaderboardRank: number;
  teamJoined: boolean;
  nordicMeals: number;
  dailyMeals?: number;
  earlyBreakfast?: boolean;
  postTrainingSnack?: boolean;
  waterStreak?: number;
  perfectBalance?: boolean;
}

class AchievementService {
  private unlockedAchievements: Set<string> = new Set();
  private achievementProgress: Map<string, number> = new Map();
  private onUnlockCallbacks: ((achievement: Achievement) => void)[] = [];

  /**
   * Initialize achievement service with user data
   */
  async initialize(userId: string) {
    try {
      // Load user's unlocked achievements from database
      const response = await supabaseAPI.achievements?.getUserAchievements?.(userId);
      if (response?.data) {
        response.data.forEach((achievement: UserAchievementData) => {
          this.unlockedAchievements.add(achievement.achievementId);
          this.achievementProgress.set(achievement.achievementId, 100);
        });
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
      // Load from localStorage as fallback
      this.loadFromLocalStorage();
    }
  }

  /**
   * Check all achievements against current user stats
   */
  async checkAchievements(userStats: UserStats): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of achievements) {
      // Skip already unlocked achievements
      if (this.unlockedAchievements.has(achievement.id)) {
        continue;
      }

      // Check if achievement is earned
      const { earned, progress } = checkAchievementProgress(achievement.id, userStats);
      
      // Update progress
      this.achievementProgress.set(achievement.id, progress);

      // If earned and not yet unlocked, unlock it
      if (earned && !this.unlockedAchievements.has(achievement.id)) {
        await this.unlockAchievement(achievement, userStats);
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Unlock an achievement
   */
  private async unlockAchievement(achievement: Achievement, userStats: UserStats) {
    // Add to unlocked set
    this.unlockedAchievements.add(achievement.id);
    this.achievementProgress.set(achievement.id, 100);

    // Save to database
    try {
      await supabaseAPI.achievements?.unlockAchievement?.(achievement.id, achievement.xpReward);
    } catch (error) {
      console.error('Failed to save achievement to database:', error);
    }

    // Save to localStorage as backup
    this.saveToLocalStorage();

    // Update user's total XP
    await this.updateUserXP(achievement.xpReward);

    // Trigger callbacks
    this.onUnlockCallbacks.forEach(callback => callback(achievement));
  }

  /**
   * Update user's total XP
   */
  private async updateUserXP(xpGained: number) {
    try {
      // Update XP in database
      await supabaseAPI.users?.updateXP?.(xpGained);
    } catch (error) {
      console.error('Failed to update XP:', error);
      // Update in localStorage as fallback
      const currentXP = parseInt(localStorage.getItem('userTotalXP') || '0');
      localStorage.setItem('userTotalXP', String(currentXP + xpGained));
    }
  }

  /**
   * Get all achievements with their unlock status and progress
   */
  getAchievementsWithStatus(): (Achievement & { unlocked: boolean; progress: number })[] {
    return achievements.map(achievement => ({
      ...achievement,
      unlocked: this.unlockedAchievements.has(achievement.id),
      progress: this.achievementProgress.get(achievement.id) || 0
    }));
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return achievements.filter(a => this.unlockedAchievements.has(a.id));
  }

  /**
   * Get achievement by ID
   */
  getAchievement(id: string): Achievement | undefined {
    return achievements.find(a => a.id === id);
  }

  /**
   * Subscribe to achievement unlock events
   */
  onAchievementUnlock(callback: (achievement: Achievement) => void) {
    this.onUnlockCallbacks.push(callback);
    return () => {
      this.onUnlockCallbacks = this.onUnlockCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Calculate user stats from their data
   */
  async calculateUserStats(userId: string): Promise<UserStats> {
    const stats: UserStats = {
      totalMeals: 0,
      averageNutritionScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      trainingDays: 0,
      recoveryMeals: 0,
      weeklyAverageEnergy: 0,
      weeklyAverageSleep: 0,
      leaderboardRank: 999,
      teamJoined: false,
      nordicMeals: 0
    };

    try {
      // Fetch food entries
      const foodResponse = await supabaseAPI.food.getEntries();
      if (foodResponse.data) {
        stats.totalMeals = foodResponse.data.length;
        
        // Calculate average nutrition score
        const scores = foodResponse.data
          .map((entry: any) => entry.nutrition_score)
          .filter((score: any) => score != null);
        if (scores.length > 0) {
          stats.averageNutritionScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        }

        // Count Nordic meals
        stats.nordicMeals = foodResponse.data.filter((entry: any) => 
          entry.description?.toLowerCase().includes('finnish') ||
          entry.description?.toLowerCase().includes('nordic') ||
          entry.description?.toLowerCase().includes('ruisleipä') ||
          entry.description?.toLowerCase().includes('puuro')
        ).length;

        // Calculate streak
        stats.currentStreak = this.calculateStreak(foodResponse.data);
      }

      // Fetch performance metrics
      const perfResponse = await supabaseAPI.performance.getEntries();
      if (perfResponse.data) {
        const recentWeek = perfResponse.data.slice(0, 7);
        
        // Calculate weekly averages
        if (recentWeek.length > 0) {
          stats.weeklyAverageEnergy = recentWeek
            .reduce((sum: number, entry: any) => sum + (entry.energy_level || 0), 0) / recentWeek.length;
          stats.weeklyAverageSleep = recentWeek
            .reduce((sum: number, entry: any) => sum + (entry.sleep_hours || 0), 0) / recentWeek.length;
        }

        // Count training days
        stats.trainingDays = perfResponse.data.filter((entry: any) => entry.training_intensity > 0).length;
        stats.recoveryMeals = perfResponse.data.filter((entry: any) => entry.had_recovery_meal).length;
      }

      // Check team membership
      const userResponse = await supabaseAPI.users?.getProfile?.();
      if (userResponse?.data?.team_id) {
        stats.teamJoined = true;
      }

    } catch (error) {
      console.error('Failed to calculate user stats:', error);
    }

    return stats;
  }

  /**
   * Calculate current streak from food entries
   */
  private calculateStreak(entries: any[]): number {
    if (!entries || entries.length === 0) return 0;

    // Sort entries by date
    const sortedEntries = entries.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) { // Check last 30 days max
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasEntry = sortedEntries.some(entry => 
        new Date(entry.created_at).toISOString().split('T')[0] === dateStr
      );

      if (hasEntry) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i === 0) {
        // If no entry today, check yesterday
        currentDate.setDate(currentDate.getDate() - 1);
        const yesterdayStr = currentDate.toISOString().split('T')[0];
        const hasYesterday = sortedEntries.some(entry => 
          new Date(entry.created_at).toISOString().split('T')[0] === yesterdayStr
        );
        if (!hasYesterday) break;
        streak = 1;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Load achievements from localStorage
   */
  private loadFromLocalStorage() {
    const saved = localStorage.getItem('unlockedAchievements');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.unlockedAchievements = new Set(data);
      } catch (error) {
        console.error('Failed to load achievements from localStorage:', error);
      }
    }
  }

  /**
   * Save achievements to localStorage
   */
  private saveToLocalStorage() {
    try {
      localStorage.setItem('unlockedAchievements', JSON.stringify(Array.from(this.unlockedAchievements)));
    } catch (error) {
      console.error('Failed to save achievements to localStorage:', error);
    }
  }
}

// Export singleton instance
export const achievementService = new AchievementService();