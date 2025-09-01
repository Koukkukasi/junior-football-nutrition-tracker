/**
 * Local storage fallback for user stats when database is unavailable
 */

interface LocalUserStats {
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  total_meals_logged: number;
  perfect_days: number;
  last_activity?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

const STATS_KEY = 'user_stats_local';
const XP_LOG_KEY = 'xp_log_local';

interface XPLogEntry {
  date: string;
  xp: number;
  meals: number;
}

export const localStatsService = {
  // Get or initialize user stats
  getStats(): LocalUserStats {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initialize new stats
    const newStats: LocalUserStats = {
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      total_meals_logged: 0,
      perfect_days: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    return newStats;
  },

  // Update stats
  updateStats(updates: Partial<LocalUserStats>): LocalUserStats {
    const current = this.getStats();
    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Add XP with daily tracking
  addXP(xpToAdd: number, mealLogged: boolean = false, isPerfectDay: boolean = false): LocalUserStats {
    const current = this.getStats();
    const today = new Date().toISOString().split('T')[0];
    
    // Update XP log for today
    const xpLog = this.getXPLog();
    const todayEntry = xpLog.find(entry => entry.date === today);
    
    if (todayEntry) {
      todayEntry.xp += xpToAdd;
      if (mealLogged) todayEntry.meals += 1;
    } else {
      xpLog.push({
        date: today,
        xp: xpToAdd,
        meals: mealLogged ? 1 : 0
      });
    }
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filteredLog = xpLog.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
    localStorage.setItem(XP_LOG_KEY, JSON.stringify(filteredLog));
    
    // Update stats
    const updates: Partial<LocalUserStats> = {
      total_xp: current.total_xp + xpToAdd,
      last_activity: new Date().toISOString()
    };
    
    if (mealLogged) {
      updates.total_meals_logged = current.total_meals_logged + 1;
    }
    
    if (isPerfectDay) {
      updates.perfect_days = current.perfect_days + 1;
    }
    
    // Update streak
    const streak = this.calculateStreak(filteredLog);
    updates.current_streak = streak.current;
    updates.longest_streak = Math.max(streak.current, current.longest_streak);
    
    return this.updateStats(updates);
  },

  // Get XP log
  getXPLog(): XPLogEntry[] {
    const stored = localStorage.getItem(XP_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Calculate streak from XP log
  calculateStreak(log: XPLogEntry[]): { current: number; longest: number } {
    if (log.length === 0) return { current: 0, longest: 0 };
    
    // Sort by date descending
    const sorted = [...log].sort((a, b) => b.date.localeCompare(a.date));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;
    
    // Check if today or yesterday has activity for current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (const entry of sorted) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      if (entry.meals > 0) { // Only count days with meals logged
        if (!lastDate) {
          // First entry
          tempStreak = 1;
          
          // Check if it's today or yesterday for current streak
          const diffFromToday = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffFromToday <= 1) {
            currentStreak = 1;
          }
        } else {
          // Check if consecutive day
          const dayDiff = Math.floor((lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            tempStreak++;
            
            // Update current streak if still consecutive from today/yesterday
            const diffFromToday = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
            if (currentStreak > 0 || diffFromToday <= 1) {
              currentStreak = tempStreak;
            }
          } else {
            // Streak broken
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
            
            // Reset current streak if not consecutive from today
            const diffFromToday = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffFromToday > 1) {
              currentStreak = 0;
            }
          }
        }
        
        lastDate = entryDate;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return {
      current: currentStreak,
      longest: longestStreak
    };
  },

  // Get today's XP
  getTodayXP(): number {
    const today = new Date().toISOString().split('T')[0];
    const log = this.getXPLog();
    const todayEntry = log.find(entry => entry.date === today);
    return todayEntry ? todayEntry.xp : 0;
  },

  // Reset stats (for testing)
  resetStats(): void {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(XP_LOG_KEY);
  }
};