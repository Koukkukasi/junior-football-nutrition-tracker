/**
 * API utility functions and configuration
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  token?: string | null;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    // Get auth token if not provided
    const token = options.token || await window.Clerk?.session?.getToken();
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    // Check if response is HTML (Vercel deployment protection)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error('API returned HTML instead of JSON - likely deployment protection is enabled');
      return {
        success: false,
        error: 'API access blocked by deployment protection',
        message: 'The API is currently protected. Please check deployment settings or try again later.'
      };
    }

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse API response as JSON:', jsonError);
      return {
        success: false,
        error: 'Invalid API response format',
        message: 'The server returned an unexpected response. Please try again.'
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
        message: data.message
      };
    }

    return {
      success: true,
      data,
      message: data.message
    };
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
}

/**
 * API endpoints
 */
export const API = {
  // User endpoints
  users: {
    onboarding: (data: any) => 
      apiRequest('/api/v1/users/onboarding', {
        method: 'POST',
        body: data
      }),
    profile: () => 
      apiRequest('/api/v1/users/profile'),
    stats: () => 
      apiRequest('/api/v1/users/stats')
  },
  
  // Food endpoints
  food: {
    entries: () => 
      apiRequest('/api/v1/food'),
    create: (data: any) => 
      apiRequest('/api/v1/food', {
        method: 'POST',
        body: data
      }),
    update: (id: string, data: any) => 
      apiRequest(`/api/v1/food/${id}`, {
        method: 'PUT',
        body: data
      }),
    delete: (id: string) => 
      apiRequest(`/api/v1/food/${id}`, {
        method: 'DELETE'
      })
  },
  
  // Analytics endpoints
  analytics: {
    nutritionTrends: (period: string) => 
      apiRequest(`/api/v1/analytics/nutrition-trends?period=${period}`),
    performanceCorrelations: (period: string) => 
      apiRequest(`/api/v1/analytics/performance-correlations?period=${period}`),
    recommendations: () => 
      apiRequest('/api/v1/analytics/recommendations'),
    goals: () => 
      apiRequest('/api/v1/analytics/goals')
  },
  
  // Admin endpoints
  admin: {
    invites: {
      send: (data: any) => 
        apiRequest('/api/v1/invites/send', {
          method: 'POST',
          body: data
        }),
      bulk: (data: any) => 
        apiRequest('/api/v1/invites/bulk', {
          method: 'POST',
          body: data
        }),
      pending: () => 
        apiRequest('/api/v1/invites/pending')
    },
    feedback: {
      stats: () => 
        apiRequest('/api/v1/feedback/stats')
    }
  },
  
  // Team endpoints
  teams: {
    create: (data: { name: string; description?: string }) => 
      apiRequest('/api/v1/teams/create', {
        method: 'POST',
        body: data
      }),
    join: (inviteCode: string) => 
      apiRequest('/api/v1/teams/join', {
        method: 'POST',
        body: { inviteCode }
      }),
    getMyTeams: () => 
      apiRequest('/api/v1/teams/my-teams'),
    getDetails: (teamId: string) => 
      apiRequest(`/api/v1/teams/${teamId}`),
    getStats: (teamId: string, period: string = '7d') => 
      apiRequest(`/api/v1/teams/${teamId}/stats?period=${period}`),
    updateMemberRole: (teamId: string, userId: string, role: string) => 
      apiRequest(`/api/v1/teams/${teamId}/member/${userId}/role`, {
        method: 'PUT',
        body: { role }
      }),
    leave: (teamId: string) => 
      apiRequest(`/api/v1/teams/${teamId}/leave`, {
        method: 'DELETE'
      })
  },
  
  // Performance endpoints
  performance: {
    submit: (data: any) => 
      apiRequest('/api/v1/performance', {
        method: 'POST',
        body: data
      }),
    history: () => 
      apiRequest('/api/v1/performance')
  }
};

export default API;