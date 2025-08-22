/**
 * Food Categories Data
 * Contains all food keywords organized by quality level
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

// Calculate total keyword count
export const totalKeywordCount = 
  poorQualityFoods.keywords.length + 
  fairQualityFoods.keywords.length + 
  goodQualityFoods.keywords.length + 
  excellentQualityFoods.keywords.length;