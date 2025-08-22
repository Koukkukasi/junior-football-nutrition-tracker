/**
 * Food Entry Card Component
 * Displays individual food entry with quality indicator
 */

import React from 'react';
import { Clock, MapPin, Award } from 'lucide-react';
import type { FoodEntry } from '../../types/food.types';

interface FoodEntryCardProps {
  entry: FoodEntry;
}

export const FoodEntryCard: React.FC<FoodEntryCardProps> = ({ entry }) => {
  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'excellent': return 'border-green-500 bg-green-50';
      case 'good': return 'border-blue-500 bg-blue-50';
      case 'fair': return 'border-yellow-500 bg-yellow-50';
      case 'poor': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getQualityBadge = (quality?: string) => {
    switch (quality) {
      case 'excellent': return { color: 'bg-green-100 text-green-800', label: 'Excellent' };
      case 'good': return { color: 'bg-blue-100 text-blue-800', label: 'Good' };
      case 'fair': return { color: 'bg-yellow-100 text-yellow-800', label: 'Fair' };
      case 'poor': return { color: 'bg-red-100 text-red-800', label: 'Poor' };
      default: return { color: 'bg-gray-100 text-gray-800', label: 'Not Rated' };
    }
  };

  const badge = getQualityBadge(entry.quality);

  return (
    <div className={`rounded-lg p-4 border-2 ${getQualityColor(entry.quality)}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-lg">{entry.mealType}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
          {badge.label}
        </span>
      </div>
      
      <p className="text-gray-700 mb-3">{entry.description}</p>
      
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {entry.time}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {entry.location}
        </span>
        {entry.quality === 'excellent' && (
          <span className="flex items-center gap-1 text-green-600">
            <Award className="w-4 h-4" />
            Great choice!
          </span>
        )}
      </div>
      
      {entry.notes && (
        <p className="mt-2 text-sm text-gray-600 italic">"{entry.notes}"</p>
      )}
    </div>
  );
};