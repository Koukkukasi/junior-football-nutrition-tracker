/**
 * Performance Correlations Component
 * Shows correlations between nutrition and performance metrics
 */

import React from 'react';
import { Activity, Moon, TrendingUp } from 'lucide-react';
import type { PerformanceCorrelation } from '../../types/analytics.types';

interface PerformanceCorrelationsProps {
  correlations: PerformanceCorrelation | null;
}

export const PerformanceCorrelations: React.FC<PerformanceCorrelationsProps> = ({ correlations }) => {
  if (!correlations) {
    return (
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="text-center py-8 text-gray-500">
          No correlation data available
        </div>
      </div>
    );
  }

  const getCorrelationStrength = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return 'Strong';
    if (absValue >= 0.4) return 'Moderate';
    return 'Weak';
  };

  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return 'text-green-600';
    if (absValue >= 0.4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Correlation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meals vs Energy */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center mb-4">
            <Activity className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Meals vs Energy</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Correlation Coefficient</p>
              <p className={`text-2xl font-bold ${getCorrelationColor(correlations.mealsVsEnergy)}`}>
                {(correlations.mealsVsEnergy * 100).toFixed(0)}%
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Strength</p>
              <p className="text-lg font-medium">
                {getCorrelationStrength(correlations.mealsVsEnergy)}
              </p>
            </div>
            
            <p className="text-sm text-gray-500">
              {correlations.mealsVsEnergy > 0
                ? 'More meals correlate with higher energy levels'
                : 'Meal frequency shows little correlation with energy'}
            </p>
          </div>
        </div>

        {/* Sleep vs Energy */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center mb-4">
            <Moon className="w-6 h-6 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold">Sleep vs Energy</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Correlation Coefficient</p>
              <p className={`text-2xl font-bold ${getCorrelationColor(correlations.sleepVsEnergy)}`}>
                {(correlations.sleepVsEnergy * 100).toFixed(0)}%
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Strength</p>
              <p className="text-lg font-medium">
                {getCorrelationStrength(correlations.sleepVsEnergy)}
              </p>
            </div>
            
            <p className="text-sm text-gray-500">
              {correlations.sleepVsEnergy > 0
                ? 'Better sleep correlates with higher energy levels'
                : 'Sleep quality shows little correlation with energy'}
            </p>
          </div>
        </div>
      </div>

      {/* Training Day Performance */}
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold">Training Day Performance</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Training Days</p>
            <p className="text-2xl font-bold text-blue-600">
              {correlations.trainingDayPerformance.trainingDays}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Avg Energy (Training)</p>
            <p className="text-2xl font-bold text-green-600">
              {correlations.trainingDayPerformance.avgEnergyOnTraining.toFixed(1)}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Avg Energy (Rest)</p>
            <p className="text-2xl font-bold text-gray-600">
              {correlations.trainingDayPerformance.avgEnergyOnRest.toFixed(1)}
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            {correlations.trainingDayPerformance.avgEnergyOnTraining > 
             correlations.trainingDayPerformance.avgEnergyOnRest
              ? '💡 Your energy levels are higher on training days - great job fueling your workouts!'
              : '⚠️ Your energy levels are lower on training days - consider improving pre-workout nutrition'}
          </p>
        </div>
      </div>
    </div>
  );
};