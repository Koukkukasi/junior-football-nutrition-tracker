/**
 * Food Database Service
 * Comprehensive food categorization for nutrition analysis
 */

export interface FoodCategory {
  keywords: string[];
  description: string;
}

export const foodDatabase: Record<string, FoodCategory> = {
  excellent: {
    keywords: [
      // Proteins
      'grilled chicken', 'lean beef', 'salmon', 'tuna', 'turkey', 'eggs',
      'protein shake', 'greek yogurt', 'cottage cheese', 'tofu', 'quinoa',
      
      // Complex carbs
      'brown rice', 'sweet potato', 'whole grain', 'oatmeal', 'whole wheat',
      
      // Vegetables & fruits
      'broccoli', 'spinach', 'kale', 'vegetables', 'salad', 'berries',
      'avocado', 'organic', 'fresh fruit',
      
      // Hydration & recovery
      'water', 'coconut water', 'electrolytes', 'sports drink',
      
      // Nordic/Finnish healthy
      'ruisleipä', 'porridge', 'puuro', 'salmon soup', 'lohikeitto',
      'nordic berries', 'lingonberry', 'blueberry'
    ],
    description: 'Optimal nutrition choices for athletic performance'
  },
  
  good: {
    keywords: [
      // Proteins
      'chicken', 'beef', 'pork', 'fish', 'beans', 'lentils', 'milk',
      'cheese', 'yogurt', 'nuts', 'peanut butter',
      
      // Carbs
      'rice', 'pasta', 'potatoes', 'bread', 'cereal',
      
      // Fruits
      'apple', 'banana', 'orange', 'grapes', 'melon',
      
      // Meals
      'sandwich', 'wrap', 'soup', 'stew',
      
      // Finnish good foods
      'maitorahka', 'viili', 'piimä', 'karjalanpiirakka', 'kalakeitto'
    ],
    description: 'Good nutritional choices for regular training'
  },
  
  fair: {
    keywords: [
      // Moderate proteins
      'processed meat', 'sausage', 'bacon', 'hot dog',
      
      // Simple carbs
      'white bread', 'white rice', 'crackers', 'pretzels',
      
      // Beverages
      'juice', 'smoothie', 'chocolate milk', 'tea', 'coffee',
      
      // Snacks
      'granola bar', 'muffin', 'bagel', 'pancakes',
      
      // Finnish moderate
      'pulla', 'korvapuusti', 'munkki', 'lihapiirakka'
    ],
    description: 'Moderate choices - okay in moderation'
  },
  
  poor: {
    keywords: [
      // Junk food
      'chips', 'candy', 'chocolate', 'cookies', 'cake', 'ice cream',
      'donut', 'pastry',
      
      // Fast food
      'pizza', 'burger', 'fries', 'fried', 'deep fried', 'nuggets',
      
      // Sugary drinks
      'soda', 'cola', 'energy drink', 'sugary', 'sweet drink',
      
      // Processed
      'instant noodles', 'microwave meal', 'frozen pizza',
      
      // Finnish unhealthy
      'karkit', 'sipsit', 'limsa', 'ES', 'megaforce'
    ],
    description: 'Poor nutritional choices - limit consumption'
  }
};

/**
 * Timing-specific food recommendations
 */
export const timingFoods = {
  preGame: {
    optimal: [
      'pasta with tomato sauce', 'rice with vegetables', 'oatmeal with banana',
      'whole grain toast', 'fruit smoothie', 'energy bar', 'sports drink'
    ],
    avoid: [
      'fried foods', 'heavy cream', 'high fiber', 'spicy food', 'carbonated drinks'
    ]
  },
  postGame: {
    optimal: [
      'protein shake', 'chocolate milk', 'chicken and rice', 'tuna sandwich',
      'greek yogurt with fruit', 'recovery drink', 'eggs and toast'
    ],
    focus: 'Protein and carbs within 30 minutes'
  },
  regular: {
    optimal: [
      'balanced meals', 'variety of colors', 'lean proteins', 'whole grains',
      'fruits and vegetables'
    ],
    focus: 'Consistent meal timing and balanced nutrition'
  }
};

/**
 * Age-specific nutritional needs
 */
export const ageSpecificNeeds = {
  '10-12': {
    focus: ['calcium', 'vitamin D', 'iron', 'whole grains'],
    calories: '2000-2200',
    protein: '45-50g',
    special: 'Higher calcium needs for bone development'
  },
  '13-15': {
    focus: ['protein', 'iron', 'calcium', 'zinc'],
    calories: '2400-2800',
    protein: '55-65g',
    special: 'Increased needs during growth spurts'
  },
  '16-18': {
    focus: ['protein', 'complex carbs', 'healthy fats'],
    calories: '2800-3200',
    protein: '65-75g',
    special: 'Peak athletic performance nutrition'
  },
  '19-25': {
    focus: ['lean protein', 'nutrient timing', 'hydration'],
    calories: '2800-3000',
    protein: '70-85g',
    special: 'Professional athlete nutrition standards'
  }
};

/**
 * Get all food keywords for validation
 */
export function getAllFoodKeywords(): string[] {
  const keywords: string[] = [];
  Object.values(foodDatabase).forEach(category => {
    keywords.push(...category.keywords);
  });
  return keywords;
}

/**
 * Search for foods by keyword
 */
export function searchFoods(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const matches: string[] = [];
  
  Object.values(foodDatabase).forEach(category => {
    category.keywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(lowerQuery)) {
        matches.push(keyword);
      }
    });
  });
  
  return matches;
}

/**
 * Get food category by keyword
 */
export function getFoodCategory(keyword: string): string | null {
  const lowerKeyword = keyword.toLowerCase();
  
  for (const [category, data] of Object.entries(foodDatabase)) {
    if (data.keywords.some(k => k.toLowerCase() === lowerKeyword)) {
      return category;
    }
  }
  
  return null;
}