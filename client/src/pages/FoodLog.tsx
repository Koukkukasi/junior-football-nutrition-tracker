/**
 * Food Log Page - Refactored Version
 * Main container for food logging functionality
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Info } from 'lucide-react';
import { analyzeFoodQuality, totalKeywordCount } from '../lib/food-database';
import { useUserProfile } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { FoodEntryFormValidated } from '../components/food/FoodEntryFormValidated';
import { FoodEntryCard } from '../components/food/FoodEntryCard';
import { NutritionScoreDisplay } from '../components/food/NutritionScoreDisplay';
import { SkeletonFoodEntry } from '../components/ui/SkeletonLoader';
import { calculateDailyXP } from '../lib/gamification';
import { 
  getMealTiming, 
  calculateNutritionScore, 
  getTimeBasedRecommendations 
} from '../utils/foodUtils';
import type { FoodEntry, FoodFormData } from '../types/food.types';
import API from '../lib/api';
import { supabaseAPI } from '../lib/supabase-api';

export default function FoodLog() {
  const { profile } = useUserProfile();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [todayEntries, setTodayEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FoodFormData>({
    mealType: 'BREAKFAST',
    time: '',
    location: '',
    description: '',
    notes: ''
  });

  // Fetch food entries on component mount
  useEffect(() => {
    fetchFoodEntries();
  }, []);

  const fetchFoodEntries = async () => {
    try {
      setLoading(true);
      // Use backend API to fetch entries (properly configured)
      const response = await API.food.entries();
      if (response.success && response.data) {
        const foodData = response.data.data || response.data;
        const today = new Date().toDateString();
        const todayData = (Array.isArray(foodData) ? foodData : []).filter((entry: any) => {
          return new Date(entry.date || entry.created_at || entry.createdAt).toDateString() === today;
        }).map((entry: any) => ({
          id: entry.id,
          mealType: entry.mealType || entry.meal_type,
          time: entry.time || '',
          location: entry.location || '',
          description: entry.description,
          notes: entry.notes || '',
          quality: analyzeFoodQuality(
            entry.description, 
            'regular',
            profile?.age,
            profile?.ageGroup
          ).quality
        }));
        setTodayEntries(todayData);
      }
    } catch (err: any) {
      console.error('Failed to fetch food entries:', err);
      // Check if it's an auth error
      if (err.code === 'NO_TOKEN' || err.message?.includes('not authenticated')) {
        // User might not be logged in, just show empty state
        setTodayEntries([]);
      } else {
        error('Failed to load meals', 'Please try refreshing the page');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show loading state, NOT success
    setIsSubmitting(true);
    
    const timing = getMealTiming(formData.mealType, formData.time);
    const analysis = analyzeFoodQuality(
      formData.description, 
      timing,
      profile?.age,
      profile?.ageGroup
    );
    
    try {
      // Try Supabase first, then backend API as fallback
      let response;
      // let saveError = null; // Currently unused but might be needed for debugging
      
      try {
        // Use backend API for data persistence (properly configured with authentication)
        console.log('Attempting to save via backend API...');
        response = await API.food.create({
          ...formData,
          date: new Date().toISOString() // Add date field for backend
        });
        console.log('Backend API save response:', response);
      } catch (apiError: any) {
        console.error('Backend API save failed:', apiError);
        
        // Check if it's an authentication error
        if (apiError.message?.includes('not authenticated') || apiError.code === 'NO_TOKEN') {
          error('Authentication Required', 'Please sign in to save your meals');
          navigate('/auth/signin');
          return;
        }
        
        // For other errors, show a generic message
        throw new Error(apiError.message || 'Unable to save meal. Please try again.');
      }
      
      // WAIT for actual confirmation with proper validation
      if (response && response.success && response.data) {
        const newEntry: FoodEntry = {
          id: response.data.id || response.data, // Handle both nested and direct response formats
          ...formData,
          quality: analysis.quality
        };
        
        // Only update UI after confirmed success
        setTodayEntries([...todayEntries, newEntry]);
        
        // Also refresh from database to ensure consistency
        setTimeout(fetchFoodEntries, 500);
        
        // Calculate and update XP
        const nutritionScoreData = calculateNutritionScore([...todayEntries, newEntry]);
        const xpEarned = calculateDailyXP(nutritionScoreData.totalScore, todayEntries.length + 1);
        
        // Update user stats with XP (fire and forget, don't wait)
        supabaseAPI.userStats.addXP(xpEarned, true, nutritionScoreData.totalScore >= 80).catch(() => {
          // Silently fail if gamification isn't set up yet
          console.log('Gamification not set up yet - run setup-gamification.sql in Supabase');
        });
        
        // Show success toast with quality feedback and XP
        const qualityMessages = {
          excellent: `Excellent choice! +${xpEarned} XP 🌟`,
          good: `Good meal! +${xpEarned} XP 👍`,
          fair: `Decent choice. +${xpEarned} XP`,
          poor: `Try healthier choices. +${xpEarned} XP`
        };
        
        success('Meal saved!', qualityMessages[analysis.quality]);
        
        // Reset form and close only after success
        setFormData({
          mealType: 'BREAKFAST',
          time: '',
          location: '',
          description: '',
          notes: ''
        });
        setShowForm(false);
      } else {
        // Show specific error message from backend if available
        const errorMessage = (response && 'error' in response ? response.error : null) || 'Please try again';
        error('Failed to save meal', errorMessage);
        console.error('Save failed - Backend returned:', response);
      }
    } catch (err) {
      console.error('Failed to save food entry:', err);
      error('Failed to save meal', 'Please check your connection and try again');
    } finally {
      // Always reset loading state
      setIsSubmitting(false);
    }
  };

  const nutritionScoreData = calculateNutritionScore(todayEntries);
  // const nutritionScore = nutritionScoreData.totalScore || 0; // Currently using nutritionScoreData directly
  const currentHour = new Date().getHours();
  const recommendations = getTimeBasedRecommendations(currentHour);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Food Log</h1>
          <p className="text-gray-600 mt-2">Track your daily nutrition and eating habits</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Meal
        </button>
      </div>

      {/* Show form full width when active, otherwise show grid layout */}
      {showForm ? (
        <FoodEntryFormValidated
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setShowForm(false);
            setFormData({
              mealType: 'BREAKFAST',
              time: '',
              location: '',
              description: '',
              notes: ''
            });
          }}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Food Entries */}
          <div className="lg:col-span-2 space-y-6">
              {/* Today's Summary */}
              <div className="bg-white rounded-lg p-4 shadow flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Today's Meals</h3>
                    <p className="text-sm text-gray-600">
                      {todayEntries.length} meals logged
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Database</p>
                  <p className="font-semibold text-blue-600">{totalKeywordCount} foods</p>
                </div>
              </div>

              {/* Food Entries */}
              <div className="space-y-4">
                {loading ? (
                  <>
                    <SkeletonFoodEntry />
                    <SkeletonFoodEntry />
                    <SkeletonFoodEntry />
                  </>
                ) : todayEntries.length > 0 ? (
                  todayEntries.map(entry => (
                    <FoodEntryCard key={entry.id} entry={entry} />
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-500">No meals logged yet today</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Log your first meal
                    </button>
                  </div>
                )}
              </div>
          </div>

        {/* Right Column - Score and Recommendations */}
        <div className="space-y-6">
          {/* Nutrition Score */}
          <NutritionScoreDisplay score={nutritionScoreData} />
          
          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Recommendations</h3>
            </div>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-sm text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* User Info */}
          {profile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Personalized for:</p>
              <p className="font-medium">{(profile as any).name || 'Player'}</p>
              <p className="text-sm text-gray-600">
                Age: {profile.age} ({profile.ageGroup})
              </p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}