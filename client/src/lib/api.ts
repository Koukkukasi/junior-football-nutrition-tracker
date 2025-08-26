/**
 * API utility functions and configuration with retry logic and timeout handling
 */

// Use production backend URL when deployed
const getApiBase = () => {
  // First check if VITE_API_URL is set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we're on the production client
  if (window.location.hostname === 'junior-football-nutrition-client.onrender.com') {
    return 'https://junior-football-nutrition-server.onrender.com';
  }
  
  // For any localhost or development environment, use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // Default to localhost for other cases
  return 'http://localhost:3001';
};

const API_BASE = getApiBase();
console.log('Using API base URL:', API_BASE);
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  token?: string | null;
  timeout?: number;
  retries?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(timeout: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make an authenticated API request with retry logic
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  const timeout = options.timeout || REQUEST_TIMEOUT;
  const maxRetries = options.retries ?? MAX_RETRIES;
  
  // Get auth token from Supabase
  let token = options.token;
  if (!token) {
    try {
      const { supabase } = await import('./supabase');
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token || null;
    } catch (authError) {
      console.error('Failed to get auth token:', authError);
    }
  }
  
  // Prepare request options
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  };
  
  // Attempt request with retries
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create timeout controller for this attempt
      const controller = createTimeoutController(timeout);
      
      console.log(`API Request attempt ${attempt + 1}/${maxRetries + 1} to ${endpoint}`);
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      // Check if response is HTML (deployment protection or error page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('API returned HTML instead of JSON - likely deployment protection or error page');
        
        // Retry if we have attempts left
        if (attempt < maxRetries) {
          console.log(`Retrying after ${RETRY_DELAYS[attempt]}ms due to HTML response...`);
          await sleep(RETRY_DELAYS[attempt]);
          continue;
        }
        
        return {
          success: false,
          error: 'API access blocked',
          message: 'The API is currently unavailable. Please try again later.',
          code: 'HTML_RESPONSE'
        };
      }

      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse API response as JSON:', jsonError);
        
        // Retry if we have attempts left
        if (attempt < maxRetries) {
          console.log(`Retrying after ${RETRY_DELAYS[attempt]}ms due to JSON parse error...`);
          await sleep(RETRY_DELAYS[attempt]);
          continue;
        }
        
        return {
          success: false,
          error: 'Invalid API response format',
          message: 'The server returned an unexpected response. Please try again.',
          code: 'PARSE_ERROR'
        };
      }

      // Check if response indicates success
      if (!response.ok) {
        // Don't retry on client errors (4xx), only on server errors (5xx)
        if (response.status >= 500 && attempt < maxRetries) {
          console.log(`Retrying after ${RETRY_DELAYS[attempt]}ms due to server error ${response.status}...`);
          await sleep(RETRY_DELAYS[attempt]);
          continue;
        }
        
        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
          message: data.message || 'An error occurred',
          code: data.code || `HTTP_${response.status}`
        };
      }

      // Success! Return the response
      console.log(`API request to ${endpoint} succeeded on attempt ${attempt + 1}`);
      
      // Ensure consistent response format
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>;
      }
      
      // Wrap raw data in standard format
      return {
        success: true,
        data: data as T,
        message: data?.message
      };
      
    } catch (error: any) {
      console.error(`API request attempt ${attempt + 1} failed for ${endpoint}:`, error);
      
      // Check if it's a timeout error
      if (error.name === 'AbortError') {
        if (attempt < maxRetries) {
          console.log(`Request timed out after ${timeout}ms. Retrying in ${RETRY_DELAYS[attempt]}ms...`);
          await sleep(RETRY_DELAYS[attempt]);
          continue;
        }
        
        return {
          success: false,
          error: 'Request timed out',
          message: `The request took longer than ${timeout / 1000} seconds. Please try again.`,
          code: 'TIMEOUT'
        };
      }
      
      // Network or other errors - retry if we have attempts left
      if (attempt < maxRetries) {
        console.log(`Retrying after ${RETRY_DELAYS[attempt]}ms due to network error...`);
        await sleep(RETRY_DELAYS[attempt]);
        continue;
      }
      
      return {
        success: false,
        error: error.message || 'Network error occurred',
        message: 'Unable to connect to the server. Please check your connection and try again.',
        code: 'NETWORK_ERROR'
      };
    }
  }
  
  // Should never reach here, but just in case
  return {
    success: false,
    error: 'Maximum retries exceeded',
    message: 'Unable to complete the request after multiple attempts.',
    code: 'MAX_RETRIES'
  };
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