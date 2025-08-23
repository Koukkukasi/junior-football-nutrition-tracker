/**
 * Enhanced Food Entry Form with Validation and Animations
 * Includes real-time validation, inline errors, and success feedback
 */

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, FileText, TrendingUp, AlertCircle, CheckCircle, XCircle, Check, X, AlertTriangle } from 'lucide-react';
import { analyzeFoodQuality } from '../../lib/food-database';
import { getMealTiming } from '../../utils/foodUtils';
import { useUserProfile } from '../../contexts/UserContext';
import type { FoodFormData, MealType } from '../../types/food.types';

interface FoodEntryFormValidatedProps {
  formData: FoodFormData;
  onFormDataChange: (data: FoodFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

interface ValidationErrors {
  mealType?: string;
  time?: string;
  location?: string;
  description?: string;
}

interface FieldTouched {
  mealType: boolean;
  time: boolean;
  location: boolean;
  description: boolean;
}

export const FoodEntryFormValidated: React.FC<FoodEntryFormValidatedProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel
}) => {
  const { profile } = useUserProfile();
  const [liveScore, setLiveScore] = useState<number>(0);
  const [liveQuality, setLiveQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('fair');
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<FieldTouched>({
    mealType: false,
    time: false,
    location: false,
    description: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const mealTypes: { value: MealType; label: string; color: string }[] = [
    { value: 'BREAKFAST', label: 'Breakfast', color: 'from-yellow-400 to-orange-500' },
    { value: 'SNACK', label: 'Morning Snack', color: 'from-green-400 to-emerald-500' },
    { value: 'LUNCH', label: 'Lunch', color: 'from-blue-400 to-cyan-500' },
    { value: 'DINNER', label: 'Dinner', color: 'from-purple-400 to-pink-500' },
    { value: 'EVENING_SNACK', label: 'Evening Snack', color: 'from-indigo-400 to-purple-500' }
  ];

  // Validation functions
  const validateTime = (time: string): string | undefined => {
    if (!time) return 'Time is required';
    const [hours, minutes] = time.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return 'Invalid time format';
    }
    return undefined;
  };

  const validateLocation = (location: string): string | undefined => {
    if (!location.trim()) return 'Location is required';
    if (location.length < 2) return 'Location must be at least 2 characters';
    if (location.length > 50) return 'Location must be less than 50 characters';
    if (!/^[a-zA-Z0-9\s,.-]+$/.test(location)) {
      return 'Location contains invalid characters';
    }
    return undefined;
  };

  const validateDescription = (description: string): string | undefined => {
    if (!description.trim()) return 'Food description is required';
    if (description.length < 3) return 'Please describe your meal in more detail (min 3 characters)';
    if (description.length > 500) return 'Description is too long (max 500 characters)';
    return undefined;
  };

  // Validate all fields
  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    const timeError = validateTime(formData.time);
    if (timeError) newErrors.time = timeError;
    
    const locationError = validateLocation(formData.location);
    if (locationError) newErrors.location = locationError;
    
    const descriptionError = validateDescription(formData.description);
    if (descriptionError) newErrors.description = descriptionError;
    
    return newErrors;
  };

  // Real-time validation as user types
  useEffect(() => {
    const newErrors: ValidationErrors = {};
    
    if (touched.time && formData.time) {
      const timeError = validateTime(formData.time);
      if (timeError) newErrors.time = timeError;
    }
    
    if (touched.location) {
      const locationError = validateLocation(formData.location);
      if (locationError) newErrors.location = locationError;
    }
    
    if (touched.description) {
      const descriptionError = validateDescription(formData.description);
      if (descriptionError) newErrors.description = descriptionError;
    }
    
    setErrors(newErrors);
  }, [formData, touched]);

  // Calculate live score when description changes
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (formData.description.trim().length > 2) {
      setIsTyping(true);
      
      const timer = setTimeout(() => {
        const timing = getMealTiming(formData.mealType, formData.time);
        const analysis = analyzeFoodQuality(
          formData.description,
          timing,
          profile?.age,
          profile?.ageGroup
        );
        
        setLiveScore(analysis.score);
        setLiveQuality(analysis.quality);
        setLiveSuggestions(analysis.suggestions || []);
        setIsTyping(false);
      }, 300);
      
      setDebounceTimer(timer);
    } else {
      setLiveScore(0);
      setLiveSuggestions([]);
      setIsTyping(false);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [formData.description, formData.mealType, formData.time, profile]);

  const handleBlur = (field: keyof FieldTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmitWithValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      mealType: true,
      time: true,
      location: true,
      description: true
    });
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus first error field
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      element?.focus();
      return;
    }
    
    setIsSubmitting(true);
    setShowSuccessAnimation(true);
    
    // Show success animation before submitting
    setTimeout(() => {
      onSubmit(e);
      setIsSubmitting(false);
      setShowSuccessAnimation(false);
    }, 1500);
  };

  const getScoreColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'from-green-400 to-emerald-600';
      case 'good': return 'from-blue-400 to-blue-600';
      case 'fair': return 'from-yellow-400 to-orange-500';
      case 'poor': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getScoreIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'good': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'fair': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'poor': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getQualityMessage = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Excellent choice! Perfect for young athletes!';
      case 'good': return 'Good meal! Keep making healthy choices.';
      case 'fair': return 'Decent choice. Could be more nutritious.';
      case 'poor': return 'Try adding healthier options to your meal.';
      default: return 'Start typing to see nutrition score...';
    }
  };

  const isFormValid = Object.keys(errors).length === 0 && 
                      formData.time && 
                      formData.location && 
                      formData.description.length >= 3;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <form onSubmit={handleSubmitWithValidation} className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg relative">
        {/* Success Animation Overlay */}
        {showSuccessAnimation && (
          <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center z-50 animate-fade-in">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center animate-bounce">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Meal Saved!</h3>
              <p className="text-gray-600">Great job tracking your nutrition!</p>
            </div>
          </div>
        )}
        
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Log Your Meal
        </h3>
        
        {/* Meal Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meal Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {mealTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => onFormDataChange({ ...formData, mealType: type.value })}
                className={`p-3 rounded-lg border-2 transition-all transform hover:scale-105 ${
                  formData.mealType === type.value
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-br ${type.color} ${
                  formData.mealType === type.value ? 'shadow-lg' : 'opacity-70'
                }`} />
                <div className="text-xs font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time and Location */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1 text-blue-500" />
              Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={(e) => onFormDataChange({ ...formData, time: e.target.value })}
                onBlur={() => handleBlur('time')}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                  errors.time && touched.time 
                    ? 'border-red-500 bg-red-50' 
                    : formData.time && !errors.time
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                required
              />
              {errors.time && touched.time && (
                <div className="absolute -bottom-5 left-0 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.time}
                </div>
              )}
              {formData.time && !errors.time && touched.time && (
                <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1 text-green-500" />
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={(e) => onFormDataChange({ ...formData, location: e.target.value })}
                onBlur={() => handleBlur('location')}
                placeholder="e.g., Home, School"
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                  errors.location && touched.location 
                    ? 'border-red-500 bg-red-50' 
                    : formData.location && !errors.location && touched.location
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                required
              />
              {errors.location && touched.location && (
                <div className="absolute -bottom-5 left-0 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.location}
                </div>
              )}
              {formData.location && !errors.location && touched.location && (
                <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
          </div>
        </div>

        {/* Food Description */}
        <div className="mb-6 mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What did you eat? <span className="text-red-500">*</span>
            <span className="float-right text-xs text-gray-500">
              {formData.description.length}/500
            </span>
          </label>
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              onBlur={() => handleBlur('description')}
              placeholder="Describe your meal (e.g., Grilled chicken with rice and vegetables)"
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-all ${
                errors.description && touched.description 
                  ? 'border-red-500 bg-red-50' 
                  : formData.description.length >= 3 && !errors.description
                  ? `border-${liveQuality === 'excellent' ? 'green' : liveQuality === 'good' ? 'blue' : liveQuality === 'fair' ? 'yellow' : 'red'}-500 bg-${liveQuality === 'excellent' ? 'green' : liveQuality === 'good' ? 'blue' : liveQuality === 'fair' ? 'yellow' : 'red'}-50`
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              rows={3}
              maxLength={500}
              required
            />
            {errors.description && touched.description && (
              <div className="absolute -bottom-5 left-0 text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.description}
              </div>
            )}
            {formData.description.length >= 3 && !errors.description && liveScore > 0 && (
              <div className="absolute right-2 top-2">
                {getScoreIcon(liveQuality)}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6 mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline w-4 h-4 mr-1 text-purple-500" />
            Notes (optional)
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => onFormDataChange({ ...formData, notes: e.target.value })}
            placeholder="How did you feel after eating?"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Form Summary */}
        {isFormValid && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Ready to save!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Your meal will be logged with a nutrition score of {liveScore}/100
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold shadow-lg transition-all transform ${
              isFormValid && !isSubmitting
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Meal'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Live Score Preview Panel */}
      <div className="lg:col-span-1 space-y-4">
        {/* Score Display */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Live Nutrition Score
            {isTyping && (
              <div className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </h4>
          
          {formData.description.length > 2 ? (
            <>
              {/* Animated Score Circle */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getScoreColor(liveQuality)} animate-pulse opacity-20`} />
                <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${getScoreColor(liveQuality)} opacity-40`} />
                <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${getScoreColor(liveQuality)} bg-clip-text text-transparent transition-all duration-500`}>
                      {liveScore}
                    </div>
                    <div className="text-xs text-gray-600">out of 100</div>
                  </div>
                </div>
              </div>

              {/* Quality Badge */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {getScoreIcon(liveQuality)}
                <span className={`text-lg font-semibold ${
                  liveQuality === 'excellent' ? 'text-green-600' :
                  liveQuality === 'good' ? 'text-blue-600' :
                  liveQuality === 'fair' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {liveQuality.charAt(0).toUpperCase() + liveQuality.slice(1)}
                </span>
              </div>

              {/* Quality Message */}
              <p className="text-sm text-center text-gray-600 mb-4">
                {getQualityMessage(liveQuality)}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${getScoreColor(liveQuality)} transition-all duration-500 ease-out`}
                  style={{ width: `${liveScore}%` }}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-3xl text-gray-400">?</span>
              </div>
              <p className="text-sm text-gray-500">
                Start typing your meal to see the nutrition score
              </p>
            </div>
          )}
        </div>

        {/* Validation Status */}
        <div className="bg-white rounded-xl p-5 shadow-md">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Form Status</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {formData.time ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-300" />
              )}
              <span className={`text-sm ${formData.time ? 'text-green-700' : 'text-gray-500'}`}>
                Time selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {formData.location && !errors.location ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-300" />
              )}
              <span className={`text-sm ${formData.location && !errors.location ? 'text-green-700' : 'text-gray-500'}`}>
                Location entered
              </span>
            </div>
            <div className="flex items-center gap-2">
              {formData.description.length >= 3 && !errors.description ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-300" />
              )}
              <span className={`text-sm ${formData.description.length >= 3 && !errors.description ? 'text-green-700' : 'text-gray-500'}`}>
                Food described
              </span>
            </div>
          </div>
        </div>

        {/* Suggestions Panel */}
        {liveSuggestions.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 shadow-md">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              Smart Suggestions
            </h4>
            <ul className="space-y-2">
              {liveSuggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-xs text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Age-Specific Tip */}
        {profile && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-md">
            <p className="text-xs text-gray-600 mb-1">Scoring for:</p>
            <p className="text-sm font-semibold text-gray-800">
              Age {profile.age} ({profile.ageGroup})
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Scores are adjusted for your age group's nutritional needs
            </p>
          </div>
        )}
      </div>
    </div>
  );
};