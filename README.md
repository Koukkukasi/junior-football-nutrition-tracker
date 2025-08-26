# Junior Football Nutrition Tracker

A comprehensive nutrition and performance tracking application designed specifically for junior football players (ages 10-25) and their coaches.

## Project Structure

```
junior-football-nutrition-tracker/
├── client/                 # React frontend (Vite + TypeScript)
├── server/                 # Node.js backend (Express + TypeScript)
├── docs/                   # Project documentation
└── docker-compose.yml      # PostgreSQL database setup
```

## Week 1 Implementation Status ✅

- ✅ Project structure initialized
- ✅ Backend setup with Node.js, TypeScript, and Express
- ✅ PostgreSQL database configured with Docker
- ✅ Prisma ORM with complete database schema
- ✅ Supabase authentication integration
- ✅ User registration and login endpoints
- ✅ React frontend with TypeScript and Vite
- ✅ ESLint and Prettier configuration
- ⏳ API documentation with Swagger (pending)

## Quick Start

### Prerequisites

- Node.js v22+
- Docker Desktop
- PostgreSQL (via Docker)

### Backend Setup

1. Start the database:
```bash
docker-compose up -d
```

2. Install dependencies:
```bash
cd server
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Clerk API keys
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Start the development server:
```bash
npm run dev
```

The backend will run on http://localhost:3001

### Frontend Setup

1. Install dependencies:
```bash
cd client
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/sync-user` - Sync user with Clerk
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update user profile

### Health Check
- `GET /health` - Server status

## Database Schema

- **Users** - Player/coach profiles with Clerk integration
- **Teams** - Team management with unique codes
- **FoodEntries** - Daily nutrition logging
- **PerformanceMetrics** - Energy levels, sleep, training data

## Tech Stack

### Backend
- Node.js & Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Clerk Authentication
- Helmet, CORS, Compression

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Clerk React
- React Router
- TanStack Query

## Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run prisma:studio # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Next Steps (Week 2)

- [ ] Complete API documentation with Swagger
- [ ] Implement food logging endpoints
- [ ] Create performance tracking API
- [ ] Build team management features
- [ ] Design frontend UI components
- [ ] Implement user authentication flow
- [ ] Create food logging interface
- [ ] Add performance tracking dashboard

## License

MIT