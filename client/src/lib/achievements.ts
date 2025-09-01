/**
 * Achievement System for Junior Football Nutrition Tracker
 * Defines all achievements, their requirements, and XP rewards
 */

export type AchievementCategory = 'nutrition' | 'consistency' | 'performance' | 'social' | 'special';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string; // Emoji or icon name
  xpReward: number;
  requirements: {
    type: 'count' | 'streak' | 'score' | 'special';
    target: number;
    field?: string; // Which field to track (meals, nutritionScore, etc.)
  };
  unlockedAt?: Date;
  progress?: number;
}

// Achievement Definitions
export const achievements: Achievement[] = [
  // Nutrition Achievements
  {
    id: 'first-meal',
    name: 'First Meal',
    description: 'Log your first meal',
    category: 'nutrition',
    rarity: 'common',
    icon: '🍽️',
    xpReward: 50,
    requirements: { type: 'count', target: 1, field: 'meals' }
  },
  {
    id: 'meal-master-10',
    name: 'Meal Master',
    description: 'Log 10 meals',
    category: 'nutrition',
    rarity: 'common',
    icon: '🍴',
    xpReward: 100,
    requirements: { type: 'count', target: 10, field: 'meals' }
  },
  {
    id: 'meal-champion-50',
    name: 'Meal Champion',
    description: 'Log 50 meals',
    category: 'nutrition',
    rarity: 'rare',
    icon: '👨‍🍳',
    xpReward: 250,
    requirements: { type: 'count', target: 50, field: 'meals' }
  },
  {
    id: 'meal-legend-100',
    name: 'Meal Legend',
    description: 'Log 100 meals',
    category: 'nutrition',
    rarity: 'epic',
    icon: '🏆',
    xpReward: 500,
    requirements: { type: 'count', target: 100, field: 'meals' }
  },
  {
    id: 'nutrition-excellence',
    name: 'Nutrition Excellence',
    description: 'Achieve 90% nutrition score',
    category: 'nutrition',
    rarity: 'epic',
    icon: '⭐',
    xpReward: 300,
    requirements: { type: 'score', target: 90, field: 'nutritionScore' }
  },
  {
    id: 'perfect-day',
    name: 'Perfect Day',
    description: 'Log all 5 meals in one day',
    category: 'nutrition',
    rarity: 'rare',
    icon: '💯',
    xpReward: 150,
    requirements: { type: 'special', target: 5, field: 'dailyMeals' }
  },

  // Consistency Achievements (Streaks)
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: '3-day meal logging streak',
    category: 'consistency',
    rarity: 'common',
    icon: '🔥',
    xpReward: 75,
    requirements: { type: 'streak', target: 3, field: 'mealStreak' }
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: '7-day meal logging streak',
    category: 'consistency',
    rarity: 'rare',
    icon: '💪',
    xpReward: 200,
    requirements: { type: 'streak', target: 7, field: 'mealStreak' }
  },
  {
    id: 'fortnight-fighter',
    name: 'Fortnight Fighter',
    description: '14-day meal logging streak',
    category: 'consistency',
    rarity: 'epic',
    icon: '🚀',
    xpReward: 400,
    requirements: { type: 'streak', target: 14, field: 'mealStreak' }
  },
  {
    id: 'monthly-master',
    name: 'Monthly Master',
    description: '30-day meal logging streak',
    category: 'consistency',
    rarity: 'legendary',
    icon: '👑',
    xpReward: 1000,
    requirements: { type: 'streak', target: 30, field: 'mealStreak' }
  },

  // Performance Achievements
  {
    id: 'energy-boost',
    name: 'Energy Boost',
    description: 'Maintain energy level 8+ for a week',
    category: 'performance',
    rarity: 'rare',
    icon: '⚡',
    xpReward: 150,
    requirements: { type: 'special', target: 8, field: 'weeklyEnergy' }
  },
  {
    id: 'sleep-champion',
    name: 'Sleep Champion',
    description: 'Average 8+ hours sleep for a week',
    category: 'performance',
    rarity: 'rare',
    icon: '😴',
    xpReward: 150,
    requirements: { type: 'special', target: 8, field: 'weeklySleep' }
  },
  {
    id: 'training-dedication',
    name: 'Training Dedication',
    description: 'Log 10 training days',
    category: 'performance',
    rarity: 'common',
    icon: '🏃',
    xpReward: 100,
    requirements: { type: 'count', target: 10, field: 'trainingDays' }
  },
  {
    id: 'recovery-pro',
    name: 'Recovery Pro',
    description: 'Always eat recovery meal after training (10 times)',
    category: 'performance',
    rarity: 'epic',
    icon: '🥤',
    xpReward: 250,
    requirements: { type: 'count', target: 10, field: 'recoveryMeals' }
  },

  // Social Achievements
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Join a team',
    category: 'social',
    rarity: 'common',
    icon: '👥',
    xpReward: 50,
    requirements: { type: 'special', target: 1, field: 'teamJoined' }
  },
  {
    id: 'top-performer',
    name: 'Top Performer',
    description: 'Rank in top 10 on leaderboard',
    category: 'social',
    rarity: 'rare',
    icon: '🥇',
    xpReward: 200,
    requirements: { type: 'special', target: 10, field: 'leaderboardRank' }
  },
  {
    id: 'podium-finish',
    name: 'Podium Finish',
    description: 'Rank in top 3 on leaderboard',
    category: 'social',
    rarity: 'epic',
    icon: '🏅',
    xpReward: 500,
    requirements: { type: 'special', target: 3, field: 'leaderboardRank' }
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Rank #1 on leaderboard',
    category: 'social',
    rarity: 'legendary',
    icon: '🏆',
    xpReward: 1000,
    requirements: { type: 'special', target: 1, field: 'leaderboardRank' }
  },

  // Special Achievements
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Log breakfast before 7 AM',
    category: 'special',
    rarity: 'common',
    icon: '🌅',
    xpReward: 50,
    requirements: { type: 'special', target: 1, field: 'earlyBreakfast' }
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Log evening snack after training',
    category: 'special',
    rarity: 'common',
    icon: '🦉',
    xpReward: 50,
    requirements: { type: 'special', target: 1, field: 'postTrainingSnack' }
  },
  {
    id: 'finnish-foodie',
    name: 'Finnish Foodie',
    description: 'Log 10 Finnish/Nordic meals',
    category: 'special',
    rarity: 'rare',
    icon: '🇫🇮',
    xpReward: 150,
    requirements: { type: 'count', target: 10, field: 'nordicMeals' }
  },
  {
    id: 'hydration-hero',
    name: 'Hydration Hero',
    description: 'Log water intake for 7 days straight',
    category: 'special',
    rarity: 'rare',
    icon: '💧',
    xpReward: 100,
    requirements: { type: 'streak', target: 7, field: 'waterStreak' }
  },
  {
    id: 'balanced-athlete',
    name: 'Balanced Athlete',
    description: 'Achieve perfect balance: 80+ nutrition, 8+ energy, 8+ sleep',
    category: 'special',
    rarity: 'legendary',
    icon: '🎯',
    xpReward: 750,
    requirements: { type: 'special', target: 1, field: 'perfectBalance' }
  }
];

// XP to Level Calculation
export function calculateLevel(totalXP: number): { level: number; currentXP: number; xpToNext: number; progress: number } {
  // Level curve: each level requires progressively more XP
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
  const levelThresholds = [0];
  let xpRequired = 100;
  
  for (let i = 1; i <= 100; i++) {
    levelThresholds[i] = levelThresholds[i - 1] + xpRequired;
    xpRequired = Math.floor(xpRequired * 1.15); // 15% increase per level
    if (xpRequired > 5000) xpRequired = 5000; // Cap at 5000 XP per level after high levels
  }

  let level = 1;
  for (let i = 1; i < levelThresholds.length; i++) {
    if (totalXP >= levelThresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelXP = totalXP - levelThresholds[level - 1];
  const xpToNext = level < 100 ? levelThresholds[level] - totalXP : 0;
  const levelRange = level < 100 ? levelThresholds[level] - levelThresholds[level - 1] : 1;
  const progress = (currentLevelXP / levelRange) * 100;

  return { level, currentXP: currentLevelXP, xpToNext, progress };
}

// Level-based rewards
export interface LevelReward {
  level: number;
  reward: string;
  type: 'badge' | 'title' | 'feature' | 'bonus';
  icon: string;
}

export const levelRewards: LevelReward[] = [
  { level: 5, reward: 'Nutrition Novice', type: 'title', icon: '🌱' },
  { level: 10, reward: 'Dedicated Athlete', type: 'title', icon: '🏃‍♂️' },
  { level: 15, reward: 'Custom Meal Plans', type: 'feature', icon: '📋' },
  { level: 20, reward: 'Rising Star', type: 'title', icon: '⭐' },
  { level: 25, reward: 'Advanced Analytics', type: 'feature', icon: '📊' },
  { level: 30, reward: 'Team Captain Badge', type: 'badge', icon: '🎖️' },
  { level: 40, reward: 'Elite Performer', type: 'title', icon: '💎' },
  { level: 50, reward: 'Nutrition Master', type: 'title', icon: '👨‍🎓' },
  { level: 60, reward: 'Champion Badge', type: 'badge', icon: '🏆' },
  { level: 75, reward: 'Legend Status', type: 'title', icon: '👑' },
  { level: 100, reward: 'Hall of Fame', type: 'badge', icon: '🏛️' }
];

// Check if user has earned an achievement
export function checkAchievementProgress(
  achievementId: string,
  userStats: any
): { earned: boolean; progress: number } {
  const achievement = achievements.find(a => a.id === achievementId);
  if (!achievement) return { earned: false, progress: 0 };

  const { type, target, field } = achievement.requirements;
  let currentValue = 0;

  // Get current value based on field
  switch (field) {
    case 'meals':
      currentValue = userStats.totalMeals || 0;
      break;
    case 'nutritionScore':
      currentValue = userStats.averageNutritionScore || 0;
      break;
    case 'mealStreak':
      currentValue = userStats.currentStreak || 0;
      break;
    case 'trainingDays':
      currentValue = userStats.trainingDays || 0;
      break;
    case 'weeklyEnergy':
      currentValue = userStats.weeklyAverageEnergy || 0;
      break;
    case 'weeklySleep':
      currentValue = userStats.weeklyAverageSleep || 0;
      break;
    case 'leaderboardRank':
      currentValue = userStats.leaderboardRank || 999;
      break;
    default:
      currentValue = 0;
  }

  // Calculate progress
  let progress = 0;
  let earned = false;

  switch (type) {
    case 'count':
    case 'streak':
      progress = Math.min(100, (currentValue / target) * 100);
      earned = currentValue >= target;
      break;
    case 'score':
      progress = Math.min(100, (currentValue / target) * 100);
      earned = currentValue >= target;
      break;
    case 'special':
      // Special achievements need custom logic
      if (field === 'leaderboardRank') {
        earned = currentValue <= target;
        progress = earned ? 100 : 0;
      } else {
        progress = userStats[field] ? 100 : 0;
        earned = userStats[field] === true;
      }
      break;
  }

  return { earned, progress };
}

// Get rarity color for display
export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-400';
    case 'rare':
      return 'bg-blue-500';
    case 'epic':
      return 'bg-purple-600';
    case 'legendary':
      return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    default:
      return 'bg-gray-400';
  }
}

// Get rarity border color
export function getRarityBorder(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'common':
      return 'border-gray-400';
    case 'rare':
      return 'border-blue-500';
    case 'epic':
      return 'border-purple-600';
    case 'legendary':
      return 'border-yellow-500';
    default:
      return 'border-gray-400';
  }
}