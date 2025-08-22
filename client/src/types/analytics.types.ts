/**
 * Type definitions for Analytics module
 */

export interface NutritionTrend {
  date: string;
  mealCount: number;
  qualityScore: number;
  mealCompletion: number;
}

export interface PerformanceCorrelation {
  mealsVsEnergy: number;
  sleepVsEnergy: number;
  trainingDayPerformance: {
    trainingDays: number;
    avgEnergyOnTraining: number;
    avgEnergyOnRest: number;
  };
}

export interface Recommendation {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
}

export interface Goal {
  id: string;
  type: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
  deadline: string;
}

export interface AnalyticsSummary {
  totalMeals: number;
  avgQualityScore: number;
  avgMealCompletion: number;
  trend: 'improving' | 'stable' | 'declining';
}

export type Period = '7d' | '30d' | '90d';
export type TabType = 'trends' | 'correlations' | 'recommendations' | 'goals';