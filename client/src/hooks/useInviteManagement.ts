/**
 * Custom hook for managing invitation functionality
 */

import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { InviteResult, InviteFormData } from '../types/admin.types';

export function useInviteManagement() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [error, setError] = useState('');

  const sendSingleInvite = async (formData: InviteFormData) => {
    setIsLoading(true);
    setError('');
    setInviteResult(null);

    try {
      const token = await getToken();
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/v1/invites/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          teamCode: formData.teamCode || undefined,
          customMessage: formData.customMessage || undefined
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setInviteResult(data);
        return { success: true, data };
      } else {
        setError(data.error || 'Failed to send invitation');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      console.error('Invite error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const sendBulkInvites = async (
    emails: string[], 
    role: 'PLAYER' | 'COACH', 
    teamCode?: string
  ) => {
    setIsLoading(true);
    setError('');
    setInviteResult(null);
    
    try {
      const token = await getToken();
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/v1/invites/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emails,
          role,
          teamCode: teamCode || undefined
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setInviteResult(data);
        return { success: true, data };
      } else {
        setError(data.error || 'Failed to send bulk invitations');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      console.error('Bulk invite error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setInviteResult(null);
    setError('');
  };

  return {
    isLoading,
    inviteResult,
    error,
    sendSingleInvite,
    sendBulkInvites,
    clearResults
  };
}