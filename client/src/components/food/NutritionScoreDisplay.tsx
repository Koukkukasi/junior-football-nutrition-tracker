/**
 * Nutrition Score Display Component
 * Shows calculated nutrition scores with visual indicators
 */

import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import type { NutritionScore } from '../../types/food.types';

interface NutritionScoreDisplayProps {
  score: NutritionScore;
}

export const NutritionScoreDisplay: React.FC<NutritionScoreDisplayProps> = ({ score }) => {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    if (value >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (value: number) => {
    if (value >= 80) return 'bg-green-100';
    if (value >= 60) return 'bg-yellow-100';
    if (value >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getScoreMessage = (value: number) => {
    if (value >= 80) return 'Excellent nutrition! Keep it up! 🌟';
    if (value >= 60) return 'Good job! Room for improvement 💪';
    if (value >= 40) return 'Fair nutrition. Try adding more quality foods 🥗';
    return 'Needs improvement. Focus on healthier choices 🎯';
  };

  const getProgressBarColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Today's Nutrition Score</h3>
        <TrendingUp className="w-6 h-6 text-green-600" />
      </div>
      
      {/* Main Score */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBackground(score.totalScore)}`}>
            <div className="text-center">
              <span className={`text-4xl font-bold ${getScoreColor(score.totalScore)}`}>
                {score.totalScore}
              </span>
              <p className="text-xs text-gray-600 mt-1">out of 100</p>
            </div>
          </div>
          {/* Progress ring */}
          <svg className="absolute inset-0 w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${(score.totalScore / 100) * 377} 377`}
              className={getScoreColor(score.totalScore)}
            />
          </svg>
        </div>
        <p className="mt-3 text-gray-600 font-medium">{getScoreMessage(score.totalScore)}</p>
      </div>
      
      {/* Score Breakdown */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Meal Frequency</span>
            <span className="font-medium">{score.mealFrequency}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${getProgressBarColor(score.mealFrequency)} h-2.5 rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${score.mealFrequency}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">40% weight • Regular eating schedule</p>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Food Quality</span>
            <span className="font-medium">{score.foodQuality}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${getProgressBarColor(score.foodQuality)} h-2.5 rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${score.foodQuality}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">60% weight • Nutritious choices (priority)</p>
        </div>
      </div>
      
      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Pro Tip:</p>
            <p className="text-sm text-blue-700">
              {score.totalScore === 0 
                ? 'Start logging your meals to track your nutrition progress!'
                : score.foodQuality < score.mealFrequency 
                ? 'Focus on improving food quality - choose whole foods and lean proteins!'
                : score.mealFrequency < 60
                ? 'Try to eat more regularly throughout the day - aim for 5 meals!'
                : 'Great job! Keep maintaining your healthy eating habits!'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Achievement badges */}
      {score.totalScore >= 80 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-semibold text-green-800">Excellence Achieved!</p>
              <p className="text-xs text-green-700">You\'re fueling like a champion athlete!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};