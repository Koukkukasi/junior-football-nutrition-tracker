# API Documentation

## Base URL

http://localhost:3001

## Endpoints

### user

#### GET /api/v1/user/

GET user

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### GET /api/v1/user/:id

GET user

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### POST /api/v1/user/

POST user

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PUT /api/v1/user/:id

PUT user

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PATCH /api/v1/user/:id

PATCH user

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### DELETE /api/v1/user/:id

DELETE user

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### team

#### GET /api/v1/team/

GET team

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### GET /api/v1/team/:id

GET team

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### POST /api/v1/team/

POST team

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PUT /api/v1/team/:id

PUT team

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PATCH /api/v1/team/:id

PATCH team

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### DELETE /api/v1/team/:id

DELETE team

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### foodEntry

#### GET /api/v1/foodEntry/

GET foodEntry

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### GET /api/v1/foodEntry/:id

GET foodEntry

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### POST /api/v1/foodEntry/

POST foodEntry

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PUT /api/v1/foodEntry/:id

PUT foodEntry

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PATCH /api/v1/foodEntry/:id

PATCH foodEntry

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### DELETE /api/v1/foodEntry/:id

DELETE foodEntry

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### performanceMetric

#### GET /api/v1/performanceMetric/

GET performanceMetric

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### GET /api/v1/performanceMetric/:id

GET performanceMetric

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### POST /api/v1/performanceMetric/

POST performanceMetric

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PUT /api/v1/performanceMetric/:id

PUT performanceMetric

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PATCH /api/v1/performanceMetric/:id

PATCH performanceMetric

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### DELETE /api/v1/performanceMetric/:id

DELETE performanceMetric

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### nutritionGoal

#### GET /api/v1/nutritionGoal/

GET nutritionGoal

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### GET /api/v1/nutritionGoal/:id

GET nutritionGoal

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### POST /api/v1/nutritionGoal/

POST nutritionGoal

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PUT /api/v1/nutritionGoal/:id

PUT nutritionGoal

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PATCH /api/v1/nutritionGoal/:id

PATCH nutritionGoal

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### DELETE /api/v1/nutritionGoal/:id

DELETE nutritionGoal

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### achievement

#### GET /api/v1/achievement/

GET achievement

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### GET /api/v1/achievement/:id

GET achievement

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### POST /api/v1/achievement/

POST achievement

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PUT /api/v1/achievement/:id

PUT achievement

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PATCH /api/v1/achievement/:id

PATCH achievement

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### DELETE /api/v1/achievement/:id

DELETE achievement

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### foodLibrary

#### GET /api/v1/foodLibrary/

GET foodLibrary

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### GET /api/v1/foodLibrary/:id

GET foodLibrary

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### POST /api/v1/foodLibrary/

POST foodLibrary

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PUT /api/v1/foodLibrary/:id

PUT foodLibrary

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### PATCH /api/v1/foodLibrary/:id

PATCH foodLibrary

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

#### DELETE /api/v1/foodLibrary/:id

DELETE foodLibrary

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### nutrition

#### POST /nutrition/analyze

Analyze nutrition content of food description

**Request Body:**
```json
{
  "description": {
    "type": "string",
    "required": true
  },
  "ageGroup": {
    "type": "enum",
    "values": [
      "10-12",
      "13-15",
      "16-18",
      "19-25"
    ]
  }
}
```

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### teams

#### GET /teams/:id/statistics

Get team nutrition statistics

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### analytics

#### GET /teams/:id/statistics

Get team nutrition statistics

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### users

#### GET /users/:id/dashboard

Get player dashboard data

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### dashboard

#### GET /users/:id/dashboard

Get player dashboard data

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### food

#### GET /food-library/search

Search food library

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

### search

#### GET /food-library/search

Search food library

**Response:**
```json
{
  "data": {},
  "meta": {}
}
```

