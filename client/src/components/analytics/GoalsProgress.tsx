/**
 * Goals Progress Component
 * Displays user goals and their progress
 */

import React from 'react';
import { Target, Award, Calendar } from 'lucide-react';
import type { Goal } from '../../types/analytics.types';

interface GoalsProgressProps {
  goals: Goal[];
}

export const GoalsProgress: React.FC<GoalsProgressProps> = ({ goals }) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'nutrition':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'performance':
        return <Award className="w-5 h-5 text-green-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (goals.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="text-center py-8">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">No goals set yet</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create Your First Goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {goals.map((goal) => {
        const daysRemaining = getDaysRemaining(goal.deadline);
        const isOverdue = daysRemaining < 0;
        
        return (
          <div key={goal.id} className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getGoalIcon(goal.type)}
                <h3 className="ml-2 font-semibold text-lg">{goal.title}</h3>
              </div>
              {goal.progress >= 100 && (
                <Award className="w-6 h-6 text-yellow-500" />
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {goal.current} / {goal.target} {goal.unit}
                </span>
                <span className="text-sm font-medium">
                  {Math.min(goal.progress, 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(goal.progress)}`}
                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                />
              </div>
            </div>
            
            {/* Deadline */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span>
                  {new Date(goal.deadline).toLocaleDateString()}
                </span>
              </div>
              
              <span className={`font-medium ${
                isOverdue ? 'text-red-600' : 
                daysRemaining <= 7 ? 'text-yellow-600' : 
                'text-gray-600'
              }`}>
                {isOverdue 
                  ? `${Math.abs(daysRemaining)} days overdue`
                  : `${daysRemaining} days left`}
              </span>
            </div>
            
            {/* Achievement Status */}
            {goal.progress >= 100 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  🎉 Goal Achieved! Great job!
                </p>
              </div>
            )}
            
            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Edit
              </button>
              <button className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Update Progress
              </button>
            </div>
          </div>
        );
      })}
      
      {/* Add New Goal Card */}
      <div className="bg-white rounded-lg p-6 shadow border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer">
        <div className="text-center py-8">
          <Target className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 font-medium">Add New Goal</p>
          <p className="text-sm text-gray-500 mt-1">Set a new target to achieve</p>
        </div>
      </div>
    </div>
  );
};