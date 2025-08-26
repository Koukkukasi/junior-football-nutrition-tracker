/**
 * Custom hook for fetching analytics data
 */

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { supabaseAPI } from '../lib/supabase-api';
import type {
  NutritionTrend,
  PerformanceCorrelation,
  Recommendation,
  Goal,
  AnalyticsSummary,
  Period
} from '../types/analytics.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useAnalyticsData(period: Period) {
  const { session } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [nutritionTrends, setNutritionTrends] = useState<NutritionTrend[]>([]);
  const [correlations, setCorrelations] = useState<PerformanceCorrelation | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  // Fetch nutrition trends
  const fetchNutritionTrends = async (token: string | null) => {
    const response = await fetch(
      `${API_BASE}/api/v1/analytics/nutrition-trends?period=${period}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      setNutritionTrends(data.data?.trends || []);
      setSummary(data.data?.summary || null);
    } else {
      throw new Error('Failed to fetch nutrition trends');
    }
  };

  // Fetch performance correlations
  const fetchCorrelations = async (token: string | null) => {
    const response = await fetch(
      `${API_BASE}/api/v1/analytics/performance-correlations?period=${period}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      setCorrelations(data.data?.correlations || null);
    } else {
      throw new Error('Failed to fetch correlations');
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async (token: string | null) => {
    const response = await fetch(
      `${API_BASE}/api/v1/analytics/recommendations`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      setRecommendations(data.data?.recommendations || []);
    } else {
      throw new Error('Failed to fetch recommendations');
    }
  };

  // Fetch goals
  const fetchGoals = async (token: string | null) => {
    const response = await fetch(
      `${API_BASE}/api/v1/analytics/goals`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      setGoals(data.data?.goals || []);
    } else {
      throw new Error('Failed to fetch goals');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to get data from Supabase first
        try {
          const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
          const days = daysMap[period] || 7;
          const analyticsData = await supabaseAPI.analytics.getData(days);
          
          if (analyticsData.success && analyticsData.data) {
            // Process Supabase data into analytics format
            const { foodEntries } = analyticsData.data; // performanceEntries will be used in future updates
            
            // Generate trends from food entries
            const trends: NutritionTrend[] = [];
            const dateGroups = new Map<string, any[]>();
            
            foodEntries.forEach(entry => {
              const date = new Date(entry.created_at).toISOString().split('T')[0]; // Use ISO date format
              if (!dateGroups.has(date)) {
                dateGroups.set(date, []);
              }
              dateGroups.get(date)?.push(entry);
            });
            
            dateGroups.forEach((entries, dateStr) => {
              const avgScore = entries.reduce((sum, e) => sum + (e.quality_score || 0), 0) / entries.length;
              const mealCompletion = Math.min((entries.length / 5) * 100, 100); // 5 meals per day target
              
              trends.push({
                date: dateStr,
                mealCount: entries.length,
                qualityScore: Math.round(avgScore),
                mealCompletion: Math.round(mealCompletion)
              });
            });
            
            setNutritionTrends(trends);
            
            // Generate summary
            const avgQualityScore = trends.reduce((sum, t) => sum + t.qualityScore, 0) / (trends.length || 1);
            const avgMealCompletion = trends.reduce((sum, t) => sum + t.mealCompletion, 0) / (trends.length || 1);
            
            // Determine trend based on recent data
            let trend: 'improving' | 'stable' | 'declining' = 'stable';
            if (trends.length >= 3) {
              const recentAvg = trends.slice(-3).reduce((sum, t) => sum + t.qualityScore, 0) / 3;
              const oldAvg = trends.slice(0, 3).reduce((sum, t) => sum + t.qualityScore, 0) / 3;
              if (recentAvg > oldAvg + 5) trend = 'improving';
              else if (recentAvg < oldAvg - 5) trend = 'declining';
            }
            
            setSummary({
              totalMeals: foodEntries.length,
              avgQualityScore: Math.round(avgQualityScore),
              avgMealCompletion: Math.round(avgMealCompletion),
              trend
            });
            
            // Set default recommendations based on data
            const recs: Recommendation[] = [];
            
            if (avgQualityScore < 60) {
              recs.push({
                type: 'nutrition',
                priority: 'high',
                title: 'Improve Food Quality',
                description: 'Your nutrition quality score is below target. Focus on adding more whole foods and reducing processed items.',
                action: 'Review your recent meals and identify areas for improvement'
              });
            }
            
            if (avgMealCompletion < 80) {
              recs.push({
                type: 'consistency',
                priority: 'high',
                title: 'Log More Meals',
                description: 'You\'re not logging all your meals consistently. Aim for 5 meals per day.',
                action: 'Set reminders to log meals after eating'
              });
            }
            
            if (trend === 'declining') {
              recs.push({
                type: 'trend',
                priority: 'medium',
                title: 'Reverse Declining Trend',
                description: 'Your nutrition quality has been declining recently.',
                action: 'Review what changed and return to healthier habits'
              });
            }
            
            if (recs.length === 0) {
              recs.push({
                type: 'maintenance',
                priority: 'low',
                title: 'Keep Up the Good Work',
                description: 'You\'re doing great! Continue with your current nutrition habits.',
                action: 'Maintain consistency and explore new healthy recipes'
              });
            }
            
            setRecommendations(recs);
            
            setGoals([]);
            setCorrelations(null);
            
            return; // Success with Supabase, skip API calls
          }
        } catch (supabaseError) {
          console.log('Supabase analytics failed, trying backend API:', supabaseError);
        }
        
        // Fallback to backend API
        const token = session?.access_token ?? null;
        await Promise.all([
          fetchNutritionTrends(token),
          fetchCorrelations(token),
          fetchRecommendations(token),
          fetchGoals(token)
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [period, session?.access_token]);

  return {
    loading,
    error,
    nutritionTrends,
    correlations,
    recommendations,
    goals,
    summary
  };
}