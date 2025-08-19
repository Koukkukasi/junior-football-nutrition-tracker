# Prototype Scope - Critical Features for MVP

## Overview

This document defines the exact scope for the Minimum Viable Product (MVP) prototype. The goal is to deliver a working system in 2-3 weeks that demonstrates core value while remaining achievable.

## 🔴 CRITICAL - Must Have for MVP Prototype

### User Authentication & Setup
**Priority**: P0 (Blocking)
**Effort**: 2 days

#### Registration Flow
```typescript
interface UserRegistration {
  name: string;
  email: string;
  password: string;
  age: number;
  position: 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
  teamCode: string;
}
```

**Requirements**:
- Simple email/password registration
- Basic profile information collection
- Team association via code
- Email verification (optional for MVP)

#### Login System
- Standard email/password authentication
- Remember me functionality
- Basic password reset capability
- Session management

### Core Food Logging System
**Priority**: P0 (Blocking)
**Effort**: 4 days

#### Meal Type Structure (Based on Excel Reference)
1. **Aamupala** (Breakfast)
2. **Välipala** (Snack) - Allow multiple per day
3. **Lounas** (Lunch)
4. **Päivällinen** (Dinner)
5. **Iltapala** (Evening snack)

#### Input Interface
```typescript
interface FoodEntry {
  id: string;
  userId: string;
  mealType: MealType;
  time: string; // "06:00", "11:00", "18:00"
  location: string; // "koti", "koulu", "auto", "kaverin luona"
  foods: string; // Simple text description
  notes?: string;
  date: Date;
}
```

**UI Requirements**:
- Mobile-first design
- Large touch targets (minimum 44px)
- Simple form with 4 required fields:
  - Meal type (dropdown)
  - Time (time picker)
  - Location (dropdown with predefined options)
  - Food description (text area)

#### Location Options (From Excel Reference)
- "koti" (home)
- "koulu" (school)
- "auto" (car/travel)
- "kaverin luona" (friend's place)
- "lounge" (team facility)
- Custom text input option

### Basic Performance Tracking
**Priority**: P0 (Blocking)
**Effort**: 2 days

#### Daily Energy Assessment
```typescript
interface DailyMetrics {
  userId: string;
  date: Date;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  sleepHours: number;
  isTrainingDay: boolean;
  notes?: string;
}
```

**Energy Scale Implementation**:
- 😴 Very tired (1)
- 😐 Below normal (2)
- 🙂 Normal (3)
- 😊 Good energy (4)
- ⚡ Very energetic (5)

**Interface**:
- Large emoji buttons for energy selection
- Number input for sleep hours
- Simple toggle for training day
- Optional notes field

### Data Viewing & Basic Analytics
**Priority**: P0 (Blocking)
**Effort**: 3 days

#### Daily View
- Show all meals logged for selected day
- Display energy level and sleep hours
- Edit/delete functionality for entries
- Simple progress indicator (meals logged: 4/5)

#### Weekly Overview
- 7-day calendar view
- Quick status indicators per day
- Completion percentage
- Energy level trends (simple line chart)

#### Basic Feedback
- Meal completion tracking: "You've logged 4 out of 5 meals today"
- Simple energy pattern display
- Streak counter: "5 consecutive days logged!"

### Coach Dashboard Essentials
**Priority**: P1 (Important)
**Effort**: 3 days

#### Team Overview
```typescript
interface TeamDashboard {
  teamId: string;
  players: {
    id: string;
    name: string;
    lastActive: Date;
    weeklyCompletionRate: number;
    currentEnergyLevel: number;
  }[];
  teamStats: {
    averageCompletionRate: number;
    activePlayersToday: number;
    totalPlayers: number;
  };
}
```

**Features**:
- List all team players
- Show last activity and completion rates
- Filter by activity level
- Click to view individual player details

#### Individual Player View
- Player's food log for current week
- Energy level trends
- Sleep pattern overview
- Simple notes/observations section

### Technical Foundation
**Priority**: P0 (Blocking)
**Effort**: 2 days

#### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  age INTEGER NOT NULL,
  position VARCHAR NOT NULL,
  team_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Food entries table  
CREATE TABLE food_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  meal_type VARCHAR NOT NULL,
  time VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  foods TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  energy_level INTEGER NOT NULL,
  sleep_hours DECIMAL,
  is_training_day BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  team_code VARCHAR UNIQUE NOT NULL,
  coach_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### API Endpoints
```
Authentication:
POST /auth/register
POST /auth/login
GET /auth/profile

Food Logging:
POST /api/food-entries
GET /api/food-entries?date=YYYY-MM-DD
PUT /api/food-entries/:id
DELETE /api/food-entries/:id

Performance:
POST /api/performance
GET /api/performance?date=YYYY-MM-DD

Team/Coach:
GET /api/teams/:id/players
GET /api/players/:id/summary
```

---

## 🟡 IMPORTANT - Should Have for Demo (Week 3)

### Enhanced Food Logging
**Priority**: P2
**Effort**: 2 days

#### Quick Food Suggestions
- Dropdown with 20 most common Finnish foods for junior athletes
- "Recently eaten" quick selection
- Auto-complete functionality

#### Food History
- View previous meals by date
- Copy meals from previous days
- Search through food history

### Improved Analytics
**Priority**: P2  
**Effort**: 2 days

#### Simple Charts
- Energy level trends (7-day line chart)
- Meal completion percentage (weekly bars)
- Sleep pattern visualization

#### Streak Tracking
- Consecutive logging days
- Best streak achievement
- Motivation messages for streaks

### Enhanced Coach Tools
**Priority**: P2
**Effort**: 2 days

#### Team Analytics
- Team-wide completion rates
- Average energy levels
- Most/least active players

#### Export Functionality
- CSV export of player data
- Simple PDF reports
- Weekly summary emails

---

## 🟢 NICE TO HAVE - Future Iterations (Week 4+)

### Advanced Features
- Photo recognition for food logging
- Detailed nutrition calculations (calories, macros)
- Smart recommendations based on training schedule
- Achievement badges and gamification
- Team competitions and challenges
- Parent notification system
- Advanced analytics and correlations

---

## User Stories for MVP

### Player Stories
1. **As a junior football player, I can register for an account with my basic information and join my team**
2. **As a player, I can log my 5 daily meals with time, location, and food description in under 2 minutes**
3. **As a player, I can record my energy level and sleep hours each day**
4. **As a player, I can view my food and energy data for the past week**
5. **As a player, I can edit or delete meals I've logged incorrectly**

### Coach Stories
1. **As a coach, I can see all players on my team and their recent activity**
2. **As a coach, I can view detailed information about any individual player**
3. **As a coach, I can see which players are consistently logging their meals**
4. **As a coach, I can export basic reports about my players**

### Technical Stories
1. **As a system, I can securely authenticate users and protect their data**
2. **As a system, I can store and retrieve food and performance data reliably**
3. **As a system, I can perform well on mobile devices with fast loading times**

---

## Success Criteria for MVP

### Functional Requirements
- [ ] Player can register and login successfully
- [ ] Player can log all 5 meal types for a complete day
- [ ] Player can record energy level and sleep hours
- [ ] Player can view 7 days of historical data
- [ ] Coach can see team overview with all players
- [ ] Coach can drill down to individual player details
- [ ] All features work on mobile devices

### Technical Requirements
- [ ] App loads in under 3 seconds on 3G connection
- [ ] Data persists correctly between sessions
- [ ] Forms validate user input appropriately
- [ ] Error handling provides clear user feedback
- [ ] Responsive design works on phones 320px-768px wide

### User Experience Requirements
- [ ] New user can complete registration without help
- [ ] Logging a meal takes less than 2 minutes
- [ ] Navigation is intuitive (no instruction manual needed)
- [ ] Visual feedback confirms user actions
- [ ] Finnish meal structure is accurately represented

---

## What We're Explicitly NOT Building

❌ **Advanced Nutrition Analysis**
- No calorie counting or macro calculations
- No detailed nutritional breakdowns
- No weight management features

❌ **AI-Powered Recommendations**
- No smart meal suggestions
- No complex pattern recognition
- No personalized coaching algorithms

❌ **Social Features**
- No team competitions
- No achievements or badges
- No peer comparison features

❌ **Advanced Analytics**
- No complex data visualizations
- No predictive analytics
- No correlation analysis

❌ **Photo Features**
- No camera-based food logging
- No image recognition
- No visual portion estimation

❌ **Offline Functionality**
- No offline data entry
- No data synchronization
- Requires internet connection

❌ **Push Notifications**
- No meal reminders
- No motivation messages
- Email-only communications

❌ **Parent Features**
- No parent accounts
- No family sharing
- Coach-only adult supervision

---

## Technical Implementation Plan

### Week 1: Backend Foundation
**Days 1-2**: Project setup and authentication
- Initialize Node.js/Express project with TypeScript
- Set up PostgreSQL database with Prisma
- Implement basic authentication with Clerk
- Create user registration and login endpoints

**Days 3-4**: Core data models
- Implement food entries CRUD operations
- Create performance metrics endpoints
- Set up team/coach relationships
- Basic API testing and validation

**Day 5**: Integration testing
- End-to-end API testing
- Database relationship validation
- Error handling implementation

### Week 2: Frontend Development
**Days 1-2**: React app foundation
- Create React app with TypeScript and Tailwind
- Set up routing and basic layout
- Implement authentication UI
- Connect to backend authentication

**Days 3-4**: Core logging interfaces
- Build food logging form with 5 meal types
- Implement performance metrics form
- Create daily and weekly view components
- Add edit/delete functionality

**Day 5**: Coach dashboard
- Team overview page
- Individual player detail view
- Basic export functionality

### Week 3: Polish and Enhancement
**Days 1-2**: UI/UX improvements
- Mobile responsiveness optimization
- Form validation and error handling
- Loading states and user feedback
- Visual polish and consistency

**Days 3-4**: Enhanced features
- Quick food suggestions
- Simple charts and analytics
- Streak tracking
- Coach team analytics

**Day 5**: Testing and deployment
- User acceptance testing
- Performance optimization
- Production deployment
- Documentation completion

---

## Risk Mitigation

### Technical Risks
**Database Performance**: Start with simple queries, optimize later
**Mobile Performance**: Use React best practices, minimize bundle size
**Authentication Complexity**: Use proven service (Clerk) rather than custom

### User Experience Risks
**Too Complex**: Keep MVP extremely simple, add complexity iteratively
**Poor Mobile Experience**: Mobile-first development approach
**Low User Adoption**: Focus on coach-driven adoption initially

### Timeline Risks
**Feature Creep**: Strict adherence to defined MVP scope
**Technical Blockers**: Simple technology choices, proven patterns
**Integration Issues**: Build incrementally with frequent testing

This prototype scope provides a clear, achievable foundation that demonstrates the core value proposition while establishing a solid base for future feature development.
