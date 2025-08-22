/**
 * Food Quality Analyzer
 * Core logic for analyzing food quality and providing recommendations
 */

import {
  poorQualityFoods,
  fairQualityFoods,
  goodQualityFoods,
  excellentQualityFoods
} from './food-data/food-categories';
import { timingBasedFoods } from './food-data/timing-foods';
import { getAgeSpecificBonus, getAgeHydrationReminder, type AgeGroup } from './food-data/age-specific';

export type FoodQuality = 'poor' | 'fair' | 'good' | 'excellent';
export type MealTiming = 'pre-game' | 'post-game' | 'regular';

export interface FoodAnalysis {
  quality: FoodQuality;
  score: number;
  suggestions: string[];
  ageBonus?: number;
}

/**
 * Analyze food quality based on description and context
 */
export function analyzeFoodQuality(
  description: string,
  mealTiming?: MealTiming,
  playerAge?: number,
  ageGroup?: AgeGroup
): FoodAnalysis {
  const desc = description.toLowerCase();
  
  // Direct check for "junk food"
  if (desc.includes('junk')) {
    return {
      quality: 'poor',
      score: 0,
      suggestions: ['Try to avoid junk food. Choose whole foods instead.']
    };
  }
  
  // Count matches in each category
  const poorCount = poorQualityFoods.keywords.filter(food => desc.includes(food)).length;
  const fairCount = fairQualityFoods.keywords.filter(food => desc.includes(food)).length;
  const goodCount = goodQualityFoods.keywords.filter(food => desc.includes(food)).length;
  const excellentCount = excellentQualityFoods.keywords.filter(food => desc.includes(food)).length;
  
  // Check timing-specific foods if meal timing is provided
  let timingBonus = 0;
  let timingSuggestions: string[] = [];
  
  if (mealTiming === 'pre-game') {
    const preGameMatches = timingBasedFoods.preGame.keywords.filter(food => desc.includes(food)).length;
    if (preGameMatches > 0) {
      timingBonus = 10;
      timingSuggestions.push('Good pre-game fuel choice!');
    } else {
      timingSuggestions.push('Consider carb-rich foods 2-3 hours before game');
    }
  } else if (mealTiming === 'post-game') {
    const postGameMatches = timingBasedFoods.postGame.keywords.filter(food => desc.includes(food)).length;
    if (postGameMatches > 0) {
      timingBonus = 10;
      timingSuggestions.push('Excellent recovery meal!');
    } else {
      timingSuggestions.push('Add protein for better recovery');
    }
  }
  
  // Calculate base score
  let score = 50; // Start at fair
  let quality: FoodQuality = 'fair';
  let suggestions: string[] = [...timingSuggestions];
  
  // Determine quality based on matches
  if (poorCount >= 2 || (poorCount > goodCount + excellentCount)) {
    quality = 'poor';
    score = Math.max(0, 25 - (poorCount * 5));
    suggestions.push('This meal is high in processed foods. Try adding more whole foods.');
  } else if (excellentCount >= 2 && goodCount >= 1) {
    quality = 'excellent';
    score = Math.min(100, 85 + (excellentCount * 5) + timingBonus);
    suggestions.push('Excellent nutritional choice for a young athlete!');
  } else if (goodCount >= 2 || (goodCount > 0 && excellentCount > 0)) {
    quality = 'good';
    score = Math.min(85, 65 + (goodCount * 5) + (excellentCount * 10) + timingBonus);
    suggestions.push('Good balanced meal. Keep it up!');
  } else if (fairCount >= 1 || goodCount >= 1) {
    quality = 'fair';
    score = Math.min(65, 40 + (fairCount * 5) + (goodCount * 10) + timingBonus);
    suggestions.push('Decent choice. Try adding more vegetables or lean protein.');
  } else {
    quality = 'poor';
    score = 25;
    suggestions.push('Consider adding more nutritious foods to your meal.');
  }
  
  // Apply age-specific adjustments
  let ageBonus = 0;
  if (ageGroup) {
    const ageAdjustment = getAgeSpecificBonus(ageGroup, quality, desc);
    ageBonus = ageAdjustment.bonus;
    suggestions.push(...ageAdjustment.suggestions);
    
    // Apply age bonus to final score
    score = Math.min(100, score + ageBonus);
  }
  
  // Age-specific hydration reminders
  if (playerAge) {
    const hydrationReminder = getAgeHydrationReminder(playerAge, desc, mealTiming);
    if (hydrationReminder) {
      suggestions.push(hydrationReminder);
    }
  }
  
  return { quality, score, suggestions, ageBonus };
}

/**
 * Get food recommendations based on time of day and activity
 */
export function getFoodRecommendations(
  timeOfDay: 'morning' | 'afternoon' | 'evening',
  isTrainingDay: boolean,
  lastMealQuality?: FoodQuality
): string[] {
  const recommendations: string[] = [];
  
  if (timeOfDay === 'morning') {
    recommendations.push('Start with oatmeal or whole grain toast');
    recommendations.push('Add eggs for protein');
    recommendations.push('Include fruit for vitamins');
    if (isTrainingDay) {
      recommendations.push('Extra carbs needed - add banana or honey');
    }
  } else if (timeOfDay === 'afternoon') {
    recommendations.push('Balanced lunch with protein and vegetables');
    recommendations.push('Stay hydrated with water');
    if (isTrainingDay) {
      recommendations.push('Light meal if training soon, heavier if post-training');
    }
  } else {
    recommendations.push('Lean protein with vegetables');
    recommendations.push('Complex carbs if you trained today');
    recommendations.push('Avoid heavy, fatty foods before bed');
  }
  
  if (lastMealQuality === 'poor') {
    recommendations.unshift('WARNING: Your last meal was low quality - make this one count!');
  }
  
  return recommendations;
}