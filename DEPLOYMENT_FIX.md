# Production Deployment Fix Guide

## Current Issues to Fix

### 1. ✅ API Routes (Partially Fixed)
**Status**: Code fixes pushed, awaiting deployment verification
- vercel.json and api/index.js have been updated
- Deployment should handle /api/* routes correctly now

### 2. ⚠️ Clerk Authentication Keys
**Status**: Using development keys in production
**Fix Required**: Update Vercel environment variables

#### Steps to Fix Clerk Keys:
1. Go to https://dashboard.clerk.com
2. Sign in and select your application
3. Create a production instance if not already created:
   - Click "Create Production Instance"
   - Follow the setup wizard
4. Navigate to "API Keys" section
5. Copy the Production keys:
   - **Publishable Key**: starts with `pk_live_`
   - **Secret Key**: starts with `sk_live_`

6. Add to Vercel Dashboard:
   - Go to https://vercel.com/ilmivs-projects/junior-nutrition-tracker-prod/settings/environment-variables
   - Add/Update these variables:
     - `VITE_CLERK_PUBLISHABLE_KEY` = Your production publishable key
     - `CLERK_SECRET_KEY` = Your production secret key
   - Ensure they're set for "Production" environment

### 3. ⚠️ Database Configuration
**Status**: Missing DATABASE_URL in Vercel
**Fix Required**: Add DATABASE_URL environment variable

#### Current Database Variables in Vercel:
- POSTGRES_URL (from Neon integration)
- POSTGRES_URL_NON_POOLING
- POSTGRES_USER
- POSTGRES_HOST
- POSTGRES_PASSWORD
- POSTGRES_DATABASE

#### Fix:
Add `DATABASE_URL` to Vercel:
1. Go to Vercel Environment Variables
2. Add new variable:
   - Name: `DATABASE_URL`
   - Value: Copy the value from `POSTGRES_URL` or `POSTGRES_URL_NON_POOLING`
   - Environment: Production

### 4. 📦 Database Migrations
**Status**: Not run on production database
**Fix Required**: Run Prisma migrations

#### Steps to Run Migrations:
```bash
# Option 1: Run locally against production database
cd server
DATABASE_URL="your-production-database-url" npx prisma migrate deploy

# Option 2: Use the migration script
cd server
DATABASE_URL="your-production-database-url" node prisma/migrate-prod.js
```

## Verification Steps

### 1. Test API Health Endpoint
```bash
curl https://junior-nutrition-tracker-prod.vercel.app/api/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-23T...",
  "environment": "production"
}
```

### 2. Check Clerk Authentication
- Visit https://junior-nutrition-tracker-prod.vercel.app
- Open browser console (F12)
- Should NOT see warnings about development keys

### 3. Test Database Connection
- Try to sign up/sign in
- Check if user data persists
- Verify food entries can be saved

## Environment Variables Checklist

### Required in Vercel:
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` (production key)
- [ ] `CLERK_SECRET_KEY` (production key)
- [ ] `DATABASE_URL` (matches Postgres connection)
- [ ] `FRONTEND_URL` = https://junior-nutrition-tracker-prod.vercel.app
- [ ] `NODE_ENV` = production

### Already Set (from Neon):
- [x] `POSTGRES_URL`
- [x] `POSTGRES_URL_NON_POOLING`
- [x] `POSTGRES_USER`
- [x] `POSTGRES_HOST`
- [x] `POSTGRES_PASSWORD`
- [x] `POSTGRES_DATABASE`

## Deployment Commands

### Trigger New Deployment
```bash
# Make a small change and push
git add .
git commit -m "fix: update production configuration"
git push production main
```

### Monitor Deployment
1. Go to https://vercel.com/ilmivs-projects/junior-nutrition-tracker-prod
2. Check "Deployments" tab
3. View build logs for any errors

## Troubleshooting

### If API still returns 404:
1. Check vercel.json is at repository root
2. Verify api/index.js exists and exports correctly
3. Check Vercel Functions tab for errors

### If Clerk authentication fails:
1. Verify production keys are set correctly
2. Check Clerk dashboard for domain configuration
3. Ensure production URL is added to Clerk allowed origins

### If database connection fails:
1. Verify DATABASE_URL format: `postgresql://user:pass@host:port/database?schema=public`
2. Check Neon dashboard for connection limits
3. Run migrations if schema is outdated

## Next Steps After Fixes

1. Run comprehensive tests:
   - Sign up flow
   - Sign in flow
   - Food entry creation
   - Performance metrics
   - Team features

2. Monitor application:
   - Check Vercel Analytics
   - Review error logs
   - Monitor database performance

3. Document production credentials securely:
   - Store keys in password manager
   - Document database connection details
   - Keep deployment notes updated