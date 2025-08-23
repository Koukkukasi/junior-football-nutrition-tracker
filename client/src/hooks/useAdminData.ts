/**
 * Custom hook for fetching admin dashboard data
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { SystemStats, RecentActivity, PendingInvite } from '../types/admin.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useAdminData() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeToday: 0,
    pendingInvites: 0,
    totalFeedback: 0,
    averageScore: 0,
    totalMeals: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const token = await getToken();
      
      // Fetch admin stats (all in one call)
      const adminStatsResponse = await fetch(`${API_BASE}/api/v1/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (adminStatsResponse.ok) {
        const adminData = await adminStatsResponse.json();
        if (adminData.success && adminData.data) {
          const { users, foodEntries, recentActivity } = adminData.data;
          
          setStats(prev => ({
            ...prev,
            totalUsers: users.total || 0,
            activeToday: users.activeToday || 0,
            totalMeals: foodEntries.total || 0
          }));
          
          // Convert recent activity to the expected format
          if (recentActivity && recentActivity.length > 0) {
            const formattedActivities: RecentActivity[] = recentActivity.map((entry: any) => ({
              id: entry.id,
              type: 'food_entry' as const,
              description: `${entry.userName} logged ${entry.mealType.toLowerCase()}`,
              timestamp: entry.createdAt,
              userId: entry.id
            }));
            setActivities(formattedActivities);
          }
        }
      }

      // Fetch pending invites
      const invitesResponse = await fetch(`${API_BASE}/api/v1/invites/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (invitesResponse.ok) {
        const inviteData = await invitesResponse.json();
        setInvites(inviteData.invites || []);
        setStats(prev => ({
          ...prev,
          pendingInvites: inviteData.invites?.length || 0
        }));
      }

      // Fetch feedback stats (still separate as it requires admin role)
      try {
        const feedbackResponse = await fetch(`${API_BASE}/api/v1/feedback/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json();
          setStats(prev => ({
            ...prev,
            totalFeedback: feedbackData.stats?.total || 0,
            averageScore: feedbackData.stats?.averageRating || 0
          }));
        }
      } catch (err) {
        // Feedback stats might fail if user is not admin
        console.log('Could not fetch feedback stats');
      }

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
    }
  };

  const fetchActivities = async () => {
    // Activities are now fetched as part of admin stats
    // This function is kept for compatibility but does nothing
    return;
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchActivities()]);
      setIsLoading(false);
    };

    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchActivities()]);
    setIsLoading(false);
  };

  return {
    stats,
    activities,
    invites,
    isLoading,
    lastUpdate,
    error,
    refresh
  };
}