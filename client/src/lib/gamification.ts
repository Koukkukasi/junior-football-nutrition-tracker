/**
 * Simple gamification system for nutrition tracking
 * Keep it casual and fun without being overwhelming
 */

// Simple level names - football themed but casual
export const LEVEL_RANKS = [
  { min: 0, max: 100, rank: 'Rookie', emoji: '🌱' },
  { min: 100, max: 250, rank: 'Beginner', emoji: '⚽' },
  { min: 250, max: 500, rank: 'Amateur', emoji: '🥉' },
  { min: 500, max: 1000, rank: 'Semi-Pro', emoji: '🥈' },
  { min: 1000, max: 2000, rank: 'Pro', emoji: '🥇' },
  { min: 2000, max: 3500, rank: 'Star', emoji: '⭐' },
  { min: 3500, max: 5000, rank: 'Champion', emoji: '🏆' },
  { min: 5000, max: 7500, rank: 'Legend', emoji: '👑' },
  { min: 7500, max: 10000, rank: 'Elite', emoji: '💎' },
  { min: 10000, max: Infinity, rank: 'Master', emoji: '🔥' }
];

/**
 * Calculate XP from daily nutrition score
 * Simple formula: score = XP, with small bonuses
 */
export function calculateDailyXP(nutritionScore: number, mealsLogged: number): number {
  let xp = nutritionScore;
  
  // Small bonus for logging multiple meals
  if (mealsLogged >= 3) xp += 10;
  if (mealsLogged >= 5) xp += 10; // Total +20 for full day
  
  // Slight bonus for excellent scores
  if (nutritionScore >= 90) {
    xp += 15; // Excellence bonus
  } else if (nutritionScore >= 80) {
    xp += 5; // Good job bonus
  }
  
  return Math.round(xp);
}

/**
 * Get current level info from total XP
 */
export function getLevelInfo(totalXP: number) {
  const level = LEVEL_RANKS.find(l => totalXP >= l.min && totalXP < l.max) || LEVEL_RANKS[0];
  
  // Calculate progress to next level
  const nextLevel = LEVEL_RANKS.find(l => l.min > totalXP) || LEVEL_RANKS[LEVEL_RANKS.length - 1];
  const xpInCurrentLevel = totalXP - level.min;
  const xpNeededForNext = nextLevel.min - level.min;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));
  
  // Calculate actual level number (1, 2, 3, etc.)
  const levelNumber = LEVEL_RANKS.findIndex(l => l === level) + 1;
  
  return {
    rank: level.rank,
    emoji: level.emoji,
    levelNumber,
    totalXP,
    xpInCurrentLevel,
    xpNeededForNext,
    progressPercent,
    xpToNextLevel: nextLevel.min - totalXP
  };
}

/**
 * Format XP display - keep it simple
 */
export function formatXP(xp: number): string {
  if (xp >= 10000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

/**
 * Get encouraging message based on level
 */
export function getLevelMessage(levelNumber: number): string {
  const messages = [
    "Just getting started! 🌟",
    "You're on your way! 💪",
    "Looking good, keep it up!",
    "Nice progress, athlete!",
    "You're crushing it! 🔥",
    "Impressive dedication!",
    "Champion mindset! 🏆",
    "Legendary nutrition game!",
    "Elite performance! 💎",
    "Nutrition master! 👑"
  ];
  
  return messages[levelNumber - 1] || messages[messages.length - 1];
}

/**
 * Calculate streak bonus XP
 */
export function getStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 50;
  if (streakDays >= 14) return 30;
  if (streakDays >= 7) return 20;
  if (streakDays >= 3) return 10;
  return 0;
}

/**
 * Simple achievement check
 */
export interface SimpleAchievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  checkUnlocked: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalMealsLogged: number;
  perfectDays: number; // Days with 80%+ score
}

export const ACHIEVEMENTS: SimpleAchievement[] = [
  {
    id: 'first_meal',
    name: 'First Step',
    description: 'Log your first meal',
    emoji: '🥗',
    checkUnlocked: (stats) => stats.totalMealsLogged >= 1
  },
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: '7 day streak',
    emoji: '🔥',
    checkUnlocked: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach Pro level',
    emoji: '⭐',
    checkUnlocked: (stats) => stats.totalXP >= 1000
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: '7 days with 80%+ score',
    emoji: '💯',
    checkUnlocked: (stats) => stats.perfectDays >= 7
  },
  {
    id: 'hundred_meals',
    name: 'Committed',
    description: 'Log 100 meals',
    emoji: '💪',
    checkUnlocked: (stats) => stats.totalMealsLogged >= 100
  }
];