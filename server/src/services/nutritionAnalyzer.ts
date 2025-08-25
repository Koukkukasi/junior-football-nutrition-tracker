/**
 * Nutrition Analyzer Service
 * Analyzes food descriptions and calculates nutrition scores
 */

import { foodDatabase } from './foodDatabase';

export interface NutritionAnalysis {
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  score: number;
  suggestions: string[];
  ageBonus?: number;
  identifiedFoods: string[];
  macroEstimates: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  timingScore?: number;
}

export type MealTiming = 'pre-game' | 'post-game' | 'regular';
export type AgeGroup = '10-12' | '13-15' | '16-18' | '19-25';

/**
 * Analyzes food quality based on description and context
 */
export function analyzeFoodQuality(
  description: string,
  mealTiming?: MealTiming,
  _playerAge?: number,
  ageGroup?: AgeGroup
): NutritionAnalysis {
  const lowerDesc = description.toLowerCase();
  const identifiedFoods: string[] = [];
  let qualityPoints = 0;
  let matchCount = 0;

  // Check each category
  Object.entries(foodDatabase).forEach(([category, data]) => {
    data.keywords.forEach(keyword => {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        identifiedFoods.push(keyword);
        matchCount++;
        
        // Assign points based on category
        switch (category) {
          case 'excellent':
            qualityPoints += 100;
            break;
          case 'good':
            qualityPoints += 75;
            break;
          case 'fair':
            qualityPoints += 50;
            break;
          case 'poor':
            qualityPoints += 25;
            break;
        }
      }
    });
  });

  // Calculate base score
  let baseScore = matchCount > 0 ? qualityPoints / matchCount : 50;

  // Apply timing bonuses
  let timingScore = 100;
  if (mealTiming) {
    if (mealTiming === 'pre-game') {
      // Pre-game: favor carbs, moderate protein
      if (lowerDesc.includes('pasta') || lowerDesc.includes('rice') || lowerDesc.includes('bread')) {
        timingScore = 120;
      } else if (lowerDesc.includes('heavy') || lowerDesc.includes('fried') || lowerDesc.includes('cream')) {
        timingScore = 60;
      }
    } else if (mealTiming === 'post-game') {
      // Post-game: favor protein and recovery foods
      if (lowerDesc.includes('protein') || lowerDesc.includes('shake') || lowerDesc.includes('milk')) {
        timingScore = 120;
      } else if (lowerDesc.includes('water') || lowerDesc.includes('fruit')) {
        timingScore = 110;
      }
    }
  }

  // Apply age-specific adjustments
  let ageBonus = 0;
  if (ageGroup) {
    switch (ageGroup) {
      case '10-12':
        // More forgiving, focus on calcium
        if (lowerDesc.includes('milk') || lowerDesc.includes('yogurt') || lowerDesc.includes('cheese')) {
          ageBonus = 15;
        }
        baseScore = Math.min(100, baseScore * 1.1); // 10% more forgiving
        break;
      case '13-15':
        // Growth support
        if (lowerDesc.includes('protein') || lowerDesc.includes('meat') || lowerDesc.includes('eggs')) {
          ageBonus = 10;
        }
        break;
      case '16-18':
        // Performance focus
        if (lowerDesc.includes('lean') || lowerDesc.includes('grilled') || lowerDesc.includes('whole')) {
          ageBonus = 10;
        }
        break;
      case '19-25':
        // Professional standards - no bonus, stricter scoring
        baseScore = baseScore * 0.95;
        break;
    }
  }

  // Calculate final score
  const finalScore = Math.min(100, Math.max(0, 
    (baseScore * (timingScore / 100)) + ageBonus
  ));

  // Determine quality category
  let quality: 'poor' | 'fair' | 'good' | 'excellent';
  if (finalScore >= 85) quality = 'excellent';
  else if (finalScore >= 70) quality = 'good';
  else if (finalScore >= 50) quality = 'fair';
  else quality = 'poor';

  // Generate suggestions
  const suggestions = generateSuggestions(quality, identifiedFoods, mealTiming, ageGroup);

  // Estimate macros (simplified)
  const macroEstimates = estimateMacros(description, identifiedFoods);

  return {
    quality,
    score: Math.round(finalScore),
    suggestions,
    ageBonus,
    identifiedFoods,
    macroEstimates,
    timingScore: mealTiming ? timingScore : undefined
  };
}

/**
 * Generates meal suggestions based on analysis
 */
function generateSuggestions(
  quality: string,
  _identifiedFoods: string[],
  timing?: MealTiming,
  ageGroup?: AgeGroup
): string[] {
  const suggestions: string[] = [];

  // Quality-based suggestions
  if (quality === 'poor') {
    suggestions.push('Try to include more whole foods and vegetables');
    suggestions.push('Reduce processed and sugary foods');
  } else if (quality === 'fair') {
    suggestions.push('Add more protein sources like lean meat or fish');
    suggestions.push('Include more colorful vegetables');
  }

  // Timing-based suggestions
  if (timing === 'pre-game') {
    suggestions.push('Focus on easily digestible carbs 2-3 hours before game');
    suggestions.push('Avoid high-fat or high-fiber foods before playing');
  } else if (timing === 'post-game') {
    suggestions.push('Include protein within 30 minutes after game');
    suggestions.push('Rehydrate with water and electrolytes');
  }

  // Age-specific suggestions
  if (ageGroup === '10-12') {
    suggestions.push('Include calcium-rich foods for bone development');
    suggestions.push('Ensure adequate hydration throughout the day');
  } else if (ageGroup === '13-15') {
    suggestions.push('Increase portion sizes to support growth spurts');
    suggestions.push('Focus on protein for muscle development');
  } else if (ageGroup === '16-18') {
    suggestions.push('Time your meals around training sessions');
    suggestions.push('Consider sports drinks only during intense training');
  } else if (ageGroup === '19-25') {
    suggestions.push('Monitor portion control for optimal body composition');
    suggestions.push('Focus on nutrient timing for recovery');
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
}

/**
 * Estimates macronutrients from food description
 */
function estimateMacros(description: string, _identifiedFoods: string[]) {
  // Simplified macro estimation
  let calories = 300; // Base calories
  let protein = 10;
  let carbs = 30;
  let fats = 10;

  const lowerDesc = description.toLowerCase();

  // Adjust based on identified foods
  if (lowerDesc.includes('chicken') || lowerDesc.includes('fish') || lowerDesc.includes('meat')) {
    protein += 25;
    calories += 150;
  }
  if (lowerDesc.includes('rice') || lowerDesc.includes('pasta') || lowerDesc.includes('bread')) {
    carbs += 40;
    calories += 160;
  }
  if (lowerDesc.includes('oil') || lowerDesc.includes('butter') || lowerDesc.includes('cheese')) {
    fats += 15;
    calories += 135;
  }
  if (lowerDesc.includes('vegetables') || lowerDesc.includes('salad')) {
    calories += 50;
    carbs += 10;
  }
  if (lowerDesc.includes('fruit')) {
    carbs += 20;
    calories += 80;
  }
  if (lowerDesc.includes('shake') || lowerDesc.includes('smoothie')) {
    protein += 20;
    carbs += 30;
    calories += 200;
  }

  // Portion size adjustments
  if (lowerDesc.includes('large') || lowerDesc.includes('big')) {
    calories *= 1.3;
    protein *= 1.3;
    carbs *= 1.3;
    fats *= 1.3;
  } else if (lowerDesc.includes('small') || lowerDesc.includes('little')) {
    calories *= 0.7;
    protein *= 0.7;
    carbs *= 0.7;
    fats *= 0.7;
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats)
  };
}

/**
 * Gets age group from age number
 */
export function getAgeGroup(age: number): AgeGroup {
  if (age <= 12) return '10-12';
  if (age <= 15) return '13-15';
  if (age <= 18) return '16-18';
  return '19-25';
}