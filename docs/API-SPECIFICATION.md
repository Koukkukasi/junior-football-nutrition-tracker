# API Specification - Junior Football Nutrition Tracker

## Overview

This document defines the REST API specification for the Junior Football Nutrition Tracker backend. The API follows RESTful principles and provides endpoints for nutrition tracking, performance monitoring, and team management for junior football players.

## Base Configuration

**Base URL**: `https://api.nutrition-tracker.app/v1`  
**Authentication**: Bearer Token (JWT)  
**Content-Type**: `application/json`  
**API Version**: v1

## Authentication

### POST /auth/register
Register a new user account.

**Request Body**:
```typescript
interface RegisterRequest {
  email: string;           // Valid email address
  password: string;        // Min 8 chars, 1 uppercase, 1 number
  name: string;           // Full name
  age: number;            // Age in years
  position?: string;      // Football position
  teamCode?: string;      // Optional team join code
}
```

**Response** (201 Created):
```typescript
interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    age: number;
    position?: string;
    teamId?: string;
    role: 'PLAYER' | 'COACH';
  };
  token: string;
  expiresAt: string;
}
```

### POST /auth/login
Authenticate existing user.

**Request Body**:
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response** (200 OK):
```typescript
interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    age: number;
    position?: string;
    teamId?: string;
    role: 'PLAYER' | 'COACH';
  };
  token: string;
  expiresAt: string;
}
```

### POST /auth/refresh
Refresh authentication token.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```typescript
interface RefreshResponse {
  token: string;
  expiresAt: string;
}
```

## Food Logging

### POST /food-entries
Log a new food entry.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```typescript
interface FoodEntryRequest {
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'PRE_TRAINING' | 'POST_TRAINING';
  time: string;           // ISO 8601 timestamp
  location?: string;      // Optional location
  foods: FoodItem[];
}

interface FoodItem {
  name: string;           // Food name
  quantity: number;       // Amount consumed
  unit: string;          // Unit (grams, cups, pieces, etc.)
  calories?: number;     // Optional if known
  protein?: number;      // Grams
  carbs?: number;        // Grams
  fat?: number;          // Grams
}
```

**Response** (201 Created):
```typescript
interface FoodEntryResponse {
  id: string;
  userId: string;
  mealType: string;
  time: string;
  location?: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
}
```

### GET /food-entries
Retrieve user's food entries with optional filtering.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `mealType` (optional): Filter by meal type
- `limit` (optional): Number of entries to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response** (200 OK):
```typescript
interface FoodEntriesResponse {
  entries: FoodEntryResponse[];
  total: number;
  hasMore: boolean;
}
```

### PUT /food-entries/:id
Update existing food entry.

**Headers**: `Authorization: Bearer <token>`

**Request Body**: Same as POST /food-entries

**Response** (200 OK): Same as FoodEntryResponse

### DELETE /food-entries/:id
Delete food entry.

**Headers**: `Authorization: Bearer <token>`

**Response** (204 No Content)

## Performance Tracking

### POST /performance-metrics
Log daily performance metrics.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```typescript
interface PerformanceMetricsRequest {
  date: string;              // YYYY-MM-DD
  energyLevel: number;       // 1-10 scale
  sleepHours: number;        // Hours of sleep
  sleepQuality: number;      // 1-10 scale
  hydrationGlasses: number;  // Number of glasses
  mood: number;              // 1-10 scale
  trainingIntensity?: number; // 1-10 scale (if training day)
  injuries?: string[];       // Array of injury descriptions
  notes?: string;            // Additional notes
}
```

**Response** (201 Created):
```typescript
interface PerformanceMetricsResponse {
  id: string;
  userId: string;
  date: string;
  energyLevel: number;
  sleepHours: number;
  sleepQuality: number;
  hydrationGlasses: number;
  mood: number;
  trainingIntensity?: number;
  injuries?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### GET /performance-metrics
Retrieve performance metrics with filtering.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)
- `limit` (optional): Number of entries (default: 30)

**Response** (200 OK):
```typescript
interface PerformanceMetricsListResponse {
  metrics: PerformanceMetricsResponse[];
  total: number;
}
```

## Team Management

### POST /teams
Create a new team (coach only).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```typescript
interface CreateTeamRequest {
  name: string;           // Team name
  description?: string;   // Optional description
}
```

**Response** (201 Created):
```typescript
interface TeamResponse {
  id: string;
  name: string;
  description?: string;
  teamCode: string;       // Unique join code
  coachId: string;
  memberCount: number;
  createdAt: string;
}
```

### POST /teams/join
Join team using team code.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```typescript
interface JoinTeamRequest {
  teamCode: string;
}
```

**Response** (200 OK):
```typescript
interface JoinTeamResponse {
  team: TeamResponse;
  message: string;
}
```

### GET /teams/:id/members
Get team members (coach only).

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```typescript
interface TeamMembersResponse {
  members: {
    id: string;
    name: string;
    age: number;
    position?: string;
    joinedAt: string;
    lastActive: string;
  }[];
  total: number;
}
```

## Analytics & Reporting

### GET /analytics/nutrition-summary
Get nutrition analytics for date range.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `userId` (optional): Specific user ID (coach access only)

**Response** (200 OK):
```typescript
interface NutritionSummaryResponse {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  daily: {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goalAchievement: {
    calories: number;    // Percentage
    protein: number;
    carbs: number;
    fat: number;
  };
}
```

### GET /analytics/performance-trends
Get performance trends analysis.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `userId` (optional): Specific user ID (coach access only)

**Response** (200 OK):
```typescript
interface PerformanceTrendsResponse {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  trends: {
    energyLevel: {
      average: number;
      trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
      changePercent: number;
    };
    sleepQuality: {
      average: number;
      trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
      changePercent: number;
    };
    mood: {
      average: number;
      trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
      changePercent: number;
    };
  };
  correlations: {
    nutritionPerformance: number;    // -1 to 1
    sleepPerformance: number;
    hydrationPerformance: number;
  };
}
```

## Food Database

### GET /foods/search
Search food database for nutrition information.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `q`: Search query
- `limit` (optional): Results limit (default: 20)

**Response** (200 OK):
```typescript
interface FoodSearchResponse {
  foods: {
    id: string;
    name: string;
    brand?: string;
    calories: number;        // Per 100g
    protein: number;         // Per 100g
    carbs: number;          // Per 100g
    fat: number;            // Per 100g
    fiber?: number;         // Per 100g
    sugar?: number;         // Per 100g
    sodium?: number;        // Per 100g
    commonServings: {
      name: string;         // e.g., "1 cup", "1 piece"
      grams: number;
    }[];
  }[];
  total: number;
}
```

## Notifications

### GET /notifications
Get user notifications.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `unreadOnly` (optional): Boolean to filter unread only
- `limit` (optional): Number of notifications (default: 50)

**Response** (200 OK):
```typescript
interface NotificationsResponse {
  notifications: {
    id: string;
    type: 'MEAL_REMINDER' | 'PERFORMANCE_LOG' | 'TEAM_MESSAGE' | 'GOAL_ACHIEVEMENT';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    actionUrl?: string;
  }[];
  unreadCount: number;
}
```

### PUT /notifications/:id/read
Mark notification as read.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```typescript
interface NotificationReadResponse {
  id: string;
  read: boolean;
}
```

## Error Handling

All endpoints follow consistent error response format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
  };
}
```

### Common HTTP Status Codes

- **200 OK**: Successful GET/PUT/PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Invalid or missing authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (duplicate email, etc.)
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DUPLICATE_RESOURCE`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Data modification**: 60 requests per minute per user
- **Data retrieval**: 300 requests per minute per user
- **Search endpoints**: 100 requests per minute per user

Rate limit headers included in responses:
- `X-RateLimit-Limit`: Requests allowed per window
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Window reset time (Unix timestamp)

## Development Notes

### Testing
- Use `https://api-staging.nutrition-tracker.app/v1` for staging environment
- Test data is reset daily in staging
- Rate limits are relaxed in development environment

### Versioning
- API versioning through URL path (`/v1/`)
- Breaking changes require version increment
- Backward compatibility maintained for 6 months

### CORS
- Allowed origins configured per environment
- Credentials included for authentication
- Preflight requests cached for 24 hours

### Security
- All requests over HTTPS
- JWT tokens expire after 24 hours
- Refresh tokens valid for 30 days
- Password requirements: min 8 chars, 1 uppercase, 1 number
- SQL injection prevention through parameterized queries
- XSS prevention through input sanitization

This API specification provides a comprehensive foundation for building the Junior Football Nutrition Tracker frontend applications while ensuring security, performance, and scalability.