/**
 * Food Entry Form Component
 * Form for logging new food entries
 */

import React from 'react';
import { Clock, MapPin, FileText } from 'lucide-react';
import type { FoodFormData, MealType } from '../../types/food.types';

interface FoodEntryFormProps {
  formData: FoodFormData;
  onFormDataChange: (data: FoodFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const FoodEntryForm: React.FC<FoodEntryFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel
}) => {
  const mealTypes: { value: MealType; label: string }[] = [
    { value: 'BREAKFAST', label: 'Breakfast' },
    { value: 'SNACK', label: 'Morning Snack' },
    { value: 'LUNCH', label: 'Lunch' },
    { value: 'DINNER', label: 'Dinner' },
    { value: 'EVENING_SNACK', label: 'Evening Snack' }
  ];

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Log Your Meal</h3>
      
      {/* Meal Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meal Type
        </label>
        <select
          value={formData.mealType}
          onChange={(e) => onFormDataChange({ ...formData, mealType: e.target.value as MealType })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {mealTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Time and Location */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Time
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => onFormDataChange({ ...formData, time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => onFormDataChange({ ...formData, location: e.target.value })}
            placeholder="e.g., Home, School, Restaurant"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Food Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What did you eat?
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
          placeholder="Describe your meal (e.g., Grilled chicken with rice and vegetables)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline w-4 h-4 mr-1" />
          Notes (optional)
        </label>
        <input
          type="text"
          value={formData.notes}
          onChange={(e) => onFormDataChange({ ...formData, notes: e.target.value })}
          placeholder="How did you feel after eating?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Meal
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};