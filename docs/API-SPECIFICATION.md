# API Specification - Junior Football Nutrition Tracker

## Overview

This document defines the complete REST API specification for the Junior Football Nutrition Tracker backend. The API follows RESTful principles and uses JSON for data exchange.

## Base Configuration

**Base URL**: `https://api.nutrition-tracker.com/v1`  
**Authentication**: Bearer token (JWT via Clerk)  
**Content-Type**: `application/json`  
**API Version**: v1

### Standard Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}
```

### Error Codes

```typescript
enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body**:
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  age: number;
  position: 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
  teamCode?: string;
}
```

**Response**:
```typescript
interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    age: number;
    position: string;
    teamId?: string;
    createdAt: string;
  };
  token: string;
}
```

**Status Codes**:
- `201` - User created successfully
- `400` - Validation error (email exists, invalid data)
- `404` - Team code not found

### Login User
```http
POST /auth/login
```

**Request Body**:
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response**:
```typescript
interface LoginResponse {
  user: UserProfile;
  token: string;
  expiresAt: string;
}
```

**Status Codes**:
- `200` - Login successful
- `401` - Invalid credentials
- `429` - Too many attempts

### Get Profile
```http
GET /auth/profile
Authorization: Bearer {token}
```

**Response**:
```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  position: string;
  teamId?: string;
  teamName?: string;
  role: 'player' | 'coach';
  createdAt: string;
  lastLoginAt: string;
}
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer {token}
```

**Request Body**:
```typescript
interface UpdateProfileRequest {
  name?: string;
  age?: number;
  position?: string;
}
```

---

## Food Logging Endpoints

### Create Food Entry
```http
POST /api/food-entries
Authorization: Bearer {token}
```

**Request Body**:
```typescript
interface CreateFoodEntryRequest {
  mealType: 'aamupala' | 'välipala' | 'lounas' | 'päivällinen' | 'iltapala';
  time: string; // HH:MM format
  location: string;
  foods: string;
  notes?: string;
  date: string; // YYYY-MM-DD format
}
```

**Response**:
```typescript
interface FoodEntry {
  id: string;
  userId: string;
  mealType: string;
  time: string;
  location: string;
  foods: string;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
```

**Status Codes**:
- `201` - Entry created
- `400` - Validation error
- `401` - Unauthorized

### Get Food Entries
```http
GET /api/food-entries?date={YYYY-MM-DD}&limit={number}&offset={number}
Authorization: Bearer {token}
```

**Query Parameters**:
- `date` (optional) - Filter by specific date
- `startDate` (optional) - Filter from date (inclusive)
- `endDate` (optional) - Filter to date (inclusive)
- `mealType` (optional) - Filter by meal type
- `limit` (optional) - Number of entries to return (default: 50)
- `offset` (optional) - Number of entries to skip (default: 0)

**Response**:
```typescript
interface GetFoodEntriesResponse {
  entries: FoodEntry[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

### Update Food Entry
```http
PUT /api/food-entries/{id}
Authorization: Bearer {token}
```

**Request Body**: Same as CreateFoodEntryRequest (all fields optional)

**Response**: Updated FoodEntry object

**Status Codes**:
- `200` - Entry updated
- `404` - Entry not found
- `403` - Not authorized to update this entry

### Delete Food Entry
```http
DELETE /api/food-entries/{id}
Authorization: Bearer {token}
```

**Response**: `204 No Content`

**Status Codes**:
- `204` - Entry deleted
- `404` - Entry not found
- `403` - Not authorized to delete this entry

### Get Daily Summary
```http
GET /api/food-entries/summary?date={YYYY-MM-DD}
Authorization: Bearer {token}
```

**Response**:
```typescript
interface DailySummary {
  date: string;
  totalEntries: number;
  mealTypes: {
    aamupala: number;
    välipala: number;
    lounas: number;
    päivällinen: number;
    iltapala: number;
  };
  completionRate: number; // Percentage
  firstMeal?: string; // Time of first meal
  lastMeal?: string; // Time of last meal
}
```

---

## Performance Tracking Endpoints

### Create Performance Entry
```http
POST /api/performance
Authorization: Bearer {token}
```

**Request Body**:
```typescript
interface CreatePerformanceRequest {
  date: string; // YYYY-MM-DD
  energyLevel: 1 | 2 | 3 | 4 | 5;
  sleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  isTrainingDay?: boolean;
  trainingIntensity?: 1 | 2 | 3 | 4 | 5;
  trainingPerformance?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}
```

**Response**:
```typescript
interface PerformanceEntry {
  id: string;
  userId: string;
  date: string;
  energyLevel: number;
  sleepHours?: number;
  sleepQuality?: number;
  isTrainingDay: boolean;
  trainingIntensity?: number;
  trainingPerformance?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Get Performance Entries
```http
GET /api/performance?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}
Authorization: Bearer {token}
```

**Query Parameters**:
- `date` - Specific date
- `startDate` - From date (inclusive)
- `endDate` - To date (inclusive)
- `limit` - Number of entries (default: 30)

**Response**:
```typescript
interface GetPerformanceResponse {
  entries: PerformanceEntry[];
  summary: {
    averageEnergyLevel: number;
    averageSleepHours: number;
    trainingDays: number;
    totalDays: number;
  };
}
```

### Update Performance Entry
```http
PUT /api/performance/{id}
Authorization: Bearer {token}
```

**Request Body**: Same as CreatePerformanceRequest (all fields optional)

### Get Performance Summary
```http
GET /api/performance/summary?period={week|month|year}
Authorization: Bearer {token}
```

**Response**:
```typescript
interface PerformanceSummary {
  period: string;
  averageEnergyLevel: number;
  energyTrend: 'improving' | 'declining' | 'stable';
  sleepConsistency: number; // 0-100 percentage
  trainingDaysPerWeek: number;
  bestEnergyDays: string[]; // Days of week
  recommendations: string[];
}
```

---

## Team & Coach Endpoints

### Get Team Players
```http
GET /api/teams/{teamId}/players
Authorization: Bearer {token}
```

**Response**:
```typescript
interface TeamPlayer {
  id: string;
  name: string;
  age: number;
  position: string;
  lastActive: string;
  weeklyCompletionRate: number;
  currentStreak: number;
  averageEnergyLevel: number;
}

interface GetTeamPlayersResponse {
  players: TeamPlayer[];
  teamStats: {
    totalPlayers: number;
    activeToday: number;
    averageCompletionRate: number;
    topPerformers: string[]; // Player IDs
  };
}
```

**Authorization**: Only coaches can access their team's data

### Get Player Summary (Coach View)
```http
GET /api/players/{playerId}/summary?period={week|month}
Authorization: Bearer {token}
```

**Response**:
```typescript
interface PlayerSummary {
  player: {
    id: string;
    name: string;
    age: number;
    position: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  nutrition: {
    totalEntries: number;
    completionRate: number;
    consistencyScore: number;
    mealPatterns: {
      averageFirstMeal: string;
      averageLastMeal: string;
      mostCommonLocations: string[];
    };
  };
  performance: {
    averageEnergyLevel: number;
    energyConsistency: number;
    averageSleepHours: number;
    trainingDays: number;
    correlations: {
      sleepEnergyCorrelation: number;
      nutritionEnergyCorrelation: number;
    };
  };
  trends: {
    energyTrend: 'improving' | 'declining' | 'stable';
    consistencyTrend: 'improving' | 'declining' | 'stable';
  };
  alerts: {
    type: 'low_completion' | 'energy_decline' | 'sleep_issues';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}
```

### Create Team
```http
POST /api/teams
Authorization: Bearer {token}
```

**Request Body**:
```typescript
interface CreateTeamRequest {
  name: string;
  description?: string;
}
```

**Response**:
```typescript
interface Team {
  id: string;
  name: string;
  description?: string;
  teamCode: string; // Auto-generated unique code
  coachId: string;
  playerCount: number;
  createdAt: string;
}
```

### Join Team
```http
POST /api/teams/join
Authorization: Bearer {token}
```

**Request Body**:
```typescript
interface JoinTeamRequest {
  teamCode: string;
}
```

---

## Analytics & Reporting Endpoints

### Get User Analytics
```http
GET /api/analytics/user?period={week|month|quarter|year}
Authorization: Bearer {token}
```

**Response**:
```typescript
interface UserAnalytics {
  period: string;
  nutrition: {
    totalEntries: number;
    completionRate: number;
    streak: {
      current: number;
      longest: number;
    };
    patterns: {
      mostActiveHours: string[];
      preferredLocations: string[];
      mealFrequency: Record<string, number>;
    };
  };
  performance: {
    energyStats: {
      average: number;
      min: number;
      max: number;
      trend: number; // Positive/negative change
    };
    sleepStats: {
      averageHours: number;
      consistency: number;
      qualityAverage: number;
    };
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    unlockedAt: string;
  }[];
}
```

### Export Data
```http
GET /api/export?format={csv|pdf}&startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}
Authorization: Bearer {token}
```

**Query Parameters**:
- `format` - Export format (csv or pdf)
- `startDate` - Start date for export
- `endDate` - End date for export
- `includePerformance` - Include performance data (default: true)

**Response**: File download or signed URL for download

### Team Analytics (Coach Only)
```http
GET /api/analytics/team/{teamId}?period={week|month}
Authorization: Bearer {token}
```

**Response**:
```typescript
interface TeamAnalytics {
  team: {
    id: string;
    name: string;
    playerCount: number;
  };
  period: string;
  overview: {
    totalEntries: number;
    averageCompletionRate: number;
    activePlayersPercentage: number;
    teamEnergyAverage: number;
  };
  trends: {
    completionTrend: number; // Week over week change
    energyTrend: number;
    engagementTrend: number;
  };
  playerRankings: {
    byCompletion: PlayerRanking[];
    byConsistency: PlayerRanking[];
    byImprovement: PlayerRanking[];
  };
  insights: {
    topPerformingDays: string[];
    commonNutritionPatterns: string[];
    recommendedActions: string[];
  };
}

interface PlayerRanking {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
}
```

---

## Food Database Endpoints

### Search Foods
```http
GET /api/foods/search?q={query}&limit={number}
```

**Query Parameters**:
- `q` - Search query
- `limit` - Number of results (default: 10, max: 50)
- `category` - Food category filter

**Response**:
```typescript
interface FoodSearchResult {
  id: string;
  name: string;
  category: string;
  commonPortions: string[];
  nutritionPer100g?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface SearchFoodsResponse {
  foods: FoodSearchResult[];
  total: number;
}
```

### Get Food Details
```http
GET /api/foods/{id}
```

**Response**:
```typescript
interface FoodDetails {
  id: string;
  name: string;
  category: string;
  description?: string;
  commonPortions: {
    name: string;
    grams: number;
  }[];
  nutrition: {
    per100g: NutritionData;
    perServing?: NutritionData;
  };
  tags: string[];
}

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}
```

---

## Notification Endpoints

### Get Notifications
```http
GET /api/notifications?unread={boolean}
Authorization: Bearer {token}
```

**Response**:
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'meal_reminder' | 'achievement' | 'coach_message' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
```

### Mark Notification Read
```http
PUT /api/notifications/{id}/read
Authorization: Bearer {token}
```

---

## Rate Limiting

All endpoints are rate-limited based on user authentication:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated endpoints**: 100 requests per hour per IP
- **File uploads**: 10 requests per minute
- **Export operations**: 5 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## Webhooks

### Coach Notifications
When configured, webhooks can notify external systems of important events:

```typescript
interface WebhookPayload {
  event: 'player_inactive' | 'low_completion' | 'achievement_unlocked';
  timestamp: string;
  data: {
    playerId: string;
    teamId: string;
    details: any;
  };
}
```

---

## Error Handling Examples

### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "age": "Age must be between 10 and 18"
      }
    }
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Food entry not found"
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

---

## Development Notes

### API Versioning
- Version included in URL path (`/v1/`)
- Backward compatibility maintained for one major version
- Deprecation warnings sent via headers

### Database Considerations
- All timestamps in UTC
- Soft deletes for critical data (food entries, performance data)
- Audit logging for sensitive operations
- Regular backups with point-in-time recovery

### Security
- HTTPS required for all endpoints
- JWT tokens expire after 24 hours
- Refresh token mechanism for extended sessions
- CORS configured for known frontend domains
- Input validation and sanitization on all endpoints
- SQL injection prevention via parameterized queries

This API specification provides a complete backend interface for the Junior Football Nutrition Tracker, supporting all core functionality while maintaining security, performance, and scalability requirements.
