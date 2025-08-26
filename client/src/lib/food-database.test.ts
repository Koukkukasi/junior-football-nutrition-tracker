import { describe, it, expect } from 'vitest';
import { analyzeFoodQuality } from './food-database';

describe('Food Database - analyzeFoodQuality', () => {
  describe('Food Quality Analysis', () => {
    it('should identify excellent quality foods', () => {
      const excellentFoods = [
        'Grilled chicken with quinoa and vegetables',
        'Protein shake with banana and spinach',
        'Salmon with sweet potato and broccoli',
        'Greek yogurt with berries and nuts',
        'Organic whole grain pasta with lean meat',
      ];

      excellentFoods.forEach(food => {
        const result = analyzeFoodQuality(food);
        expect(result.quality).toBe('excellent');
        expect(result.score).toBeGreaterThanOrEqual(80);
      });
    });

    it('should identify good quality foods', () => {
      const goodFoods = [
        'Chicken breast with rice',
        'Tuna sandwich on whole wheat',
        'Vegetable soup with beans',
        'Eggs with whole grain toast',
        'Turkey wrap with vegetables',
      ];

      goodFoods.forEach(food => {
        const result = analyzeFoodQuality(food);
        expect(['good', 'excellent']).toContain(result.quality);
        expect(result.score).toBeGreaterThanOrEqual(60);
      });
    });

    it('should identify fair quality foods', () => {
      const fairFoods = [
        'Regular sandwich with ham',
        'Plain pasta with butter',
        'Cereal with milk',
        'Cheese pizza slice',
        'Orange juice and toast',
      ];

      fairFoods.forEach(food => {
        const result = analyzeFoodQuality(food);
        expect(['fair', 'good']).toContain(result.quality);
        expect(result.score).toBeGreaterThanOrEqual(40);
        expect(result.score).toBeLessThan(80);
      });
    });

    it('should identify poor quality foods', () => {
      const poorFoods = [
        'Candy bar and soda',
        'Potato chips and energy drink',
        'Donuts and coffee with sugar',
        'Ice cream and cookies',
        'Fried fast food meal',
      ];

      poorFoods.forEach(food => {
        const result = analyzeFoodQuality(food);
        expect(result.quality).toBe('poor');
        expect(result.score).toBeLessThan(40);
      });
    });
  });

  describe('Age-Specific Scoring', () => {
    const testFood = 'Chicken with vegetables and rice';

    it('should apply correct multiplier for age group 10-12', () => {
      const result = analyzeFoodQuality(testFood, 'regular', 11, '10-12');
      expect(result.ageBonus).toBeDefined();
      expect(result.suggestions).toContain(expect.stringMatching(/calcium|growth/i));
    });

    it('should apply correct multiplier for age group 13-15', () => {
      const result = analyzeFoodQuality(testFood, 'regular', 14, '13-15');
      expect(result.ageBonus).toBeDefined();
      expect(result.suggestions).toContain(expect.stringMatching(/energy|protein/i));
    });

    it('should apply correct multiplier for age group 16-18', () => {
      const result = analyzeFoodQuality(testFood, 'regular', 17, '16-18');
      expect(result.ageBonus).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should apply correct multiplier for age group 19-25', () => {
      const result = analyzeFoodQuality(testFood, 'regular', 22, '19-25');
      expect(result.ageBonus).toBeDefined();
      expect(result.suggestions).toContain(expect.stringMatching(/recovery|performance/i));
    });
  });

  describe('Meal Timing Optimization', () => {
    it('should optimize pre-game meals', () => {
      const preGameMeals = [
        'Pasta with tomato sauce',
        'Rice with grilled chicken',
        'Oatmeal with banana',
        'Whole grain bread with honey',
      ];

      preGameMeals.forEach(meal => {
        const result = analyzeFoodQuality(meal, 'pre-game');
        expect(result.score).toBeGreaterThanOrEqual(60);
        expect(result.suggestions).toContain(
          expect.stringMatching(/pre-game|energy|carbs/i)
        );
      });
    });

    it('should optimize post-game meals', () => {
      const postGameMeals = [
        'Protein shake with fruits',
        'Chocolate milk and banana',
        'Turkey sandwich with vegetables',
        'Greek yogurt with granola',
      ];

      postGameMeals.forEach(meal => {
        const result = analyzeFoodQuality(meal, 'post-game');
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.suggestions).toContain(
          expect.stringMatching(/recovery|protein|post-game/i)
        );
      });
    });

    it('should handle regular meal timing', () => {
      const result = analyzeFoodQuality('Balanced meal with protein and vegetables', 'regular');
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.quality).not.toBe('poor');
    });
  });

  describe('Finnish/Nordic Foods', () => {
    it('should recognize Finnish foods', () => {
      const finnishFoods = [
        { food: 'Ruisleipä with cheese', expectedQuality: 'good' },
        { food: 'Puuro with berries', expectedQuality: 'good' },
        { food: 'Lohikeitto soup', expectedQuality: 'excellent' },
        { food: 'Kalakeitto with rye bread', expectedQuality: 'excellent' },
        { food: 'Hernekeitto and bread', expectedQuality: 'good' },
      ];

      finnishFoods.forEach(({ food, expectedQuality }) => {
        const result = analyzeFoodQuality(food);
        expect(['good', 'excellent']).toContain(result.quality);
        if (expectedQuality === 'excellent') {
          expect(result.score).toBeGreaterThanOrEqual(75);
        } else {
          expect(result.score).toBeGreaterThanOrEqual(60);
        }
      });
    });

    it('should handle Finnish treats appropriately', () => {
      const treats = [
        'Karjalanpiirakka with egg butter',
        'Pulla sweet bread',
        'Korvapuusti cinnamon roll',
      ];

      treats.forEach(treat => {
        const result = analyzeFoodQuality(treat);
        expect(['fair', 'good']).toContain(result.quality);
        expect(result.score).toBeGreaterThanOrEqual(40);
        expect(result.score).toBeLessThan(80);
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle empty input', () => {
      const result = analyzeFoodQuality('');
      expect(result.quality).toBe('poor');
      expect(result.score).toBeLessThan(30);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle very short descriptions', () => {
      const result = analyzeFoodQuality('food');
      expect(result.quality).toBe('poor');
      expect(result.score).toBeLessThan(40);
    });

    it('should handle mixed quality keywords', () => {
      const result = analyzeFoodQuality('Grilled chicken with fries and soda');
      expect(['fair', 'good']).toContain(result.quality);
      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThan(80);
    });

    it('should be case insensitive', () => {
      const lowercase = analyzeFoodQuality('grilled chicken with vegetables');
      const uppercase = analyzeFoodQuality('GRILLED CHICKEN WITH VEGETABLES');
      const mixed = analyzeFoodQuality('GriLLed CHICken with VEGETables');

      expect(lowercase.quality).toBe(uppercase.quality);
      expect(lowercase.quality).toBe(mixed.quality);
      expect(Math.abs(lowercase.score - uppercase.score)).toBeLessThan(5);
      expect(Math.abs(lowercase.score - mixed.score)).toBeLessThan(5);
    });

    it('should handle special characters', () => {
      const result = analyzeFoodQuality('Chicken & rice with vegetables!');
      expect(result.quality).not.toBe('poor');
      expect(result.score).toBeGreaterThanOrEqual(60);
    });
  });

  describe('Suggestions Generation', () => {
    it('should provide relevant suggestions for poor quality meals', () => {
      const result = analyzeFoodQuality('Candy and soda');
      expect(result.suggestions).toContain(expect.stringMatching(/avoid|replace|healthier/i));
      expect(result.suggestions.length).toBeGreaterThanOrEqual(2);
    });

    it('should provide improvement suggestions for fair quality meals', () => {
      const result = analyzeFoodQuality('Plain pasta with cheese');
      expect(result.suggestions).toContain(expect.stringMatching(/add|include|improve/i));
      expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
    });

    it('should provide maintenance suggestions for good quality meals', () => {
      const result = analyzeFoodQuality('Grilled fish with vegetables');
      expect(result.suggestions).toContain(expect.stringMatching(/good|maintain|continue/i));
    });

    it('should provide age-specific suggestions', () => {
      const youngResult = analyzeFoodQuality('Chicken sandwich', 'regular', 11, '10-12');
      const teenResult = analyzeFoodQuality('Chicken sandwich', 'regular', 15, '13-15');
      const adultResult = analyzeFoodQuality('Chicken sandwich', 'regular', 22, '19-25');

      expect(youngResult.suggestions).not.toEqual(teenResult.suggestions);
      expect(teenResult.suggestions).not.toEqual(adultResult.suggestions);
    });
  });

  describe('Performance Requirements', () => {
    it('should analyze food quickly', () => {
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        analyzeFoodQuality('Complex meal with many ingredients including proteins and vegetables');
      }
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 100;
      
      expect(avgTime).toBeLessThan(10); // Should take less than 10ms per analysis
    });

    it('should handle very long descriptions', () => {
      const longDescription = Array(100).fill('chicken vegetables rice').join(' ');
      const result = analyzeFoodQuality(longDescription);
      
      expect(result).toBeDefined();
      expect(result.quality).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });
  });
});