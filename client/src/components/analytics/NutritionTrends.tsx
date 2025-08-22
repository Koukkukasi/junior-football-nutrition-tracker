/**
 * Nutrition Trends Component
 * Displays nutrition trends over time
 */

import React from 'react';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import type { NutritionTrend, AnalyticsSummary } from '../../types/analytics.types';

interface NutritionTrendsProps {
  trends: NutritionTrend[];
  summary: AnalyticsSummary | null;
}

export const NutritionTrends: React.FC<NutritionTrendsProps> = ({ trends, summary }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'declining':
        return <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Meals</p>
                <p className="text-2xl font-bold">{summary.totalMeals}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Quality Score</p>
                <p className="text-2xl font-bold">{summary.avgQualityScore}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trend</p>
                <p className="text-2xl font-bold capitalize">{summary.trend}</p>
              </div>
              {getTrendIcon(summary.trend)}
            </div>
          </div>
        </div>
      )}

      {/* Trends Chart */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Daily Nutrition Trends</h3>
        
        {trends.length > 0 ? (
          <div className="space-y-4">
            {trends.map((trend, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {new Date(trend.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium">
                    {trend.mealCount} meals
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Quality Score</span>
                      <span>{trend.qualityScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${trend.qualityScore}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Meal Completion</span>
                      <span>{trend.mealCompletion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${trend.mealCompletion}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No nutrition data available for this period
          </div>
        )}
      </div>
    </div>
  );
};