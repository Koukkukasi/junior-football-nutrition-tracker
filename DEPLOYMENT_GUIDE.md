# Junior Football Nutrition Tracker - Deployment Guide

## Quick Setup for Test Users (15 minutes total)

### Step 1: Get Clerk Authentication Working (5 minutes)

1. **Create Clerk Account:**
   - Go to https://clerk.com
   - Sign up for free account
   - Click "Create Application"
   - Name: "Junior Football Nutrition Tracker"
   - Select authentication methods (recommended: Email + Google)

2. **Get Your Keys:**
   - In Clerk Dashboard → API Keys
   - Copy the "Publishable Key" (starts with `pk_test_...`)
   - Copy the "Secret Key" (starts with `sk_test_...`) - you'll need this for backend

3. **Update Vercel Frontend:**
   - Go to https://vercel.com/dashboard
   - Select your `junior-football-nutrition-tracker` project
   - Go to Settings → Environment Variables
   - Update `VITE_CLERK_PUBLISHABLE_KEY` with your real publishable key
   - Click "Save"
   - Go to Deployments tab → Click "..." menu → Redeploy

### Step 2: Deploy Backend API (10 minutes)

#### Option A: Deploy to Vercel (Recommended)

1. **Open terminal in server directory:**
   ```bash
   cd C:\Users\ilmiv\junior-football-nutrition-tracker\server
   ```

2. **Login to Vercel:**
   ```bash
   npx vercel login
   ```
   - Choose "Continue with GitHub" (or your preferred method)

3. **Deploy the backend:**
   ```bash
   npx vercel
   ```
   - Project name: `junior-football-nutrition-tracker-api`
   - Link to existing project?: No
   - Which scope?: Select your account
   - Link to existing project?: No
   - In which directory?: ./
   - Want to override settings?: No

4. **Add environment variables to backend:**
   ```bash
   npx vercel env add DATABASE_URL
   # Paste your PostgreSQL connection string

   npx vercel env add CLERK_SECRET_KEY
   # Paste your Clerk Secret Key from Step 1

   npx vercel env add FRONTEND_URL
   # Enter: https://junior-football-nutrition-tracker.vercel.app
   ```

5. **Deploy with environment variables:**
   ```bash
   npx vercel --prod
   ```

6. **Update Frontend API URL:**
   - Go back to Vercel dashboard
   - Select frontend project
   - Settings → Environment Variables
   - Update `VITE_API_URL` to your backend URL (e.g., `https://junior-football-nutrition-tracker-api.vercel.app`)
   - Redeploy frontend

#### Option B: Deploy to Railway (Alternative)

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. New Project → Deploy from GitHub repo
4. Select your repository
5. Add service → PostgreSQL
6. Add environment variables in Railway dashboard
7. Deploy will start automatically

### Step 3: Database Setup

#### Option A: Use Vercel PostgreSQL (If using Vercel for backend)
1. In Vercel Dashboard → Storage → Create Database
2. Choose PostgreSQL
3. Copy connection string
4. Update backend's `DATABASE_URL` environment variable

#### Option B: Use Supabase (Free tier available)
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Update backend's `DATABASE_URL` environment variable

### Step 4: Initialize Database

After backend is deployed with database connected:

1. **Run Prisma migrations:**
   ```bash
   cd server
   npx prisma migrate deploy
   ```

2. **Seed initial data (optional):**
   ```bash
   npx prisma db seed
   ```

## Test User Instructions

Once everything is deployed, share this with test users:

---

### Junior Football Nutrition Tracker - Test Access

**Website:** https://junior-football-nutrition-tracker.vercel.app

**Getting Started:**
1. Click "Get Started" to create an account
2. Choose your role: Player, Coach, or Parent
3. Complete the onboarding process
4. Start tracking nutrition!

**Features to Test:**
- Food logging and nutrition scoring
- Daily meal tracking (5 meal types)
- Performance metrics
- Profile management
- Team features (for coaches)

**Test Scenarios:**
- Log different meals and see scoring
- Check your dashboard for progress
- Update your profile and age
- View nutrition requirements

**Feedback:**
Please report any issues or suggestions to: [your-email@example.com]

---

## Environment Variables Summary

### Frontend (Vercel):
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_[your-key]
VITE_API_URL=https://[your-backend-url].vercel.app
```

### Backend (Vercel/Railway):
```
DATABASE_URL=postgresql://[connection-string]
CLERK_SECRET_KEY=sk_test_[your-key]
FRONTEND_URL=https://junior-football-nutrition-tracker.vercel.app
NODE_ENV=production
```

## Troubleshooting

### Frontend shows blank page
- Check browser console for errors
- Verify Clerk publishable key is correct
- Ensure API URL is set and backend is running

### Authentication not working
- Verify Clerk keys are correct
- Check Clerk dashboard for application settings
- Ensure allowed origins include your Vercel URL

### API calls failing
- Verify backend is deployed and running
- Check CORS settings in backend
- Ensure DATABASE_URL is correct

### Database errors
- Run `npx prisma migrate deploy` on backend
- Check PostgreSQL connection string
- Verify database is accessible

## Quick Checks

1. **Frontend Health:** https://junior-football-nutrition-tracker.vercel.app
2. **Backend Health:** [your-backend-url]/health
3. **Clerk Dashboard:** https://dashboard.clerk.com
4. **Vercel Dashboard:** https://vercel.com/dashboard

## Support

If you need help with deployment:
1. Check Vercel logs for errors
2. Review Clerk documentation
3. Check backend server logs
4. Verify all environment variables are set correctly