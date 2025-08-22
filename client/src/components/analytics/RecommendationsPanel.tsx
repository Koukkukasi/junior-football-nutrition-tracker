/**
 * Recommendations Panel Component
 * Displays personalized recommendations based on analytics
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { Recommendation } from '../../types/analytics.types';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendations }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No recommendations available at this time</p>
          <p className="text-sm mt-2">Keep logging your meals and performance data!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg p-6 shadow border-l-4 ${getPriorityColor(rec.priority)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <h3 className="font-semibold text-lg">{rec.title}</h3>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(rec.priority)}`}>
              {rec.priority.toUpperCase()}
            </span>
          </div>
          
          <p className="text-gray-700 mb-4">{rec.description}</p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-1">Recommended Action:</p>
            <p className="text-sm text-gray-700">{rec.action}</p>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-500">Type: {rec.type}</span>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Mark as Done
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};