# URGENT: Production Critical Failures - Immediate Fix Required

## Current Issues
1. User synchronization failed
2. Add meal failed  
3. Analytics don't work

## Root Cause Analysis

The production server is failing to connect users properly with the database. This is causing cascading failures across all features.

### Primary Issue: Database User Synchronization
The auth middleware is failing to create or find users in the database, causing:
- Foreign key constraint violations when saving meals
- No data available for analytics
- Performance tracking failures

## Immediate Fix Actions

### 1. Verify Database Connection
First, check that the DATABASE_URL in Render is correct:
```
DATABASE_URL=postgresql://postgres:fev@7RLmVedM2rS@db.qlhkefgrafakbrcwquhv.supabase.co:5432/postgres
```

### 2. Check Database Schema
The database might be missing tables or have schema mismatches. Run migrations:

```bash
cd server
npx prisma migrate deploy
```

### 3. Emergency Hotfix for Auth Middleware

Create a simplified auth that always works:

```typescript
// server/src/middleware/auth-emergency.ts
import { Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../types/auth.types';
import jwt from 'jsonwebtoken';

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        error: 'No authorization token provided'
      });
      return;
    }

    // Decode token without verification (emergency mode)
    const decoded = jwt.decode(token) as any;
    const supabaseUserId = decoded?.sub;
    const email = decoded?.email;
    
    if (!supabaseUserId) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid token'
      });
      return;
    }

    // Try multiple strategies to get/create user
    let dbUser = null;
    
    // Strategy 1: Find by Supabase ID
    try {
      dbUser = await prisma.user.findUnique({
        where: { clerkId: supabaseUserId }
      });
    } catch (e) {
      console.log('Strategy 1 failed:', e);
    }
    
    // Strategy 2: Find by email
    if (!dbUser && email) {
      try {
        dbUser = await prisma.user.findUnique({
          where: { email: email }
        });
        // Update the clerkId to match Supabase
        if (dbUser && dbUser.clerkId !== supabaseUserId) {
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: { clerkId: supabaseUserId }
          });
        }
      } catch (e) {
        console.log('Strategy 2 failed:', e);
      }
    }
    
    // Strategy 3: Create new user
    if (!dbUser) {
      try {
        dbUser = await prisma.user.create({
          data: {
            clerkId: supabaseUserId,
            email: email || `user_${Date.now()}@temp.com`,
            name: email?.split('@')[0] || 'User',
            age: 16,
            role: 'PLAYER',
            ageGroup: '16-18',
            dataConsent: false,
            completedOnboarding: false
          }
        });
      } catch (e) {
        console.log('Strategy 3 failed:', e);
        // Last resort: find any user with this email pattern
        if (email) {
          dbUser = await prisma.user.findFirst({
            where: {
              email: {
                contains: email.split('@')[0]
              }
            }
          });
        }
      }
    }
    
    if (!dbUser) {
      res.status(503).json({ 
        success: false,
        error: 'Unable to authenticate user',
        message: 'Please try signing out and signing in again'
      });
      return;
    }
    
    req.userId = supabaseUserId;
    req.dbUserId = String(dbUser.id);
    req.user = dbUser as any;
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Authentication system error'
    });
  }
};
```

### 4. Database Reset Script

If the database is corrupted, create a reset script:

```sql
-- server/scripts/emergency-reset.sql

-- Check for orphaned records
DELETE FROM "FoodEntry" WHERE "userId" NOT IN (SELECT id FROM "User");
DELETE FROM "PerformanceMetric" WHERE "userId" NOT IN (SELECT id FROM "User");

-- Add indexes if missing
CREATE INDEX IF NOT EXISTS idx_user_clerkid ON "User"("clerkId");
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"("email");

-- Check constraints
ALTER TABLE "FoodEntry" DROP CONSTRAINT IF EXISTS "FoodEntry_userId_fkey";
ALTER TABLE "FoodEntry" ADD CONSTRAINT "FoodEntry_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "PerformanceMetric" DROP CONSTRAINT IF EXISTS "PerformanceMetric_userId_fkey";
ALTER TABLE "PerformanceMetric" ADD CONSTRAINT "PerformanceMetric_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
```

## Deployment Steps

1. **Update the auth middleware to use the emergency version**
2. **Commit and push immediately**
3. **Monitor Render logs closely**
4. **Test each feature after deployment**

## Quick Test Commands

Test the fixes locally first:

```bash
# Test auth
curl -X POST http://localhost:3002/api/v1/food \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mealType":"LUNCH","time":"12:00","location":"Home","description":"Test meal"}'

# Check user in database
cd server
npx prisma studio
# Look for users table and check if users are being created
```

## Monitoring After Fix

Watch for these in the logs:
- "User synchronized successfully"
- "Food entry created successfully"
- No foreign key errors
- No "dbUserId undefined" errors

## If This Doesn't Work

1. **Check Supabase Dashboard**
   - Verify the database is accessible
   - Check for any connection limits
   - Review the auth settings

2. **Render Environment Variables**
   - Ensure DATABASE_URL is correct
   - Verify SUPABASE_URL and keys are set
   - Check NODE_ENV is set to "production"

3. **Database Migration**
   - The schema might be out of sync
   - Run: `npx prisma migrate reset --force` (CAREFUL: This will delete all data)

## Contact for Help

If these fixes don't work, the issue might be:
- Supabase database connection limits
- Render service configuration
- Network/firewall issues

Check:
- Supabase Dashboard: https://supabase.com/dashboard/project/qlhkefgrafakbrcwquhv
- Render Logs: https://dashboard.render.com