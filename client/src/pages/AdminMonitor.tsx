/**
 * Admin Monitor Dashboard - Refactored Version
 * Main container for admin monitoring features
 */

import { RefreshCw, Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminData } from '../hooks/useAdminData';
import { StatsCards } from '../components/admin/StatsCards';
import { ActivityFeed } from '../components/admin/ActivityFeed';
import { PendingInvites } from '../components/admin/PendingInvites';
import { SystemHealthComponent } from '../components/admin/SystemHealth';

export default function AdminMonitor() {
  const navigate = useNavigate();
  const {
    stats,
    activities,
    invites,
    isLoading,
    lastUpdate,
    error,
    refresh
  } = useAdminData();

  const handleRefresh = async () => {
    await refresh();
  };

  const handleCopyCode = (code: string) => {
    // Could show a toast notification here
    alert(`Invite code copied: ${code}`);
  };

  const handleCancelInvite = async (email: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/v1/invites/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-qlhkefgrafakbrcwquhv-auth-token') || ''}`
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        alert(`Invite cancelled for: ${email}`);
        await refresh(); // Refresh the data
      } else {
        const data = await response.json();
        alert(data.error || `Failed to cancel invite for: ${email}`);
      }
    } catch (error) {
      console.error('Error cancelling invite:', error);
      alert('Network error. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={handleRefresh}
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Monitor</h1>
              <p className="text-gray-600 mt-1">System overview and management</p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityFeed activities={activities} />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/admin/invite')}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Users className="w-4 h-4" />
                  <span>Send Invite</span>
                </button>
                
                <button
                  onClick={() => navigate('/test-invite')}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Users className="w-4 h-4" />
                  <span>Test User Setup</span>
                </button>
                
                <button
                  onClick={() => {/* View feedback handler */}}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-lg hover:shadow-md transition-shadow border"
                >
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">View Feedback</span>
                </button>
                
                <button
                  onClick={() => navigate('/analytics')}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-lg hover:shadow-md transition-shadow border"
                >
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Analytics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - System Info */}
          <div className="space-y-6">
            <SystemHealthComponent 
              lastUpdate={lastUpdate}
              onRefresh={handleRefresh}
            />
            
            <PendingInvites 
              invites={invites}
              onCopyCode={handleCopyCode}
              onCancelInvite={handleCancelInvite}
            />
          </div>
        </div>
      </div>
    </div>
  );
}