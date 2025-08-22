/**
 * Timing-based Food Categories
 * Foods optimized for different times relative to training/games
 */

export interface TimingFood {
  keywords: string[];
  timing: string;
  description: string;
}

export const timingBasedFoods = {
  preGame: {
    keywords: [
      'pasta', 'rice', 'banana', 'toast with honey', 'oatmeal',
      'energy bar', 'bagel', 'fruit', 'sports drink', 'water',
      'puuro', 'kaurapuuro', 'riisipuuro', 'pannukakku', 'smoothie bowl',
      'whole grain toast', 'dates', 'raisins', 'energy balls'
    ],
    timing: '2-3 hours before',
    description: 'High carbs, low fat, easy to digest'
  },
  
  duringGame: {
    keywords: [
      'water', 'sports drink', 'banana', 'orange slices',
      'energy gel', 'isotonic drink', 'electrolyte drink',
      'diluted juice', 'coconut water', 'hydration salts',
      'grape slices', 'watermelon', 'cantaloupe'
    ],
    timing: 'Halftime or breaks',
    description: 'Quick energy and hydration'
  },
  
  postGame: {
    keywords: [
      'chocolate milk', 'protein shake', 'recovery drink',
      'chicken sandwich', 'tuna sandwich', 'protein bar',
      'greek yogurt', 'nuts and fruit', 'smoothie bowl',
      'rahka', 'viili', 'kefir', 'turkey wrap', 'egg sandwich',
      'quinoa salad', 'cottage cheese with berries'
    ],
    timing: 'Within 30 minutes',
    description: 'Protein and carbs for recovery'
  },
  
  recovery: {
    keywords: [
      'grilled chicken', 'salmon', 'eggs', 'quinoa bowl',
      'turkey wrap', 'protein smoothie', 'cottage cheese',
      'lean beef', 'fish and rice', 'protein pancakes',
      'lohikeitto', 'jauhelihakastike', 'lihapullat',
      'grilled fish', 'chicken salad', 'beef stir fry',
      'tofu scramble', 'tempeh bowl', 'legume curry'
    ],
    timing: '1-2 hours after',
    description: 'Complete meal for muscle recovery'
  }
};