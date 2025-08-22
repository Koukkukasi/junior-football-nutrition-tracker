/**
 * Food Database - Refactored Index
 * Exports all food database functionality
 */

// Re-export categories and counts
export {
  poorQualityFoods,
  fairQualityFoods,
  goodQualityFoods,
  excellentQualityFoods,
  totalKeywordCount,
  type FoodCategory
} from './food-data/food-categories';

// Re-export timing-based foods
export {
  timingBasedFoods,
  type TimingFood
} from './food-data/timing-foods';

// Re-export age-specific needs
export {
  ageSpecificNeeds,
  getAgeSpecificBonus,
  getAgeHydrationReminder,
  type AgeGroup,
  type AgeSpecificNeed
} from './food-data/age-specific';

// Re-export analyzer functions
export {
  analyzeFoodQuality,
  getFoodRecommendations,
  type FoodQuality,
  type MealTiming,
  type FoodAnalysis
} from './food-analyzer';

// Food database initialized with keywords count tracked in totalKeywordCount variable