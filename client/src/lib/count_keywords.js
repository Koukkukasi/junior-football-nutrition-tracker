
// Simple counter script
const fs = require('fs');
const content = fs.readFileSync('food-database.ts', 'utf8');

// Count keywords manually by looking at the arrays
const lines = content.split('\n');
let currentCategory = '';
let counts = {
  poor: 0,
  fair: 0,
  good: 0,
  excellent: 0
};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('poorQualityFoods')) currentCategory = 'poor';
  else if (line.includes('fairQualityFoods')) currentCategory = 'fair';
  else if (line.includes('goodQualityFoods')) currentCategory = 'good';
  else if (line.includes('excellentQualityFoods')) currentCategory = 'excellent';
  else if (line.includes('description:')) currentCategory = '';
  
  if (currentCategory && line.includes("'") && \!line.includes('//') && line.includes(',')) {
    // Count single quotes (each keyword is in quotes)
    const matches = line.match(/'/g) || [];
    counts[currentCategory] += matches.length / 2; // Each keyword has 2 quotes
  }
}

console.log('Food Database Keyword Count:');
console.log('Poor Quality Foods:', counts.poor);
console.log('Fair Quality Foods:', counts.fair);
console.log('Good Quality Foods:', counts.good);
console.log('Excellent Quality Foods:', counts.excellent);
console.log('TOTAL:', counts.poor + counts.fair + counts.good + counts.excellent);

