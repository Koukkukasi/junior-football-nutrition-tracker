# Junior Football Nutrition Tracker API

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the API server
npm run setup:api

# Or for development with auto-reload
npm run api:dev
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3001`
- Production: `https://api.nutrition-tracker.com`

### Authentication
All endpoints require authentication unless marked as public. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 📋 Available Endpoints

### Users
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/users` | List all users | ✅ | ADMIN |
| GET | `/api/v1/users/:id` | Get user by ID | ✅ | Self/COACH/ADMIN |
| POST | `/api/v1/users` | Create new user | ✅ | ADMIN |
| PUT | `/api/v1/users/:id` | Update user | ✅ | Self/ADMIN |
| DELETE | `/api/v1/users/:id` | Delete user | ✅ | ADMIN |
| GET | `/api/v1/users/:id/dashboard` | Get user dashboard | ✅ | Self/COACH |

### Teams
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/teams` | List all teams | ✅ | Any |
| GET | `/api/v1/teams/:id` | Get team by ID | ✅ | Member/COACH/ADMIN |
| POST | `/api/v1/teams` | Create new team | ✅ | COACH/ADMIN |
| PUT | `/api/v1/teams/:id` | Update team | ✅ | COACH/ADMIN |
| DELETE | `/api/v1/teams/:id` | Delete team | ✅ | ADMIN |
| GET | `/api/v1/teams/:id/statistics` | Get team statistics | ✅ | Member/COACH |
| POST | `/api/v1/teams/join` | Join team with code | ✅ | PLAYER |

### Food Entries
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/food-entries` | List food entries | ✅ | Self/COACH |
| GET | `/api/v1/food-entries/:id` | Get food entry | ✅ | Self/COACH |
| POST | `/api/v1/food-entries` | Create food entry | ✅ | PLAYER |
| PUT | `/api/v1/food-entries/:id` | Update food entry | ✅ | Self |
| DELETE | `/api/v1/food-entries/:id` | Delete food entry | ✅ | Self/ADMIN |

### Performance Metrics
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/performance-metrics` | List metrics | ✅ | Self/COACH |
| GET | `/api/v1/performance-metrics/:id` | Get metric | ✅ | Self/COACH |
| POST | `/api/v1/performance-metrics` | Create metric | ✅ | PLAYER |
| PUT | `/api/v1/performance-metrics/:id` | Update metric | ✅ | Self |
| DELETE | `/api/v1/performance-metrics/:id` | Delete metric | ✅ | Self/ADMIN |

### Nutrition Goals
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/nutrition-goals` | List goals | ✅ | Self/COACH |
| GET | `/api/v1/nutrition-goals/:id` | Get goal | ✅ | Self/COACH |
| POST | `/api/v1/nutrition-goals` | Create goal | ✅ | Self/COACH |
| PUT | `/api/v1/nutrition-goals/:id` | Update goal | ✅ | Self/COACH |
| DELETE | `/api/v1/nutrition-goals/:id` | Delete goal | ✅ | Self/COACH |

### Achievements
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/achievements` | List achievements | ✅ | Self/COACH |
| GET | `/api/v1/achievements/:id` | Get achievement | ✅ | Self/COACH |
| POST | `/api/v1/achievements` | Grant achievement | ✅ | COACH/ADMIN |
| DELETE | `/api/v1/achievements/:id` | Revoke achievement | ✅ | ADMIN |

### Food Library
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/food-library` | List foods | ✅ | Any |
| GET | `/api/v1/food-library/:id` | Get food item | ✅ | Any |
| POST | `/api/v1/food-library` | Add food item | ✅ | COACH/ADMIN |
| PUT | `/api/v1/food-library/:id` | Update food item | ✅ | COACH/ADMIN |
| DELETE | `/api/v1/food-library/:id` | Delete food item | ✅ | ADMIN |
| GET | `/api/v1/food-library/search` | Search foods | ✅ | Any |

### Nutrition Analysis
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/v1/nutrition/analyze` | Analyze food description | ✅ | Any |

## 🔐 Authentication Flow

### 1. Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "age": 15,
  "role": "PLAYER",
  "parentEmail": "parent@example.com"
}
```

### 2. Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "SecurePassword123!"
}
```

Response:
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "player@example.com",
      "name": "John Doe",
      "role": "PLAYER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## 📊 Request/Response Format

### Standard Response Format
```json
{
  "data": {}, // Response data
  "meta": {
    "timestamp": "2025-01-01T12:00:00Z",
    "requestId": "req_123456789",
    "total": 100, // For paginated responses
    "limit": 20,
    "offset": 0
  }
}
```

### Error Response Format
```json
{
  "error": {
    "status": 400,
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "timestamp": "2025-01-01T12:00:00Z",
    "requestId": "req_123456789"
  }
}
```

## 🎯 Common Query Parameters

### Pagination
- `limit`: Number of items per page (default: 20, max: 100)
- `offset`: Number of items to skip
- `page`: Page number (alternative to offset)

### Filtering
- `filter`: JSON stringified filter object
- `startDate`: Filter by date range start
- `endDate`: Filter by date range end

### Sorting
- `sort`: JSON stringified sort object
- `orderBy`: Field to sort by
- `order`: Sort direction (asc/desc)

### Including Relations
- `include`: JSON stringified include object

Example:
```
GET /api/v1/food-entries?limit=10&page=2&filter={"mealType":"LUNCH"}&sort={"date":"desc"}
```

## 🚦 Rate Limiting

- Default: 100 requests per 15 minutes per IP/user
- Authenticated users: 200 requests per 15 minutes
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## 🔄 API Versioning

The API uses URL path versioning. Current version: `v1`

Deprecated versions will include headers:
- `X-API-Deprecation: true`
- `X-API-Deprecation-Date: 2025-01-01`
- `X-API-Sunset: 2025-06-01`

## 📈 Performance Guidelines

1. **Use pagination** for list endpoints
2. **Specify only needed fields** with `select` parameter
3. **Use caching headers** when appropriate
4. **Batch requests** when possible
5. **Include only necessary relations**

## 🧪 Testing

### Using cURL
```bash
# Get user profile
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/v1/users/me

# Create food entry
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"mealType":"LUNCH","description":"Chicken and rice","date":"2025-01-01","time":"12:30"}' \
  http://localhost:3001/api/v1/food-entries
```

### Using Postman
Import the Postman collection from `docs/api/postman-collection.json`

## 🛠 API Development Tools

### Generate new endpoints
```bash
npm run agent:api:generate <resource>
```

### Analyze API routes
```bash
npm run agent:api:analyze
```

### Generate documentation
```bash
npm run agent:api:docs openapi
npm run agent:api:docs postman
npm run agent:api:docs markdown
```

### Health check
```bash
npm run agent:api:health
```

## 📝 License

This API is part of the Junior Football Nutrition Tracker project.