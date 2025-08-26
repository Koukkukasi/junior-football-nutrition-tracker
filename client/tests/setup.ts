// Vitest Unit Test Setup
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: () => [],
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock console methods to reduce noise in test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('Warning: useLayoutEffect'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning:')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          data: null,
          error: null,
        })),
        data: null,
        error: null,
      })),
      insert: vi.fn(() => ({ data: null, error: null })),
      update: vi.fn(() => ({ data: null, error: null })),
      delete: vi.fn(() => ({ data: null, error: null })),
    })),
  })),
}));

// Test data helpers
export const testUsers = {
  youngPlayer: {
    id: 'test-user-1',
    email: 'young@test.com',
    age: 10,
    ageGroup: '10-12' as const,
    position: 'MIDFIELDER',
    name: 'Young Player',
  },
  teenPlayer: {
    id: 'test-user-2',
    email: 'teen@test.com',
    age: 15,
    ageGroup: '13-15' as const,
    position: 'FORWARD',
    name: 'Teen Player',
  },
  adultPlayer: {
    id: 'test-user-3',
    email: 'adult@test.com',
    age: 20,
    ageGroup: '19-25' as const,
    position: 'GOALKEEPER',
    name: 'Adult Player',
  },
};

export const testFoods = {
  healthy: {
    description: 'Grilled chicken with vegetables and quinoa',
    expectedQuality: 'excellent',
    expectedScore: 90,
  },
  average: {
    description: 'Sandwich with ham and cheese',
    expectedQuality: 'fair',
    expectedScore: 50,
  },
  poor: {
    description: 'Candy bar and soda',
    expectedQuality: 'poor',
    expectedScore: 20,
  },
  preGame: {
    description: 'Pasta with tomato sauce and chicken',
    mealTiming: 'pre-game' as const,
    expectedQuality: 'good',
    expectedScore: 75,
  },
  postGame: {
    description: 'Protein shake with banana',
    mealTiming: 'post-game' as const,
    expectedQuality: 'excellent',
    expectedScore: 95,
  },
};

// Utility functions for testing
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const mockApiResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});