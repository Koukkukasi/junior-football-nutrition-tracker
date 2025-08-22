/**
 * Analytics Dashboard - Refactored Version
 * Main container component for analytics features
 */

import React, { useState } from 'react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { NutritionTrends } from '../components/analytics/NutritionTrends';
import { PerformanceCorrelations } from '../components/analytics/PerformanceCorrelations';
import { RecommendationsPanel } from '../components/analytics/RecommendationsPanel';
import { GoalsProgress } from '../components/analytics/GoalsProgress';
import type { Period, TabType } from '../types/analytics.types';

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('trends');
  const [period, setPeriod] = useState<Period>('30d');
  
  const {
    loading,
    error,
    nutritionTrends,
    correlations,
    recommendations,
    goals,
    summary
  } = useAnalyticsData(period);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Analytics</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your nutrition and performance insights</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                period === p 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p === '7d' && 'Last 7 Days'}
              {p === '30d' && 'Last 30 Days'}
              {p === '90d' && 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'trends' as TabType, label: 'Nutrition Trends' },
              { id: 'correlations' as TabType, label: 'Performance Correlations' },
              { id: 'recommendations' as TabType, label: 'Recommendations' },
              { id: 'goals' as TabType, label: 'Goals' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'trends' && (
            <NutritionTrends trends={nutritionTrends} summary={summary} />
          )}
          
          {activeTab === 'correlations' && (
            <PerformanceCorrelations correlations={correlations} />
          )}
          
          {activeTab === 'recommendations' && (
            <RecommendationsPanel recommendations={recommendations} />
          )}
          
          {activeTab === 'goals' && (
            <GoalsProgress goals={goals} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;