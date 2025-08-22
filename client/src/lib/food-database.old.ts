/**
 * Comprehensive Food Database for Junior Football Players
 * Categorized by nutritional quality and sports performance impact
 */

export interface FoodCategory {
  keywords: string[];
  description: string;
}

// Poor Quality Foods (0-25 points) - Should be limited
export const poorQualityFoods: FoodCategory = {
  keywords: [
    // Original junk foods
    'candy', 'sweets', 'chips', 'soda', 'cola', 'burger', 'fries', 
    'pizza', 'donut', 'cake', 'chocolate', 'ice cream', 'fast food',
    // Additional poor choices
    'cookies', 'pastry', 'fried', 'deep fried', 'milkshake', 
    'sugary', 'processed', 'instant noodles',
    'white bread', 'croissant', 'muffin', 'brownie',
    // Restaurant chains and fast food
    'mcdonald', 'burger king', 'kfc', 'subway cookies', 'taco bell',
    'hesburger', 'kotipizza', 'chicken wings', 'onion rings',
    // More poor snacks and drinks
    'monster', 'red bull', 'gummy bears', 'liquorice',
    'salmiakki', 'fazer chocolate', 'marabou', 'haribo',
    'carbonated drink', 'sprite', 'fanta', 'pepsi'
  ],
  description: 'High sugar, high fat, low nutritional value'
};

// Fair Quality Foods (26-50 points) - Acceptable occasionally
export const fairQualityFoods: FoodCategory = {
  keywords: [
    // Moderate choices
    'sandwich', 'toast', 'cereal', 'juice', 'smoothie',
    'pancakes', 'waffles', 'bagel', 'crackers', 'popcorn',
    'granola bar', 'trail mix', 'dried fruit', 'jam',
    'honey', 'maple syrup', 'peanut butter', 'cheese',
    // Finnish/Nordic foods (moderate)
    'pulla', 'korvapuusti', 'munkki', 'laskiaispulla',
    'mämmi', 'vispipuuro', 'riisipuuro', 'mannapuuro',
    // Restaurant healthier options
    'subway sandwich', 'pizza salad', 'wrap', 'quesadilla',
    'pasta salad', 'soup', 'chili', 'baked potato',
    // Age-appropriate snacks
    'fruit snacks', 'rice cakes', 'pretzels', 'string cheese',
    'chocolate milk', 'fruit juice', 'sports drink diluted', 'energy drink',
    'muesli', 'cornflakes', 'granola', 'oat cookies'
  ],
  description: 'Moderate nutritional value, okay in moderation'
};

// Good Quality Foods (51-75 points) - Regular consumption
export const goodQualityFoods: FoodCategory = {
  keywords: [
    // Original healthy foods
    'vegetable', 'fruit', 'salad', 'chicken', 'fish', 'rice', 
    'oatmeal', 'eggs', 'milk', 'yogurt', 'nuts', 'beans', 'whole grain', 'water',
    // Additional good choices
    'turkey', 'lean meat', 'tuna', 'salmon', 'cottage cheese',
    'quinoa', 'brown rice', 'sweet potato', 'avocado', 'berries',
    'banana', 'apple', 'orange', 'grapes', 'melon',
    // Nordic/Finnish healthy foods
    'rye bread', 'ruisleipä', 'porridge', 'puuro', 'kalakeitto',
    'lohikeitto', 'hernekeitto', 'makaronilaatikko', 'karjalanpiirakka',
    'lihapullat', 'jauhelihakastike', 'kalapuikot', 'mustikka', 'lakka',
    'tyrni', 'peruna', 'porkkana', 'kaali', 'sipuli',
    // More sports-friendly foods
    'whole wheat bread', 'lean pork', 'lean beef', 'cod', 'mackerel',
    'almonds', 'walnuts', 'cashews', 'pumpkin seeds', 'sunflower seeds',
    'strawberries', 'raspberries', 'blackberries', 'kiwi', 'pear',
    'broccoli', 'cauliflower', 'zucchini', 'bell pepper', 'tomato',
    // Hydration
    'water', 'coconut water', 'herbal tea', 'green tea', 'sparkling water',
    'low fat milk', 'plant milk', 'kombucha', 'electrolyte water'
  ],
  description: 'Nutritious choices supporting athletic performance'
};

// Excellent Quality Foods (76-100 points) - Optimal for athletes
export const excellentQualityFoods: FoodCategory = {
  keywords: [
    // Original excellent indicators
    'protein', 'vitamins', 'balanced', 'grilled', 'steamed', 'fresh', 'organic',
    // Sports-specific excellent choices
    'protein shake', 'whey protein', 'recovery drink', 'electrolytes',
    'sports drink', 'protein bar', 'bcaa', 'creatine',
    'lean protein', 'complex carbs', 'omega-3', 'antioxidants',
    'superfood', 'kale', 'spinach', 'broccoli', 'blueberries',
    'chia seeds', 'flax seeds', 'hemp seeds', 'spirulina',
    // Pre/Post game optimal
    'pasta with vegetables', 'grilled chicken salad', 'salmon with rice',
    'protein smoothie', 'greek yogurt', 'overnight oats',
    'whole wheat pasta', 'lean beef', 'tofu', 'tempeh',
    // Finnish athlete foods
    'kaurapuuro', 'rahka', 'viili', 'skyr', 'kefiiri',
    'siemennäkkileipä', 'täysjyväleipä', 'paistettu kala',
    // Advanced sports nutrition
    'casein protein', 'amino acids', 'glutamine', 'beta alanine',
    'nitric oxide', 'pre workout', 'post workout', 'mass gainer',
    'hydration mix', 'isotonic drink', 'hypotonic drink',
    // Timing-specific excellence
    'carb loading', 'protein timing', 'nutrient timing',
    'recovery nutrition', 'endurance fuel', 'power meal',
    // Premium whole foods
    'wild salmon', 'grass fed beef', 'free range eggs',
    'ancient grains', 'fermented foods', 'probiotic',
    'collagen protein', 'bone broth', 'matcha'
  ],
  description: 'Optimal nutrition for peak athletic performance'
};

// Timing-based food categories for football players
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

// Age-specific nutritional needs
export const ageSpecificNeeds = {
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

// Enhanced food quality analyzer with age-specific scoring
export function analyzeFoodQuality(
  description: string,
  mealTiming?: 'pre-game' | 'post-game' | 'regular',
  playerAge?: number,
  ageGroup?: '10-12' | '13-15' | '16-18' | '19-25'
): {
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  score: number;
  suggestions: string[];
  ageBonus?: number;
} {
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
  let quality: 'poor' | 'fair' | 'good' | 'excellent' = 'fair';
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
  
  // Age-specific adjustments
  if (playerAge) {
    if (playerAge <= 12) {
      if (!desc.includes('milk') && !desc.includes('dairy') && !desc.includes('cheese')) {
        suggestions.push('Remember to include calcium-rich foods for bone growth!');
      }
    } else if (playerAge >= 16) {
      if (excellentCount < 1) {
        suggestions.push('At your age, focus on protein for muscle recovery.');
      }
    }
  }
  
  // Apply age-specific adjustments
  let ageBonus = 0;
  if (ageGroup) {
    switch (ageGroup) {
      case '10-12':
        // Younger players: More forgiving, encourage healthy choices
        if (quality === 'good' || quality === 'excellent') {
          ageBonus = 10; // Reward healthy choices more
          suggestions.push('Great job making healthy choices at your age!');
        } else if (quality === 'poor') {
          score = Math.max(score, 20); // Less harsh on poor choices
          suggestions.push('Try to choose healthier options to grow strong!');
        }
        // Check for calcium-rich foods (important for this age)
        if (desc.includes('milk') || desc.includes('cheese') || desc.includes('yogurt')) {
          ageBonus += 5;
          suggestions.push('Good calcium intake for strong bones!');
        }
        break;
        
      case '13-15':
        // Growth spurt age: Focus on adequate calories and protein
        if (excellentCount > 0 && desc.includes('protein')) {
          ageBonus = 8;
          suggestions.push('Perfect for your growth and development!');
        }
        // Check for adequate portions
        if (desc.includes('large') || desc.includes('extra') || desc.includes('double')) {
          ageBonus += 3;
          suggestions.push('Good portion size for your active lifestyle!');
        }
        break;
        
      case '16-18':
        // Performance age: Stricter but supportive
        if (quality === 'excellent' && mealTiming !== 'regular') {
          ageBonus = 5;
          suggestions.push('Excellent timing and food choice for peak performance!');
        }
        // Focus on recovery foods
        if (desc.includes('recovery') || desc.includes('protein shake') || desc.includes('chocolate milk')) {
          ageBonus += 5;
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
    
    // Apply age bonus to final score
    score = Math.min(100, score + ageBonus);
  }
  
  // Age-specific hydration reminders
  if (playerAge) {
    if (playerAge <= 12 && !desc.includes('water') && !desc.includes('drink')) {
      suggestions.push('Remember to drink water with your meal!');
    } else if (playerAge >= 16 && mealTiming === 'post-game' && !desc.includes('drink')) {
      suggestions.push('Don\'t forget to rehydrate after training!');
    }
  }
  
  return { quality, score, suggestions, ageBonus };
}

// Get food recommendations based on time of day and activity
export function getFoodRecommendations(
  timeOfDay: 'morning' | 'afternoon' | 'evening',
  isTrainingDay: boolean,
  lastMealQuality?: 'poor' | 'fair' | 'good' | 'excellent'
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

// Export total keyword count for tracking
export const totalKeywordCount = 
  poorQualityFoods.keywords.length + 
  fairQualityFoods.keywords.length + 
  goodQualityFoods.keywords.length + 
  excellentQualityFoods.keywords.length;

// Food database initialized with keywords count tracked in totalKeywordCount variable