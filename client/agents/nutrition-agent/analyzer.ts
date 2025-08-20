/**
 * Nutrition Analysis Agent
 * Analyzes food entries and provides nutrition insights
 */

interface FoodItem {
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface NutritionAnalysis {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  macros: MacroNutrients;
  recommendations: string[];
  warnings: string[];
}

interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
}

interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
}

export class NutritionAgent {
  private readonly foodDatabase: Map<string, FoodItem> = new Map();
  private readonly healthyKeywords: Set<string>;
  private readonly unhealthyKeywords: Set<string>;
  
  constructor() {
    this.initializeFoodDatabase();
    this.healthyKeywords = new Set([
      'vegetable', 'fruit', 'salad', 'grilled', 'steamed', 'baked',
      'chicken', 'fish', 'salmon', 'tuna', 'eggs', 'yogurt',
      'oatmeal', 'quinoa', 'brown rice', 'whole grain', 'whole wheat',
      'nuts', 'almonds', 'walnuts', 'beans', 'lentils',
      'water', 'milk', 'fresh', 'organic', 'lean', 'protein'
    ]);
    
    this.unhealthyKeywords = new Set([
      'fried', 'deep fried', 'candy', 'sweets', 'chocolate', 'chips',
      'soda', 'cola', 'burger', 'fries', 'pizza', 'donut', 'cake',
      'ice cream', 'fast food', 'processed', 'sugary', 'junk'
    ]);
  }

  /**
   * Initialize food database with common foods
   */
  private initializeFoodDatabase(): void {
    // Breakfast foods
    this.foodDatabase.set('oatmeal', { 
      name: 'oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4 
    });
    this.foodDatabase.set('eggs', { 
      name: 'eggs', calories: 140, protein: 12, carbs: 1, fat: 10 
    });
    this.foodDatabase.set('toast', { 
      name: 'toast', calories: 80, protein: 3, carbs: 15, fat: 1 
    });
    this.foodDatabase.set('banana', { 
      name: 'banana', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3 
    });
    
    // Proteins
    this.foodDatabase.set('chicken', { 
      name: 'chicken', calories: 165, protein: 31, carbs: 0, fat: 4 
    });
    this.foodDatabase.set('salmon', { 
      name: 'salmon', calories: 200, protein: 28, carbs: 0, fat: 9 
    });
    this.foodDatabase.set('beef', { 
      name: 'beef', calories: 250, protein: 26, carbs: 0, fat: 15 
    });
    
    // Vegetables
    this.foodDatabase.set('salad', { 
      name: 'salad', calories: 20, protein: 1, carbs: 4, fat: 0, fiber: 2 
    });
    this.foodDatabase.set('broccoli', { 
      name: 'broccoli', calories: 35, protein: 3, carbs: 7, fat: 0, fiber: 3 
    });
    this.foodDatabase.set('vegetables', { 
      name: 'vegetables', calories: 30, protein: 2, carbs: 6, fat: 0, fiber: 2 
    });
    
    // Junk food
    this.foodDatabase.set('burger', { 
      name: 'burger', calories: 550, protein: 25, carbs: 45, fat: 30, sodium: 1200 
    });
    this.foodDatabase.set('fries', { 
      name: 'fries', calories: 365, protein: 4, carbs: 48, fat: 17, sodium: 300 
    });
    this.foodDatabase.set('pizza', { 
      name: 'pizza', calories: 285, protein: 12, carbs: 36, fat: 10, sodium: 640 
    });
    this.foodDatabase.set('chips', { 
      name: 'chips', calories: 150, protein: 2, carbs: 15, fat: 10, sodium: 180 
    });
    this.foodDatabase.set('soda', { 
      name: 'soda', calories: 140, protein: 0, carbs: 39, fat: 0, sugar: 39 
    });
  }

  /**
   * Analyze food description and return nutrition analysis
   */
  analyzeFood(description: string): NutritionAnalysis {
    const lowerDesc = description.toLowerCase();
    const quality = this.assessFoodQuality(lowerDesc);
    const score = this.calculateNutritionScore(lowerDesc);
    const macros = this.estimateMacros(lowerDesc);
    const recommendations = this.generateRecommendations(quality, macros);
    const warnings = this.identifyWarnings(lowerDesc, macros);

    return {
      quality,
      score,
      macros,
      recommendations,
      warnings
    };
  }

  /**
   * Assess food quality based on description
   */
  private assessFoodQuality(description: string): 'excellent' | 'good' | 'fair' | 'poor' {
    let healthyCount = 0;
    let unhealthyCount = 0;
    
    // Count healthy keywords
    for (const keyword of this.healthyKeywords) {
      if (description.includes(keyword)) {
        healthyCount++;
      }
    }
    
    // Count unhealthy keywords
    for (const keyword of this.unhealthyKeywords) {
      if (description.includes(keyword)) {
        unhealthyCount++;
      }
    }
    
    // Special case for explicit junk food mention
    if (description.includes('junk')) {
      return 'poor';
    }
    
    // Determine quality based on counts
    if (unhealthyCount >= 3 || (unhealthyCount > healthyCount && unhealthyCount >= 2)) {
      return 'poor';
    }
    
    if (healthyCount >= 4 && unhealthyCount === 0) {
      return 'excellent';
    }
    
    if (healthyCount >= 2 && unhealthyCount <= 1) {
      return 'good';
    }
    
    return 'fair';
  }

  /**
   * Calculate nutrition score (0-100)
   */
  private calculateNutritionScore(description: string): number {
    const quality = this.assessFoodQuality(description);
    const baseScores = {
      'excellent': 90,
      'good': 75,
      'fair': 50,
      'poor': 25
    };
    
    let score = baseScores[quality];
    
    // Bonus points for specific nutrients
    if (description.includes('protein')) score += 5;
    if (description.includes('fiber')) score += 5;
    if (description.includes('vitamins')) score += 5;
    if (description.includes('whole grain')) score += 5;
    if (description.includes('organic')) score += 3;
    
    // Penalty for bad ingredients
    if (description.includes('sugar')) score -= 10;
    if (description.includes('fried')) score -= 10;
    if (description.includes('processed')) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estimate macronutrients from description
   */
  private estimateMacros(description: string): MacroNutrients {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    // Find matching foods in database
    for (const [key, food] of this.foodDatabase) {
      if (description.includes(key)) {
        totalCalories += food.calories || 0;
        totalProtein += food.protein || 0;
        totalCarbs += food.carbs || 0;
        totalFat += food.fat || 0;
      }
    }
    
    // If no matches, provide estimates based on meal type
    if (totalCalories === 0) {
      const quality = this.assessFoodQuality(description);
      switch (quality) {
        case 'excellent':
          totalCalories = 400;
          totalProtein = 30;
          totalCarbs = 45;
          totalFat = 10;
          break;
        case 'good':
          totalCalories = 450;
          totalProtein = 25;
          totalCarbs = 55;
          totalFat = 15;
          break;
        case 'fair':
          totalCalories = 500;
          totalProtein = 20;
          totalCarbs = 60;
          totalFat = 20;
          break;
        case 'poor':
          totalCalories = 650;
          totalProtein = 15;
          totalCarbs = 75;
          totalFat = 35;
          break;
      }
    }
    
    // Calculate percentages
    const totalMacros = (totalProtein * 4) + (totalCarbs * 4) + (totalFat * 9);
    const proteinPercentage = totalMacros > 0 ? ((totalProtein * 4) / totalMacros) * 100 : 0;
    const carbsPercentage = totalMacros > 0 ? ((totalCarbs * 4) / totalMacros) * 100 : 0;
    const fatPercentage = totalMacros > 0 ? ((totalFat * 9) / totalMacros) * 100 : 0;
    
    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      proteinPercentage: Math.round(proteinPercentage),
      carbsPercentage: Math.round(carbsPercentage),
      fatPercentage: Math.round(fatPercentage)
    };
  }

  /**
   * Generate nutrition recommendations
   */
  private generateRecommendations(quality: string, macros: MacroNutrients): string[] {
    const recommendations: string[] = [];
    
    // Quality-based recommendations
    switch (quality) {
      case 'poor':
        recommendations.push('Try to reduce processed and fried foods');
        recommendations.push('Add more vegetables and fruits to your meals');
        recommendations.push('Choose water instead of sugary drinks');
        break;
      case 'fair':
        recommendations.push('Good start! Try adding more vegetables');
        recommendations.push('Consider whole grain alternatives');
        break;
      case 'good':
        recommendations.push('Great choices! Keep up the balanced eating');
        recommendations.push('Consider adding some nuts or seeds for healthy fats');
        break;
      case 'excellent':
        recommendations.push('Excellent nutrition choices!');
        recommendations.push('Your meal is well-balanced and nutritious');
        break;
    }
    
    // Macro-based recommendations
    if (macros.proteinPercentage < 20) {
      recommendations.push('Consider adding more protein sources');
    }
    if (macros.fatPercentage > 40) {
      recommendations.push('This meal is high in fat - balance with lower fat options later');
    }
    if (macros.calories > 800) {
      recommendations.push('This is a high-calorie meal - adjust portion sizes if needed');
    }
    
    return recommendations;
  }

  /**
   * Identify nutrition warnings
   */
  private identifyWarnings(description: string, macros: MacroNutrients): string[] {
    const warnings: string[] = [];
    
    // Check for high-risk foods
    if (description.includes('raw') && !description.includes('vegetable')) {
      warnings.push('⚠️ Be careful with raw foods - ensure proper food safety');
    }
    
    if (description.includes('energy drink') || description.includes('caffeine')) {
      warnings.push('⚠️ High caffeine content - limit intake for young athletes');
    }
    
    // Check macros
    if (macros.calories > 1000) {
      warnings.push('⚠️ Very high calorie meal - may affect performance if eaten before training');
    }
    
    if (macros.fatPercentage > 50) {
      warnings.push('⚠️ Very high fat content - may cause digestive discomfort');
    }
    
    // Check for allergens
    const allergens = ['peanut', 'nut', 'dairy', 'gluten', 'egg', 'soy'];
    for (const allergen of allergens) {
      if (description.includes(allergen)) {
        warnings.push(`ℹ️ Contains ${allergen} - be aware if you have allergies`);
      }
    }
    
    return warnings;
  }

  /**
   * Calculate daily nutrition goals for a junior athlete
   */
  calculateDailyGoals(age: number, weight: number, height: number, gender: 'male' | 'female', activityLevel: 'low' | 'moderate' | 'high'): DailyGoals {
    // Basic metabolic rate calculation
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // Activity multiplier
    const activityMultipliers = {
      'low': 1.375,
      'moderate': 1.55,
      'high': 1.725
    };
    
    const dailyCalories = Math.round(bmr * activityMultipliers[activityLevel]);
    
    // Calculate macros (for young athletes)
    const proteinGrams = Math.round(weight * 1.6); // 1.6g per kg for athletes
    const fatGrams = Math.round((dailyCalories * 0.30) / 9); // 30% from fat
    const carbGrams = Math.round((dailyCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);
    
    return {
      calories: dailyCalories,
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams,
      fiber: 25, // General recommendation
      water: Math.round(weight * 35) // 35ml per kg body weight
    };
  }

  /**
   * Analyze meal timing for sports performance
   */
  analyzeMealTiming(mealTime: string, trainingTime: string, mealType: string): { optimal: boolean; advice: string } {
    const meal = new Date(`2024-01-01 ${mealTime}`);
    const training = new Date(`2024-01-01 ${trainingTime}`);
    const hoursBeforeTraining = (training.getTime() - meal.getTime()) / (1000 * 60 * 60);
    
    let optimal = false;
    let advice = '';
    
    if (hoursBeforeTraining > 0 && hoursBeforeTraining <= 4) {
      // Pre-training meal
      if (hoursBeforeTraining >= 2 && hoursBeforeTraining <= 3) {
        optimal = true;
        advice = 'Perfect timing for pre-training meal';
      } else if (hoursBeforeTraining < 1) {
        advice = 'Too close to training - may cause discomfort';
      } else {
        advice = 'Good timing, focus on easily digestible foods';
      }
    } else if (hoursBeforeTraining < 0 && hoursBeforeTraining >= -2) {
      // Post-training meal
      if (hoursBeforeTraining >= -1) {
        optimal = true;
        advice = 'Excellent post-training recovery window';
      } else {
        advice = 'Good for recovery, include protein and carbs';
      }
    } else {
      advice = 'General meal - maintain balanced nutrition';
    }
    
    return { optimal, advice };
  }

  /**
   * Generate meal suggestions based on time and activity
   */
  suggestMeal(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', beforeTraining: boolean = false): string[] {
    const suggestions: string[] = [];
    
    switch (mealType) {
      case 'breakfast':
        if (beforeTraining) {
          suggestions.push('Oatmeal with banana and honey');
          suggestions.push('Whole grain toast with peanut butter');
          suggestions.push('Greek yogurt with granola and berries');
        } else {
          suggestions.push('Scrambled eggs with whole grain toast');
          suggestions.push('Overnight oats with nuts and fruits');
          suggestions.push('Smoothie bowl with protein powder');
        }
        break;
        
      case 'lunch':
        suggestions.push('Grilled chicken with brown rice and vegetables');
        suggestions.push('Tuna sandwich with salad');
        suggestions.push('Quinoa bowl with beans and avocado');
        break;
        
      case 'dinner':
        suggestions.push('Baked salmon with sweet potato and broccoli');
        suggestions.push('Lean beef stir-fry with vegetables');
        suggestions.push('Pasta with turkey meatballs and tomato sauce');
        break;
        
      case 'snack':
        if (beforeTraining) {
          suggestions.push('Banana with almond butter');
          suggestions.push('Energy bar and sports drink');
          suggestions.push('Apple slices with honey');
        } else {
          suggestions.push('Trail mix with dried fruits');
          suggestions.push('Protein shake with fruit');
          suggestions.push('Hummus with vegetable sticks');
        }
        break;
    }
    
    return suggestions;
  }
}

export default NutritionAgent;