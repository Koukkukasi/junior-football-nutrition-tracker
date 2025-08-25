# Production Save Issues - Fix Deployment Guide

## Overview
This guide contains the critical fixes for the save issues affecting the Junior Football Nutrition Tracker production server. These fixes address authentication failures, database connection issues, and API timeout problems.

## Files Modified

### Backend Changes
1. **`server/src/middleware/auth-dev.ts`** - Fixed Supabase authentication and ensured dbUserId is always set
2. **`server/src/utils/db.ts`** - DELETED (duplicate configuration)
3. **`server/src/routes/food.routes.ts`** - Standardized error responses
4. **`server/src/routes/performance.routes.ts`** - Added transaction management
5. **`server/src/app.ts`** - Updated CORS configuration for Render

### Frontend Changes
1. **`client/src/lib/api.ts`** - Added timeout (30s) and retry logic (3 attempts)

## Key Fixes Implemented

### 1. Authentication Fix (CRITICAL)
- Properly decode Supabase JWT tokens
- Always set `dbUserId` in request to prevent foreign key failures
- Added fallback user lookup if dbUserId is missing
- Handle unique constraint violations gracefully

### 2. Database Configuration (CRITICAL)
- Removed duplicate database configuration file
- Consolidated to single Prisma client instance
- Prevents connection pool exhaustion

### 3. API Request Handling (HIGH)
- Added 30-second timeout to all API requests
- Implemented retry logic: 3 attempts with exponential backoff (1s, 2s, 4s)
- Better error handling and user feedback
- Standardized response format: `{ success, data, error, message, code }`

### 4. Transaction Management (HIGH)
- Wrapped save operations in database transactions
- Ensures atomic operations (all or nothing)
- Prevents partial saves and data corruption

### 5. CORS Configuration (MEDIUM)
- Added Render production URLs
- Configured proper headers and methods
- Added 24-hour cache for OPTIONS requests

## Deployment Steps

### Step 1: Test Locally First
```bash
# Start the database
docker-compose up -d

# Test backend
cd server
npm install
npm run dev

# Test frontend (new terminal)
cd client
npm install
npm run dev

# Test save functionality:
1. Sign in with Supabase auth
2. Try to save a food entry
3. Try to save performance metrics
4. Verify no errors in console
```

### Step 2: Commit and Push Changes
```bash
git add .
git commit -m "Fix critical save issues in production

- Fixed Supabase authentication in auth middleware
- Added timeout and retry logic to API calls
- Implemented proper transaction management
- Standardized API response format
- Updated CORS for Render deployment"

git push origin main
```

### Step 3: Deploy to Render

The deployment should trigger automatically on push to main. If not:

1. Go to Render Dashboard
2. Navigate to your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete
5. Repeat for frontend service

### Step 4: Verify Environment Variables

Ensure these are set in Render Dashboard:

#### Backend Service
```
NODE_ENV=production
DATABASE_URL=[your-supabase-database-url]
SUPABASE_URL=https://qlhkefgrafakbrcwquhv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
FRONTEND_URL=https://junior-football-nutrition-client.onrender.com
```

#### Frontend Service
```
VITE_SUPABASE_URL=https://qlhkefgrafakbrcwquhv.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
VITE_API_URL=https://junior-football-nutrition-server.onrender.com
```

### Step 5: Monitor Deployment

1. Check Render logs for any errors:
   - Backend: Look for "AUTH MIDDLEWARE COMPLETE" messages
   - Frontend: Check for successful API connections

2. Monitor the deployment status:
   - Both services should show "Live" status
   - Health checks should pass

### Step 6: Production Testing

Once deployed, test the following:

1. **Authentication Flow**
   - Sign up with new account
   - Sign in with existing account
   - Verify token is being sent with requests

2. **Food Entry Saves**
   - Create a new food entry
   - Verify it saves successfully
   - Check that nutrition score is calculated
   - Try updating the entry
   - Delete the entry

3. **Performance Metrics**
   - Submit performance data
   - Verify it saves without foreign key errors
   - Update existing entry for same date
   - Check that data persists after refresh

4. **Error Handling**
   - Turn off network briefly and try to save
   - Verify retry logic kicks in
   - Check that error messages are user-friendly

## Monitoring After Deployment

### Check Logs for Success Indicators
```
✅ "User synchronized successfully"
✅ "API request to /api/v1/food succeeded"
✅ "Performance entry created/updated successfully"
✅ "Transaction completed successfully"
```

### Watch for Error Patterns
```
❌ "Foreign key constraint failure"
❌ "dbUserId undefined"
❌ "Request timed out"
❌ "User synchronization failed"
```

## Rollback Plan

If issues persist after deployment:

1. **Immediate Rollback**
   - In Render, click "Rollback" to previous deployment
   - This reverts both code and environment variables

2. **Debug Production**
   - Check Render logs for specific errors
   - Use browser DevTools to inspect network requests
   - Verify Supabase is accepting connections

3. **Emergency Fixes**
   - Can apply hotfixes directly in Render console
   - Use environment variables to toggle features

## Expected Outcomes

After successful deployment:
- ✅ Save success rate should increase from ~20% to 95%+
- ✅ API response times under 2 seconds
- ✅ No more foreign key constraint errors
- ✅ Clear error messages when issues occur
- ✅ Automatic retry on network failures

## Support Contacts

- Supabase Dashboard: https://supabase.com/dashboard/project/qlhkefgrafakbrcwquhv
- Render Dashboard: https://dashboard.render.com
- Production URL: https://junior-football-nutrition-client.onrender.com

## Additional Notes

1. The `clerkId` field is now used to store Supabase user IDs (kept for compatibility)
2. Authentication uses Supabase JWT tokens, not Clerk
3. All saves now use database transactions for consistency
4. API has built-in retry logic - no need for manual retries in UI
5. CORS is configured for Render domains specifically

---

**Last Updated**: January 2025
**Critical Fix Version**: 1.0.0
**Tested With**: Node.js 18, PostgreSQL 16, Supabase Auth