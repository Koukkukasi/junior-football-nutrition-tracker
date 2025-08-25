/**
 * Age-specific Nutritional Requirements
 * Tailored nutrition needs for different age groups
 */

export type AgeGroup = '10-12' | '13-15' | '16-18' | '19-25';

export interface AgeSpecificNeed {
  caloriesPerDay: number;
  proteinGramsPerKg: number;
  focus: string;
}

export const ageSpecificNeeds: Record<AgeGroup, AgeSpecificNeed> = {
  '10-12': {
    caloriesPerDay: 2000,
    proteinGramsPerKg: 1.0,
    focus: 'Growth and development, adequate calcium and iron'
  },
  '13-15': {
    caloriesPerDay: 2400,
    proteinGramsPerKg: 1.2,
    focus: 'Increased energy needs, muscle development'
  },
  '16-18': {
    caloriesPerDay: 2800,
    proteinGramsPerKg: 1.4,
    focus: 'Peak performance, muscle recovery'
  },
  '19-25': {
    caloriesPerDay: 3000,
    proteinGramsPerKg: 1.6,
    focus: 'Maintenance and optimization'
  }
};

/**
 * Get age-specific bonus points for nutrition scoring
 */
export function getAgeSpecificBonus(
  ageGroup: AgeGroup,
  quality: 'poor' | 'fair' | 'good' | 'excellent',
  description: string
): { bonus: number; suggestions: string[] } {
  const suggestions: string[] = [];
  let bonus = 0;

  switch (ageGroup) {
    case '10-12':
      // Younger players: More forgiving, encourage healthy choices
      if (quality === 'good' || quality === 'excellent') {
        bonus = 10; // Reward healthy choices more
        suggestions.push('Great job making healthy choices at your age!');
      } else if (quality === 'poor') {
        bonus = 5; // Less harsh on poor choices
        suggestions.push('Try to choose healthier options to grow strong!');
      }
      // Check for calcium-rich foods (important for this age)
      if (description.includes('milk') || description.includes('cheese') || description.includes('yogurt')) {
        bonus += 5;
        suggestions.push('Good calcium intake for strong bones!');
      }
      break;
      
    case '13-15':
      // Growth spurt age: Focus on adequate calories and protein
      if (quality === 'excellent' && description.includes('protein')) {
        bonus = 8;
        suggestions.push('Perfect for your growth and development!');
      }
      // Check for adequate portions
      if (description.includes('large') || description.includes('extra') || description.includes('double')) {
        bonus += 3;
        suggestions.push('Good portion size for your active lifestyle!');
      }
      break;
      
    case '16-18':
      // Performance age: Stricter but supportive
      if (quality === 'excellent') {
        bonus = 5;
        suggestions.push('Excellent choice for peak performance!');
      }
      // Focus on recovery foods
      if (description.includes('recovery') || description.includes('protein shake') || description.includes('chocolate milk')) {
        bonus += 5;
        suggestions.push('Great recovery choice for your training intensity!');
      }
      break;
      
    case '19-25':
      // Adult standards: No bonuses, professional expectations
      if (quality === 'poor' || quality === 'fair') {
        suggestions.push('At your age, focus on professional-level nutrition.');
      } else if (quality === 'excellent') {
        suggestions.push('Professional-level nutrition choice! Keep it up!');
      }
      break;
  }

  return { bonus, suggestions };
}

/**
 * Get hydration reminders based on age
 */
export function getAgeHydrationReminder(
  age: number,
  description: string,
  mealTiming?: 'pre-game' | 'post-game' | 'after-practice' | 'regular'
): string | null {
  const hasWater = description.includes('water') || description.includes('drink');

  if (age <= 12 && !hasWater) {
    return 'Remember to drink water with your meal!';
  } else if (age >= 16 && (mealTiming === 'post-game' || mealTiming === 'after-practice') && !hasWater) {
    return 'Don\'t forget to rehydrate after training!';
  } else if (mealTiming === 'after-practice' && !hasWater) {
    return '💧 Important: Rehydrate after practice for better recovery!';
  }

  return null;
}