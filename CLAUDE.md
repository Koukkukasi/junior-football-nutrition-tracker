# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Junior Football Nutrition Tracker project.

## 🚨 CRITICAL DEVELOPMENT RULE 🚨

**⚠️ MANDATORY: Code Review Agent MUST be used for ALL code changes - NO EXCEPTIONS**

Before making ANY modification to this codebase:
1. ✅ ALWAYS engage the Code Review Agent first
2. ✅ Work side-by-side with the agent during development  
3. ✅ Get agent approval before proceeding with changes
4. ✅ No code commits without agent sign-off

This rule applies to ALL changes: single line edits, bug fixes, new features, configuration updates, etc.

## Project Overview

**Project**: Junior Football Nutrition Tracker  
**Purpose**: Comprehensive nutrition and performance tracking for junior football players (ages 10-25) and their coaches  
**Status**: Week 1-2 completed, Week 3-4 development ready  
**Architecture**: Full-stack TypeScript monorepo with client/server separation  

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL 16 (Docker containerized)
- **Authentication**: Clerk (OAuth, JWT tokens)
- **Testing**: Playwright (E2E), Jest (unit tests)
- **Deployment**: Docker Compose for development

### Current Status (Week 1-2 Completed ✅)
- ✅ Full project structure with monorepo architecture
- ✅ PostgreSQL database with Prisma ORM and comprehensive schema
- ✅ Clerk authentication integration with protected routes
- ✅ React frontend with modern UI components and Tailwind styling
- ✅ Comprehensive Playwright test suite (22 auth scenarios)
- ✅ Food database with 74+ keywords and age-specific scoring
- ✅ Design compliance fixes and documentation accuracy

## Development Commands

### Quick Start
```bash
# Start database
docker-compose up -d

# Backend setup
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend setup (new terminal)
cd client
npm install
npm run dev
```

### Database Management
```bash
cd server
npx prisma studio          # Database GUI
npx prisma generate         # Generate client
npx prisma migrate dev      # Run migrations
npx prisma migrate reset    # Reset database
```

### Testing Commands
```bash
cd client
npm run test               # Run all Playwright tests
npm run test:ui           # Playwright UI mode
npm run test:headed       # Run tests with browser UI
npm run test:debug        # Debug mode
npm run test:report       # View test results
npm run test:auth         # Auth-specific tests
npm run test:visual       # Visual regression tests
```

### Development Workflow
```bash
# Backend
cd server
npm run dev              # Development server (nodemon)
npm run build            # TypeScript build
npm run lint             # ESLint
npm run test             # Jest unit tests

# Frontend
cd client
npm run dev              # Vite development server
npm run build            # Production build
npm run preview          # Preview build
npm run lint             # ESLint
```

## Sub-Agent Orchestration Guidelines

When working on this project, utilize specialized agents for different domains:

### 1. Code Review Agent 🔍 **[MANDATORY - Use with ALL code changes]**
**⚠️ CRITICAL RULE: The Code Review Agent MUST be engaged for every single code modification, no exceptions.**

**Responsibilities**:
- Review all code changes for correctness, security, and performance
- Identify race conditions, memory leaks, and edge cases
- Validate error handling patterns and security considerations
- Ensure consistent coding patterns across the codebase
- Performance analysis and optimization recommendations

**Usage Pattern**:
```typescript
// ALWAYS engage Code Review Agent when:
- Making ANY code changes (even 1 line changes)
- Implementing new API endpoints or database operations
- Modifying authentication or security-related code
- Fixing bugs or resolving errors
- Refactoring existing functionality
- Adding new features or components
- Updating configuration files
- Modifying environment variables
- Creating new tests or updating existing ones
```

**Mandatory Integration Workflow**:
1. **Before Implementation**: ALWAYS engage agent to review approach and identify potential issues
2. **During Development**: Work side-by-side for ALL changes (mandatory collaboration)
3. **After Changes**: MANDATORY review of all modifications before testing
4. **Bug Fixes**: ALWAYS use agent to identify root cause and validate fixes
5. **No Code Commits**: Without Code Review Agent approval and sign-off

**Enforcement Rules**:
- ❌ NO code changes without Code Review Agent involvement
- ❌ NO exceptions for "small" or "trivial" changes
- ❌ NO solo development without agent collaboration
- ✅ ALWAYS start with Code Review Agent engagement
- ✅ ALWAYS get agent approval before proceeding
- ✅ ALWAYS include agent in problem-solving discussions

### 2. Testing Agent 🧪
**Responsibilities**:
- Playwright test development and execution
- E2E scenario creation and validation
- Test result analysis and reporting
- Visual regression testing

**Usage Pattern**:
```typescript
// Use Testing Agent for:
- Creating new test scenarios
- Debugging failing tests
- Setting up test data and mocks
- Validating user workflows
```

### 2. UI Agent 🎨
**Responsibilities**:
- Frontend component development
- Tailwind CSS styling and design compliance
- React state management and hooks
- Mobile-responsive design

**Usage Pattern**:
```typescript
// Use UI Agent for:
- Building new React components
- Styling and layout improvements
- Form validation and user interactions
- Design system compliance
```

### 3. Nutrition Agent 🥗
**Responsibilities**:
- Food database expansion and management
- Nutrition scoring algorithms
- Age-specific recommendation logic
- Sports nutrition intelligence

**Usage Pattern**:
```typescript
// Use Nutrition Agent for:
- Adding new food keywords
- Improving scoring algorithms
- Age-based nutritional adjustments
- Finnish/Nordic food integration
```

### Agent Collaboration Example
```bash
# Multi-agent workflow for new feature
1. Testing Agent: Write E2E tests for feature
2. UI Agent: Create frontend components
3. Nutrition Agent: Implement scoring logic
4. Testing Agent: Validate implementation
```

## Playwright Testing Workflow

### Current Test Suite Structure
```typescript
// client/tests/e2e/auth.spec.ts
- Sign Up validation (5 tests)
- Sign In functionality (4 tests)
- Protected routes (2 tests)
- Sign Out process (2 tests)
- Session management (2 tests)
- OAuth integration (2 tests)
- Password reset (2 tests)
- User profile (2 tests)
- Security features (2 tests)
```

### Test-First Development Pattern
```typescript
// 1. Write failing test
test('should log food entry and calculate score', async ({ page }) => {
  await page.goto('/food');
  await page.fill('[data-testid=food-description]', 'Grilled chicken with vegetables');
  await page.click('[data-testid=save-meal]');
  await expect(page.locator('[data-testid=nutrition-score]')).toContainText('85');
});

// 2. Implement feature to make test pass
// 3. Refactor and optimize
```

### Visual Testing Integration
```bash
# Screenshot-based testing
npm run test:visual                    # Run visual tests
npx playwright test --update-snapshots  # Update baselines
```

### Test Data Management
```typescript
// Use consistent test data
export const testUsers = {
  youngPlayer: { age: 12, position: 'MIDFIELDER' },
  teenPlayer: { age: 16, position: 'FORWARD' },
  adultPlayer: { age: 22, position: 'GOALKEEPER' }
};
```

## Food Database & Scoring System

### Current Database Structure (74+ keywords)
```typescript
// client/src/lib/food-database.ts
export interface FoodCategory {
  keywords: string[];
  description: string;
}

// Categories with keyword counts:
- Poor Quality: ~22 keywords (candy, chips, soda, etc.)
- Fair Quality: ~20 keywords (sandwich, cereal, juice, etc.)
- Good Quality: ~24 keywords (vegetables, lean meat, etc.)
- Excellent Quality: ~28 keywords (protein shake, organic, etc.)
```

### Scoring Algorithm
```typescript
// Dual-factor scoring system
const nutritionScore = (mealFrequency * 0.4) + (foodQuality * 0.6);

// Age-specific adjustments
ages['10-12']: more forgiving, calcium focus
ages['13-15']: growth spurt support, larger portions
ages['16-18']: performance optimization
ages['19-25']: professional standards
```

### Nordic/Finnish Food Integration
```typescript
// Finnish foods included
'ruisleipä', 'puuro', 'kalakeitto', 'lohikeitto', 
'hernekeitto', 'karjalanpiirakka', 'pulla', 'korvapuusti'
```

## Week 3-4 Development Priorities

### P1 - Expand Food Database (Target: 100+ keywords)
```typescript
// Current: 74 keywords, Target: 100+
- Add 25+ sports nutrition terms
- Expand Finnish/Nordic food coverage
- Include more restaurant/chain foods
- Add timing-based meal categories
```

### P1 - Implement Real API Endpoints
```typescript
// Replace mocks with real database operations
POST /api/v1/food-entries    // Create food entry
GET  /api/v1/food-entries    // List user entries
PUT  /api/v1/food-entries/:id // Update entry
DELETE /api/v1/food-entries/:id // Delete entry
```

### P2 - Age-Specific Enhancements
```typescript
// Implement differentiated UI/UX by age group
- Visual cues for younger players (10-12)
- Performance metrics for teens (13-18)
- Professional features for adults (19-25)
```

## Code Standards & Patterns

### TypeScript Configuration
```json
// Strict mode enabled across project
"strict": true,
"noImplicitAny": true,
"strictNullChecks": true,
"strictFunctionTypes": true
```

### React Patterns
```typescript
// Functional components with hooks
const Component: React.FC<Props> = ({ prop }) => {
  const [state, setState] = useState<Type>(initialValue);
  const { data, loading } = useQuery();
  
  return <div>{content}</div>;
};

// Context for shared state
export const UserContext = createContext<UserContextType>();
```

### API Design Patterns
```typescript
// RESTful with proper error handling
app.use('/api/v1/food', requireAuth, foodRoutes);

// Consistent response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Database Patterns
```typescript
// Prisma ORM with proper indexing
model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  email     String   @unique
  // ... fields
  
  @@index([clerkId])
  @@index([email])
}
```

## File Structure Guide

### Critical Files & Locations

#### Frontend (client/)
```
src/
├── components/           # Reusable UI components
│   └── Layout.tsx       # Main layout wrapper
├── pages/               # Route components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── FoodLog.tsx      # Food logging interface ⭐
│   ├── Performance.tsx  # Performance metrics
│   └── Profile.tsx      # User profile management
├── lib/
│   └── food-database.ts # Core nutrition logic ⭐
├── contexts/
│   └── UserContext.tsx  # User state management
└── main.tsx            # App entry point

tests/
├── e2e/
│   └── auth.spec.ts     # Authentication tests ⭐
└── pages/
    └── AuthPage.ts      # Page Object Model
```

#### Backend (server/)
```
src/
├── app.ts              # Express application ⭐
├── server.ts           # Server entry point
└── routes/
    └── auth.routes.ts   # Authentication routes

prisma/
└── schema.prisma       # Database schema ⭐
```

#### Configuration Files
```
docker-compose.yml      # PostgreSQL setup ⭐
client/playwright.config.ts  # Test configuration
client/tailwind.config.js    # Styling configuration
```

### Key Implementation Files

#### Food Analysis Engine
```typescript
// client/src/lib/food-database.ts
export function analyzeFoodQuality(
  description: string,
  mealTiming?: 'pre-game' | 'post-game' | 'regular',
  playerAge?: number,
  ageGroup?: '10-12' | '13-15' | '16-18' | '19-25'
): {
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  score: number;
  suggestions: string[];
  ageBonus?: number;
}
```

#### Food Logging Component
```typescript
// client/src/pages/FoodLog.tsx
- Meal entry form with validation
- Real-time nutrition scoring
- Age-specific recommendations
- Visual score display with color coding
```

#### Authentication Tests
```typescript
// client/tests/e2e/auth.spec.ts
- 22 test scenarios covering complete auth flow
- Page Object Model pattern
- Cross-browser testing
```

## Environment Setup

### Required Environment Variables

#### Server (.env)
```bash
DATABASE_URL="postgresql://nutrition_user:nutrition_pass@localhost:5433/nutrition_tracker"
CLERK_SECRET_KEY="sk_test_..."
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

#### Client (.env.local)
```bash
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
VITE_API_URL="http://localhost:3001"
```

### Docker Configuration
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: nutrition-tracker-db
    environment:
      POSTGRES_USER: nutrition_user
      POSTGRES_PASSWORD: nutrition_pass
      POSTGRES_DB: nutrition_tracker
    ports:
      - "5433:5432"
```

## Testing & Quality Assurance

### Test Coverage Goals
- **E2E Tests**: 80%+ user workflow coverage
- **Unit Tests**: 70%+ function coverage
- **Visual Tests**: All UI components
- **API Tests**: All endpoint functionality

### Performance Targets
- **Page Load**: < 2 seconds on 3G
- **API Response**: < 500ms for queries
- **Bundle Size**: < 500KB initial load
- **Database**: < 100ms for indexed queries

### Quality Gates
```bash
# Pre-commit checks
npm run lint           # ESLint validation
npm run test          # Test suite passes
npm run build         # Build succeeds
```

## Deployment & Production

### Build Process
```bash
# Frontend build
cd client && npm run build

# Backend build
cd server && npm run build

# Database migration
cd server && npx prisma migrate deploy
```

### Health Checks
```bash
curl http://localhost:3001/health  # Backend health
curl http://localhost:5173/       # Frontend health
```

## Development Best Practices

### Git Workflow
```bash
# Feature development
git checkout -b feature/food-logging-enhancement
git commit -m "feat: add advanced food scoring"
git push origin feature/food-logging-enhancement
```

### Code Review Checklist
- [ ] TypeScript strict compliance
- [ ] Playwright tests added/updated
- [ ] Design system compliance
- [ ] Performance considerations
- [ ] Security validation

### Error Handling Patterns
```typescript
// Frontend error boundaries
<ErrorBoundary>
  <Component />
</ErrorBoundary>

// API error handling
try {
  const response = await api.post('/food-entries', data);
} catch (error) {
  console.error('Food entry failed:', error);
  showNotification('Failed to save meal');
}
```

## Important Notes

### Authentication Flow
- Clerk handles OAuth and JWT tokens
- Protected routes require authentication
- User profile synced with database on first login

### Food Scoring System
- 60% weight on food quality, 40% on meal frequency
- Age-specific bonuses and penalties
- Nordic/Finnish food recognition included

### Testing Philosophy
- Test-first development with Playwright
- Visual regression prevention
- Cross-browser compatibility required

### Performance Considerations
- Lazy loading for large components
- Database query optimization with Prisma
- Image optimization for food photos

---

**Remember**: This project emphasizes nutrition education for young athletes. Always consider age-appropriate UI/UX and messaging when implementing features. Use sub-agents for specialized development domains and maintain comprehensive test coverage with Playwright.