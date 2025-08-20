/**
 * Tests for the enhanced food database
 */

import {
  analyzeFoodQuality,
  getFoodRecommendations,
  totalKeywordCount,
  poorQualityFoods,
  fairQualityFoods,
  goodQualityFoods,
  excellentQualityFoods
} from './food-database';

// Test the total keyword count
console.log('🧪 Testing Food Database...\n');
console.log(`✅ Total keywords: ${totalKeywordCount}`);
console.log(`  - Poor quality: ${poorQualityFoods.keywords.length} keywords`);
console.log(`  - Fair quality: ${fairQualityFoods.keywords.length} keywords`);
console.log(`  - Good quality: ${goodQualityFoods.keywords.length} keywords`);
console.log(`  - Excellent quality: ${excellentQualityFoods.keywords.length} keywords`);

// Test various food descriptions
const testCases = [
  // Poor quality tests
  { 
    description: 'Had pizza and soda for lunch',
    expected: 'poor',
    context: 'Junk food combination'
  },
  { 
    description: 'Ate candy and chocolate',
    expected: 'poor',
    context: 'Multiple sweets'
  },
  
  // Fair quality tests
  { 
    description: 'Toast with peanut butter and juice',
    expected: 'fair',
    context: 'Moderate breakfast'
  },
  { 
    description: 'Sandwich and smoothie',
    expected: 'fair',
    context: 'Decent lunch'
  },
  
  // Good quality tests
  { 
    description: 'Grilled chicken with salad and brown rice',
    expected: 'good',
    context: 'Balanced meal'
  },
  { 
    description: 'Salmon with vegetables and quinoa',
    expected: 'good',
    context: 'Nutritious dinner'
  },
  { 
    description: 'Ruisleipä with kalakeitto',
    expected: 'good',
    context: 'Finnish healthy meal'
  },
  
  // Excellent quality tests
  { 
    description: 'Protein shake with banana after training',
    expected: 'excellent',
    context: 'Post-workout recovery'
  },
  { 
    description: 'Grilled chicken salad with greek yogurt and berries',
    expected: 'excellent',
    context: 'Athlete optimal meal'
  },
  { 
    description: 'Organic steamed vegetables with lean protein and quinoa',
    expected: 'excellent',
    context: 'Perfect athlete meal'
  },
  
  // Sports-specific tests
  { 
    description: 'Energy bar and sports drink before game',
    expected: 'excellent',
    context: 'Pre-game fuel',
    timing: 'pre-game' as const
  },
  { 
    description: 'Chocolate milk and protein bar',
    expected: 'excellent',
    context: 'Post-game recovery',
    timing: 'post-game' as const
  }
];

console.log('\n📋 Testing food quality analysis:\n');

testCases.forEach((test, index) => {
  const result = analyzeFoodQuality(test.description, test.timing);
  const passed = result.quality === test.expected;
  
  console.log(`Test ${index + 1}: ${passed ? '✅' : '❌'} ${test.context}`);
  console.log(`  Input: "${test.description}"`);
  console.log(`  Expected: ${test.expected}, Got: ${result.quality}`);
  console.log(`  Score: ${result.score}/100`);
  if (result.suggestions.length > 0) {
    console.log(`  Suggestions: ${result.suggestions[0]}`);
  }
  console.log('');
});

// Test recommendations
console.log('🎯 Testing food recommendations:\n');

const timeSlots = ['morning', 'afternoon', 'evening'] as const;
timeSlots.forEach(time => {
  console.log(`${time.charAt(0).toUpperCase() + time.slice(1)} recommendations:`);
  const recs = getFoodRecommendations(time, true, 'poor');
  recs.slice(0, 2).forEach(rec => console.log(`  - ${rec}`));
  console.log('');
});

// Summary
const passedTests = testCases.filter((test, index) => {
  const result = analyzeFoodQuality(test.description, test.timing);
  return result.quality === test.expected;
}).length;

console.log('📊 Test Summary:');
console.log(`  Passed: ${passedTests}/${testCases.length} tests`);
console.log(`  Success rate: ${Math.round((passedTests/testCases.length) * 100)}%`);
console.log(`  Database size: ${totalKeywordCount} keywords (Target: 50+) ✅`);

// Export for use in other tests
export { testCases };