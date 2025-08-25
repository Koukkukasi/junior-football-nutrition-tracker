/**
 * Type definitions for Food Logging module
 */

export type MealType = 'BREAKFAST' | 'SNACK' | 'LUNCH' | 'DINNER' | 'EVENING_SNACK' | 'AFTER_PRACTICE';
export type MealTiming = 'pre-game' | 'post-game' | 'after-practice' | 'regular';
export type FoodQuality = 'poor' | 'fair' | 'good' | 'excellent';

export interface FoodEntry {
  id: string;
  mealType: MealType;
  time: string;
  location: string;
  description: string;
  notes?: string;
  quality?: FoodQuality;
}

export interface FoodFormData {
  mealType: MealType;
  time: string;
  location: string;
  description: string;
  notes: string;
}

export interface NutritionScore {
  mealFrequency: number;
  foodQuality: number;
  totalScore: number;
}

export interface MealRecommendation {
  icon: string;
  text: string;
}