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

    const data = await response.json();

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
  team: {
    join: (code: string) => 
      apiRequest('/api/v1/teams/join', {
        method: 'POST',
        body: { code }
      }),
    members: (teamId: string) => 
      apiRequest(`/api/v1/teams/${teamId}/members`)
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