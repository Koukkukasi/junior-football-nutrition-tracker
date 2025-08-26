// Vitest Integration Test Setup
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// API base URL for integration tests
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

// Test database connection
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  'postgresql://nutrition_user:nutrition_pass@localhost:5433/nutrition_tracker_test';

// Test authentication tokens
export const testTokens = {
  admin: 'test-admin-token',
  coach: 'test-coach-token',
  player: 'test-player-token',
  parent: 'test-parent-token',
};

// Test user credentials
export const testCredentials = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'ADMIN',
  },
  coach: {
    email: 'coach@test.com',
    password: 'Coach123!',
    role: 'COACH',
  },
  player: {
    email: 'player@test.com',
    password: 'Player123!',
    role: 'PLAYER',
  },
  parent: {
    email: 'parent@test.com',
    password: 'Parent123!',
    role: 'PARENT',
  },
};

// Setup and teardown
let serverProcess: any = null;

beforeAll(async () => {
  // Start test server if not running
  if (process.env.START_TEST_SERVER === 'true') {
    const { spawn } = await import('child_process');
    serverProcess = spawn('npm', ['run', 'dev:test'], {
      cwd: path.resolve(__dirname, '../../server'),
      env: { ...process.env, NODE_ENV: 'test', PORT: '3001' },
    });
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
});

afterAll(async () => {
  // Stop test server
  if (serverProcess) {
    serverProcess.kill();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
});

afterEach(() => {
  vi.clearAllMocks();
});

// Helper functions for integration tests
export async function authenticateUser(role: 'admin' | 'coach' | 'player' | 'parent') {
  const credentials = testCredentials[role];
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to authenticate ${role}: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.token || testTokens[role];
}

export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
  role: 'admin' | 'coach' | 'player' | 'parent' = 'player'
) {
  const token = await authenticateUser(role);
  
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function createTestUser(userData: any) {
  const response = await makeAuthenticatedRequest('/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }, 'admin');
  
  if (!response.ok) {
    throw new Error(`Failed to create test user: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createTestFoodEntry(foodData: any, userId?: string) {
  const response = await makeAuthenticatedRequest('/api/v1/food-entries', {
    method: 'POST',
    body: JSON.stringify({
      ...foodData,
      userId: userId || 'test-user-id',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create test food entry: ${response.statusText}`);
  }
  
  return response.json();
}

export async function cleanupTestData(entityType: 'users' | 'food-entries' | 'teams', ids: string[]) {
  const promises = ids.map(id =>
    makeAuthenticatedRequest(`/api/v1/${entityType}/${id}`, {
      method: 'DELETE',
    }, 'admin')
  );
  
  await Promise.all(promises);
}

// Test data factories
export function createMockFoodEntry(overrides = {}) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    description: 'Test food entry',
    mealType: 'lunch',
    mealTiming: 'regular',
    quality: 'good',
    score: 75,
    timestamp: new Date().toISOString(),
    userId: 'test-user-id',
    ...overrides,
  };
}

export function createMockUser(overrides = {}) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    age: 15,
    ageGroup: '13-15',
    position: 'MIDFIELDER',
    role: 'PLAYER',
    teamId: null,
    ...overrides,
  };
}

export function createMockTeam(overrides = {}) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test Team',
    coachId: 'test-coach-id',
    ageGroup: '13-15',
    season: '2024',
    ...overrides,
  };
}

// Assertion helpers
export function expectSuccessResponse(response: Response) {
  expect(response.ok).toBe(true);
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
}

export function expectErrorResponse(response: Response, expectedStatus?: number) {
  expect(response.ok).toBe(false);
  if (expectedStatus) {
    expect(response.status).toBe(expectedStatus);
  }
}

export async function expectJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  expect(contentType).toContain('application/json');
  const data = await response.json();
  expect(data).toBeDefined();
  return data;
}

// Rate limiting helper
export async function waitForRateLimit(ms = 100) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// Database seeding for integration tests
export async function seedTestDatabase() {
  // Create test teams
  const teams = await Promise.all([
    createTestTeam({ name: 'U10 Lions', ageGroup: '10-12' }),
    createTestTeam({ name: 'U15 Tigers', ageGroup: '13-15' }),
    createTestTeam({ name: 'U20 Eagles', ageGroup: '19-25' }),
  ]);
  
  // Create test users
  const users = await Promise.all([
    createTestUser({ ...createMockUser(), teamId: teams[0].id, age: 11 }),
    createTestUser({ ...createMockUser(), teamId: teams[1].id, age: 14 }),
    createTestUser({ ...createMockUser(), teamId: teams[2].id, age: 21 }),
  ]);
  
  // Create test food entries
  const foodEntries = [];
  for (const user of users) {
    for (let i = 0; i < 5; i++) {
      foodEntries.push(
        await createTestFoodEntry(createMockFoodEntry(), user.id)
      );
    }
  }
  
  return { teams, users, foodEntries };
}

// Export test utilities
export default {
  API_BASE_URL,
  TEST_DATABASE_URL,
  testTokens,
  testCredentials,
  authenticateUser,
  makeAuthenticatedRequest,
  createTestUser,
  createTestFoodEntry,
  cleanupTestData,
  createMockFoodEntry,
  createMockUser,
  createMockTeam,
  expectSuccessResponse,
  expectErrorResponse,
  expectJsonResponse,
  waitForRateLimit,
  seedTestDatabase,
};