# Database Schema Documentation

Generated: 2025-08-25T21:13:13.010Z
Version: 1.0.0

## Models

### User

Represents a user in the system (player, coach, or admin)

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| id | String |  | ✓ | uuid( | Unique identifier |
| clerkId | String |  | ✓ |  | clerkId |
| supabaseId | String |  | ✓ |  | supabaseId |
| email | String | ✓ | ✓ |  | User email address |
| name | String | ✓ |  |  | Display name |
| age | Int | ✓ |  |  | User age in years |
| role | UserRole |  |  | PLAYER | User role in the system |
| position | PlayerPosition |  |  |  | Player position on the field |
| parentEmail | String |  |  |  | parentEmail |
| dataConsent | Boolean |  |  | false | dataConsent |
| teamId | String |  |  |  | Reference to team |
| team | Team |  |  |  | team |
| ageGroup | String |  |  |  | ageGroup |
| goals | String[] |  |  | [] | goals |
| trainingDaysPerWeek | Int |  |  | 3 | trainingDaysPerWeek |
| completedOnboarding | Boolean |  |  | false | completedOnboarding |
| onboardingDate | DateTime |  |  |  | onboardingDate |
| preferences | Json |  |  |  | preferences |
| foodEntries | FoodEntry[] | ✓ |  |  | foodEntries |
| performanceMetrics | PerformanceMetric[] | ✓ |  |  | performanceMetrics |
| teams | TeamMember[] | ✓ |  |  | teams |
| nutritionGoals | NutritionGoal[] | ✓ |  |  | nutritionGoals |
| achievements | Achievement[] | ✓ |  |  | achievements |
| createdAt | DateTime |  |  | now( | Record creation timestamp |
| updatedAt | DateTime | ✓ |  |  | Last update timestamp |
| deletedAt | DateTime |  |  |  | deletedAt |

**Indexes:** clerkId, email, teamId

### Team

Represents a football team

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| id | String |  | ✓ | uuid( | Unique identifier |
| name | String | ✓ |  |  | Display name |
| inviteCode | String |  | ✓ | cuid( | inviteCode |
| description | String |  |  |  | description |
| coachId | String |  |  |  | coachId |
| players | User[] | ✓ |  |  | players |
| members | TeamMember[] | ✓ |  |  | members |
| createdAt | DateTime |  |  | now( | Record creation timestamp |
| updatedAt | DateTime | ✓ |  |  | Last update timestamp |

**Indexes:** inviteCode, coachId

### TeamMember

Junction table for user-team relationships

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| id | String |  | ✓ | uuid( | Unique identifier |
| userId | String | ✓ |  |  | Reference to user |
| user | User | ✓ |  |  | user |
| teamId | String | ✓ |  |  | Reference to team |
| team | Team | ✓ |  |  | team |
| role | String |  |  | "PLAYER" | User role in the system |
| joinedAt | DateTime |  |  | now( | joinedAt |

**Indexes:** userId, teamId
**Constraints:** UNIQUE(userId, teamId)

### FoodEntry

Records food consumption entries with nutrition analysis

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| id | String |  | ✓ | uuid( | Unique identifier |
| userId | String | ✓ |  |  | Reference to user |
| user | User | ✓ |  |  | user |
| date | DateTime | ✓ |  |  | Date of entry |
| mealType | MealType | ✓ |  |  | Type of meal |
| time | String | ✓ |  |  | time |
| location | String |  |  |  | location |
| description | String | ✓ |  |  | description |
| notes | String |  |  |  | notes |
| nutritionScore | Int |  |  |  | Calculated nutrition score (0-100) |
| quality | String |  |  |  | quality |
| calories | Int |  |  |  | calories |
| protein | Int |  |  |  | protein |
| carbs | Int |  |  |  | carbs |
| fats | Int |  |  |  | fats |
| createdAt | DateTime |  |  | now( | Record creation timestamp |
| updatedAt | DateTime | ✓ |  |  | Last update timestamp |

**Indexes:** userId, date, date

### PerformanceMetric

Tracks daily performance and recovery metrics

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| id | String |  | ✓ | uuid( | Unique identifier |
| userId | String | ✓ |  |  | Reference to user |
| user | User | ✓ |  |  | user |
| date | DateTime | ✓ |  |  | Date of entry |
| energyLevel | Int | ✓ |  |  | energyLevel |
| sleepHours | Float | ✓ |  |  | sleepHours |
| bedTime | String |  |  |  | bedTime |
| wakeTime | String |  |  |  | wakeTime |
| isTrainingDay | Boolean |  |  | false | isTrainingDay |
| trainingType | String |  |  |  | trainingType |
| matchDay | Boolean |  |  | false | matchDay |
| recoveryLevel | Int |  |  |  | recoveryLevel |
| hadRecoveryMeal | Boolean |  |  | false | hadRecoveryMeal |
| recoveryNotes | String |  |  |  | recoveryNotes |
| notes | String |  |  |  | notes |
| createdAt | DateTime |  |  | now( | Record creation timestamp |
| updatedAt | DateTime | ✓ |  |  | Last update timestamp |

**Indexes:** userId, date, date
**Constraints:** UNIQUE(userId, date)

### NutritionGoal

NutritionGoal model

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| id | String |  | ✓ | uuid( | Unique identifier |
| userId | String | ✓ |  |  | Reference to user |
| user | User | ✓ |  |  | user |
| goalType | String | ✓ |  |  | goalType |
| targetValue | Float | ✓ |  |  | targetValue |
| unit | String | ✓ |  |  | unit |
| startDate | DateTime | ✓ |  |  | startDate |
| endDate | DateTime |  |  |  | endDate |
| isActive | Boolean |  |  | true | isActive |
| progress | Float |  |  | 0 | progress |
| createdAt | DateTime |  |  | now( | Record creation timestamp |
| updatedAt | DateTime | ✓ |  |  | Last update timestamp |

**Indexes:** userId, goalType, isActive

### Achievement

Achievement model

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| id | String |  | ✓ | uuid( | Unique identifier |
| userId | String | ✓ |  |  | Reference to user |
| user | User | ✓ |  |  | user |
| type | String | ✓ |  |  | type |
| name | String | ✓ |  |  | Display name |
| description | String | ✓ |  |  | description |
| icon | String |  |  |  | icon |
| earnedAt | DateTime |  |  | now( | earnedAt |
| metadata | Json |  |  |  | metadata |

**Indexes:** userId, type, earnedAt

### FoodLibrary

FoodLibrary model

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| id | String |  | ✓ | uuid( | Unique identifier |
| name | String | ✓ | ✓ |  | Display name |
| nameFi | String |  |  |  | nameFi |
| category | String | ✓ |  |  | category |
| subcategory | String |  |  |  | subcategory |
| nutritionData | Json | ✓ |  |  | nutritionData |
| servingSizes | Json |  |  |  | servingSizes |
| isNordic | Boolean |  |  | false | isNordic |
| isVerified | Boolean |  |  | false | isVerified |
| tags | String[] | ✓ |  |  | tags |
| barcode | String |  |  |  | barcode |
| brand | String |  |  |  | brand |
| createdAt | DateTime |  |  | now( | Record creation timestamp |
| updatedAt | DateTime | ✓ |  |  | Last update timestamp |

**Indexes:** category, isNordic, isVerified, name

## Enums

### UserRole

Defines user roles in the system

Values: PLAYER, COACH, ADMIN

### PlayerPosition

Football player positions

Values: GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD

### MealType

Types of meals throughout the day

Values: BREAKFAST, SNACK, LUNCH, DINNER, EVENING_SNACK, AFTER_PRACTICE

## Relationships

| From | To | Type | Field | Description |
|------|-----|------|-------|-------------|
| Model | User | one-to-one | user | Relationship via user |
| Model | Team | one-to-one | team | Relationship via team |
| Model | User | one-to-one | user | Relationship via user |
| Model | User | one-to-one | user | Relationship via user |
| Model | User | one-to-one | user | Relationship via user |
| Model | User | one-to-one | user | Relationship via user |
