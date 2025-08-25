/**
 * Utility functions for food logging
 */

import type { MealType, MealTiming, NutritionScore, FoodEntry } from '../types/food.types';

/**
 * Determine meal timing context based on meal type and time
 */
export function getMealTiming(mealType: MealType, time: string): MealTiming {
  const hour = parseInt(time.split(':')[0]);
  
  // Special handling for after-practice meals
  if (mealType === 'AFTER_PRACTICE') {
    return 'after-practice';
  }
  
  // Assume games are typically in afternoon (14:00-18:00)
  if (mealType === 'LUNCH' && hour >= 11 && hour <= 13) {
    return 'pre-game'; // Lunch before afternoon game
  } else if (mealType === 'DINNER' && hour >= 18 && hour <= 20) {
    return 'post-game'; // Dinner after game
  }
  return 'regular';
}

/**
 * Calculate nutrition score based on meals logged
 */
export function calculateNutritionScore(entries: FoodEntry[]): NutritionScore {
  // Meal frequency scoring (40% weight)
  const expectedMeals = 5; // Breakfast, snack, lunch, dinner, evening snack
  const actualMeals = entries.length;
  const mealFrequency = Math.min(100, (actualMeals / expectedMeals) * 100);
  
  // Food quality scoring (60% weight)
  const qualityScores = {
    excellent: 100,
    good: 75,
    fair: 50,
    poor: 25
  };
  
  const totalQualityScore = entries.reduce((sum, entry) => {
    return sum + (qualityScores[entry.quality || 'fair'] || 50);
  }, 0);
  
  const foodQuality = entries.length > 0 
    ? Math.round(totalQualityScore / entries.length)
    : 0;
  
  // Calculate weighted total
  const totalScore = Math.round((mealFrequency * 0.4) + (foodQuality * 0.6));
  
  return {
    mealFrequency: Math.round(mealFrequency),
    foodQuality,
    totalScore
  };
}

/**
 * Get time-based meal recommendations
 */
export function getTimeBasedRecommendations(currentHour: number): string[] {
  const recommendations: string[] = [];
  
  if (currentHour < 9) {
    recommendations.push('Start your day with a protein-rich breakfast');
    recommendations.push('Include complex carbs for sustained energy');
  } else if (currentHour < 12) {
    recommendations.push('Time for a healthy mid-morning snack');
    recommendations.push('Stay hydrated with water');
  } else if (currentHour < 14) {
    recommendations.push('Lunch should include lean protein and vegetables');
    recommendations.push('Avoid heavy, greasy foods that can make you sluggish');
  } else if (currentHour < 17) {
    recommendations.push('Pre-training snack: banana or energy bar');
    recommendations.push('Hydrate well before training');
  } else if (currentHour < 20) {
    recommendations.push('Post-training: protein for recovery within 30 minutes');
    recommendations.push('Dinner: balanced meal with carbs and protein');
  } else {
    recommendations.push('Light evening snack if hungry');
    recommendations.push('Avoid heavy meals before bed');
  }
  
  return recommendations;
}

/**
 * Format meal type for display
 */
export function formatMealType(mealType: MealType): string {
  const formats: Record<MealType, string> = {
    'BREAKFAST': 'Breakfast',
    'SNACK': 'Morning Snack',
    'LUNCH': 'Lunch',
    'DINNER': 'Dinner',
    'EVENING_SNACK': 'Evening Snack',
    'AFTER_PRACTICE': '🏃 After Practice'
  };
  
  return formats[mealType] || mealType;
}