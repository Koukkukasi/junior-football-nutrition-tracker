# Supabase Migration Guide - Junior Football Nutrition Tracker

## ✅ Migration Status: Phase 1 Complete

We've successfully migrated from Clerk to Supabase Auth! This guide documents the changes made and next steps.

## 🎯 What Was Done

### 1. Supabase Setup
- ✅ Installed Supabase dependencies (`@supabase/supabase-js`)
- ✅ Created Supabase configuration (`client/src/lib/supabase.ts`)
- ✅ Created authentication context (`client/src/contexts/SupabaseAuthContext.tsx`)
- ✅ Created database schema file (`supabase/schema.sql`)

### 2. Authentication Migration
- ✅ Replaced ClerkProvider with SupabaseAuthProvider
- ✅ Created new SignIn page (`client/src/pages/SignIn.tsx`)
- ✅ Created new SignUp page (`client/src/pages/SignUp.tsx`)
- ✅ Updated App.tsx to use Supabase auth
- ✅ Updated Layout component with sign out functionality
- ✅ Removed Clerk dependencies from package.json

### 3. Database Schema
Created comprehensive schema with:
- User profiles (extends Supabase auth)
- Food entries table
- Performance entries table
- Row Level Security (RLS) policies
- Automatic profile creation on signup

## 📋 Setup Instructions

### Step 1: Create Your Supabase Project

1. **Go to Supabase**
   - Visit https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub or email

2. **Create New Project**
   - Project name: `junior-football-nutrition`
   - Database password: Create a strong password (save it!)
   - Region: Choose closest to your location
   - Click "Create new project" (takes 2-3 minutes)

3. **Get Your Credentials**
   Once project is ready, go to Settings → API and copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJ...` (long string)

### Step 2: Configure Environment Variables

Create `client/.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:3001
```

### Step 3: Set Up Database

1. **Go to SQL Editor** in Supabase dashboard
2. **Create new query**
3. **Copy and paste** the entire contents of `supabase/schema.sql`
4. **Run the query** to create all tables and policies

### Step 4: Update Backend for Supabase

Create `server/.env`:
```env
# Your Supabase database connection string
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
NODE_ENV=development
PORT=3001
```

Get the DATABASE_URL from Supabase Settings → Database → Connection string

### Step 5: Run the Application

```bash
# Terminal 1 - Backend
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

## 🚀 Phase 2: Deploy to Render (Next Steps)

### 1. Prepare for Render Deployment

Create `render.yaml` in root:
```yaml
services:
  - type: web
    name: junior-nutrition-tracker
    runtime: node
    buildCommand: cd server && npm install && npx prisma generate && npm run build
    startCommand: cd server && npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001

  - type: static
    name: junior-nutrition-frontend
    buildCommand: cd client && npm install && npm run build
    staticPublishPath: client/dist
    envVars:
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false
      - key: VITE_API_URL
        sync: false
```

### 2. Deploy to Render

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Migrate from Clerk to Supabase Auth"
   git push origin main
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Deploy Application**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Render will read `render.yaml` and set up both services
   - Add environment variables in Render dashboard

### 3. Configure Supabase for Production

1. **Enable Email Verification** (optional)
   - Go to Authentication → Settings
   - Enable "Confirm email"

2. **Set Redirect URLs**
   - Add your Render URL to Authentication → URL Configuration
   - Site URL: `https://your-app.onrender.com`

3. **Configure SMTP** (optional)
   - For custom email templates
   - Go to Authentication → Settings → SMTP

## 🔄 Migration Benefits

### Why Supabase Over Clerk?

1. **Integrated Database**
   - Auth and database in one service
   - No separate database needed
   - Built-in Row Level Security

2. **Cost Effective**
   - Generous free tier (50,000 MAU)
   - No domain configuration issues
   - All-in-one solution

3. **Developer Experience**
   - Simple API
   - Real-time subscriptions
   - Auto-generated types
   - Built-in admin panel

### Why Render Over Vercel?

1. **Full-Stack Support**
   - Backend and frontend in one place
   - Built-in PostgreSQL option
   - Better monorepo support

2. **Simpler Configuration**
   - No complex build settings
   - Automatic SSL certificates
   - Clear deployment logs

3. **Cost Predictable**
   - Free tier includes everything needed
   - No surprise charges
   - Transparent pricing

## 📝 Code Changes Summary

### Files Created:
- `client/src/lib/supabase.ts` - Supabase client configuration
- `client/src/contexts/SupabaseAuthContext.tsx` - Auth context provider
- `client/src/pages/SignIn.tsx` - Sign in page
- `client/src/pages/SignUp.tsx` - Sign up page
- `supabase/schema.sql` - Database schema
- `client/.env.supabase.example` - Environment template

### Files Modified:
- `client/src/main.tsx` - Replaced ClerkProvider with SupabaseAuthProvider
- `client/src/App.tsx` - Updated to use Supabase auth hooks
- `client/src/components/Layout.tsx` - Added sign out functionality
- `client/package.json` - Removed Clerk, added Supabase

### Files to Update (Backend):
- `server/src/middleware/auth.ts` - Update to validate Supabase tokens
- `server/prisma/schema.prisma` - Align with Supabase schema

## 🧪 Testing the Migration

### Test Authentication Flow:
1. **Sign Up**
   - Go to `/sign-up`
   - Create new account
   - Check email for verification (if enabled)

2. **Sign In**
   - Go to `/sign-in`
   - Use your credentials
   - Should redirect to dashboard

3. **Protected Routes**
   - Try accessing `/dashboard` without login
   - Should redirect to home page

4. **Sign Out**
   - Click sign out button
   - Should clear session and redirect

## 🐛 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Make sure `.env.local` exists in client folder
   - Check variable names match exactly

2. **Database connection errors**
   - Verify DATABASE_URL is correct
   - Check Supabase project is running
   - Ensure database password is correct

3. **Authentication not working**
   - Clear browser localStorage
   - Check Supabase Auth settings
   - Verify API keys are correct

4. **CORS errors**
   - Add your domain to Supabase allowed origins
   - Check API URL in environment variables

## 📊 Migration Checklist

- [x] Remove Clerk dependencies
- [x] Install Supabase packages  
- [x] Create Supabase configuration
- [x] Update authentication flow
- [x] Create sign in/up pages
- [x] Update protected routes
- [x] Create database schema
- [ ] Set up Supabase project (manual step)
- [ ] Configure environment variables (manual step)
- [ ] Run database migrations (manual step)
- [ ] Update backend auth middleware
- [ ] Deploy to Render
- [ ] Test production deployment

## 🎉 Success Metrics

Once migration is complete, you should have:
- ✅ No Clerk-related errors in console
- ✅ Working authentication flow
- ✅ Database connected via Supabase
- ✅ Simplified deployment process
- ✅ Lower operational costs
- ✅ Better performance

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Render Docs](https://render.com/docs)
- [Render Node Deployment](https://render.com/docs/deploy-node-express-app)

## 💡 Next Steps

1. **Complete Supabase Setup** (5 minutes)
2. **Configure Environment Variables** (2 minutes)
3. **Run Database Migration** (2 minutes)
4. **Test Locally** (5 minutes)
5. **Deploy to Render** (10 minutes)

Total migration time: ~25 minutes

---

**Need Help?** The migration is designed to be straightforward. If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify all environment variables are set
3. Ensure Supabase project is properly configured
4. Check browser console for specific errors