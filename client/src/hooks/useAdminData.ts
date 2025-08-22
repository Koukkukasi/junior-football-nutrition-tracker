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
      
      // Fetch user stats
      const usersResponse = await fetch(`${API_BASE}/api/v1/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (usersResponse.ok) {
        const userData = await usersResponse.json();
        setStats(prev => ({
          ...prev,
          totalUsers: userData.total || 0,
          activeToday: userData.activeToday || 0
        }));
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

      // Fetch feedback stats
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

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
    }
  };

  const fetchActivities = async () => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_BASE}/api/v1/admin/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (err) {
      // Silent fail for activities
    }
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