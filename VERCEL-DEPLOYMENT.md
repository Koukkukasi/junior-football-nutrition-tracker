# Vercel Deployment Guide - Junior Football Nutrition Tracker

## Current Status
✅ **Frontend**: Successfully deployed at https://junior-football-nutrition-tracker.vercel.app  
❌ **Backend**: Not yet deployed (needs cloud database)  
⚠️ **Icons**: Lucide React icons configuration updated, awaiting verification

## What You Need to Deploy the Backend

### 1. Set Up a Cloud PostgreSQL Database (Required)

Choose one of these free options:

#### Option A: Supabase (Recommended - Free tier)
1. Go to https://supabase.com
2. Create a new project
3. Copy the database URL from Settings → Database
4. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### Option B: Neon (Free tier)
1. Go to https://neon.tech
2. Create a new database
3. Copy the connection string

#### Option C: Render (Free tier with limitations)
1. Go to https://render.com
2. Create a PostgreSQL database
3. Copy the External Database URL

### 2. Deploy the Backend

#### Recommended: Deploy Backend on Render
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `Koukkukasi/junior-football-nutrition-tracker`
4. Configure:
   - **Name**: `junior-nutrition-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
5. Add environment variables:
   ```
   DATABASE_URL=[Your cloud PostgreSQL URL]
   NODE_ENV=production
   PORT=3001
   CLERK_SECRET_KEY=sk_test_ePYVFHPjagquvahBZTLyYo9AA8IUjMrAzVBMMXIxtP
   CLERK_PUBLISHABLE_KEY=pk_test_d2lzZS1oYW1zdGVyLTI4LmNsZXJrLmFjY291bnRzLmRldiQ
   FRONTEND_URL=https://junior-football-nutrition-tracker.vercel.app
   ```
6. Click "Create Web Service"
7. Wait for deployment (takes 5-10 minutes)
8. Copy your backend URL (e.g., `https://junior-nutrition-backend.onrender.com`)

### 3. Update Frontend to Use Backend

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `junior-football-nutrition-tracker`
3. Go to Settings → Environment Variables
4. Add:
   ```
   VITE_API_URL=https://junior-nutrition-backend.onrender.com
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_d2lzZS1oYW1zdGVyLTI4LmNsZXJrLmFjY291bnRzLmRldiQ
   ```
5. Redeploy: Deployments → Three dots on latest → Redeploy

## Quick Setup Steps

### Step 1: Database (5 minutes)
1. Sign up at https://supabase.com
2. Create project
3. Copy database URL

### Step 2: Backend (10 minutes)  
1. Go to https://render.com
2. Deploy from GitHub
3. Add environment variables
4. Copy backend URL when ready

### Step 3: Frontend (2 minutes)
1. Go to Vercel dashboard
2. Add `VITE_API_URL` with your backend URL
3. Redeploy

## Testing Your Deployment

Once everything is deployed:

1. Visit https://junior-football-nutrition-tracker.vercel.app
2. Try to sign up or sign in
3. Log a meal and check if it saves
4. Check performance tracking

## Current Issues Fixed

✅ **Touch controls**: Added `touch-manipulation` CSS  
✅ **Scrolling**: Disabled smooth scroll that was causing issues  
✅ **Icon bundling**: Updated Vite config and lucide-react version  
⚠️ **Data persistence**: Needs real backend deployment with database

## Environment Variables Summary

### Backend (server) needs:
- `DATABASE_URL` - Your cloud PostgreSQL connection string
- `CLERK_SECRET_KEY` - Already provided above
- `CLERK_PUBLISHABLE_KEY` - Already provided above  
- `FRONTEND_URL` - https://junior-football-nutrition-tracker.vercel.app
- `NODE_ENV` - production

### Frontend (client) needs:
- `VITE_API_URL` - Your deployed backend URL (e.g., https://junior-nutrition-backend.onrender.com)
- `VITE_CLERK_PUBLISHABLE_KEY` - Already provided above

## Important Notes

⚠️ **Do NOT use the temporary in-memory API** - It has been removed  
✅ **Your app has a complete backend** with Prisma ORM and proper database schema  
⚠️ **The backend MUST have a cloud database** - localhost won't work in production  
✅ **Clerk authentication is already configured** - Just need to add the keys

## Next Steps

1. **Set up cloud database** (Supabase recommended)
2. **Deploy backend** (Render recommended) 
3. **Update frontend environment variables** on Vercel
4. **Test everything works**

Need help? The full deployment guide is in `DEPLOYMENT.md`