/**
 * Custom hook for fetching analytics data
 */

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
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