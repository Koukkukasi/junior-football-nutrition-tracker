# Clerk Production Setup Guide

## Current Status
✅ DATABASE_URL is configured in Vercel
⚠️ Using development Clerk keys in production (causing console warnings)
🔄 API routes partially configured (awaiting deployment)

## Step 1: Create Production Clerk Instance

1. **Go to Clerk Dashboard**
   - Navigate to: https://dashboard.clerk.com
   - Sign in with your account

2. **Create Production Instance**
   - Click on your application name
   - Click "Create Production Instance" button
   - OR if you have multiple apps, click "New Application" and select "Production"

3. **Configure Production Settings**
   - Application name: `Junior Football Nutrition Tracker (Production)`
   - Select authentication methods you want to enable:
     - ✅ Email/Password
     - ✅ OAuth providers (Google, GitHub, etc.)
   - Set production domain: `junior-nutrition-tracker-prod.vercel.app`

## Step 2: Get Production Keys

1. **Navigate to API Keys**
   - In Clerk Dashboard, go to "API Keys" section
   - You'll see two environments: Development and Production

2. **Copy Production Keys**
   - **Publishable Key**: Starts with `pk_live_`
   - **Secret Key**: Starts with `sk_live_`
   - Keep these keys secure!

## Step 3: Update Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - https://vercel.com/koukkukasis-projects/junior-nutrition-tracker-prod/settings/environment-variables

2. **Update VITE_CLERK_PUBLISHABLE_KEY**
   - Click on the variable name or edit button
   - Replace the development key (`pk_test_...`) with production key (`pk_live_...`)
   - Ensure it's set for "Production" environment

3. **Update CLERK_SECRET_KEY**
   - Click on the variable name or edit button
   - Replace the development key (`sk_test_...`) with production key (`sk_live_...`)
   - Ensure it's set for "Production" environment

4. **Save Changes**
   - Click "Save" for each variable
   - A redeploy will be triggered automatically

## Step 4: Configure Clerk Production Settings

1. **Add Production URLs**
   In Clerk Dashboard > Settings > URLs:
   - **Frontend API**: `https://junior-nutrition-tracker-prod.vercel.app`
   - **Allowed Origins**: 
     ```
     https://junior-nutrition-tracker-prod.vercel.app
     https://*.vercel.app (for preview deployments)
     ```
   - **Allowed Redirect URLs**:
     ```
     https://junior-nutrition-tracker-prod.vercel.app/*
     ```

2. **Configure Webhooks (if needed)**
   - Endpoint URL: `https://junior-nutrition-tracker-prod.vercel.app/api/webhooks/clerk`
   - Select events you want to listen to

3. **Set Session Settings**
   - Session lifetime: 7 days (recommended)
   - Inactivity timeout: 30 minutes (optional)

## Step 5: Verify Configuration

1. **Check Deployment**
   - Wait for Vercel to complete the new deployment
   - Check build logs for any errors

2. **Test Authentication**
   - Visit: https://junior-nutrition-tracker-prod.vercel.app
   - Open browser console (F12)
   - Should NOT see any warnings about development keys
   - Try signing up with a new account
   - Try signing in with existing account

3. **Verify API Integration**
   ```bash
   # Test API health endpoint
   curl https://junior-nutrition-tracker-prod.vercel.app/api/health
   ```

## Troubleshooting

### If you see "Invalid Clerk keys" error:
1. Double-check that keys are copied correctly (no extra spaces)
2. Verify keys match the environment (production keys for production)
3. Check Clerk dashboard for any domain configuration issues

### If authentication redirects fail:
1. Verify redirect URLs are added in Clerk settings
2. Check that frontend URL matches exactly
3. Clear browser cache and cookies

### If API calls fail with 401:
1. Verify CLERK_SECRET_KEY is set correctly
2. Check that middleware is configured for production
3. Review Vercel function logs for errors

## Security Best Practices

1. **Never commit keys to git**
   - Always use environment variables
   - Add `.env` files to `.gitignore`

2. **Use different keys for different environments**
   - Development: `pk_test_` / `sk_test_`
   - Production: `pk_live_` / `sk_live_`

3. **Rotate keys periodically**
   - Clerk allows key rotation without downtime
   - Update Vercel variables when rotating

4. **Monitor usage**
   - Check Clerk dashboard for unusual activity
   - Set up alerts for suspicious sign-in attempts

## Next Steps

After updating Clerk keys:

1. **Run Database Migrations**
   ```bash
   cd server
   DATABASE_URL="<production-url>" npx prisma migrate deploy
   ```

2. **Test Complete Flow**
   - Sign up new user
   - Complete onboarding
   - Create food entries
   - Test team features

3. **Monitor Application**
   - Check Vercel Analytics
   - Review Clerk usage metrics
   - Monitor database performance in Neon dashboard

## Quick Checklist

- [ ] Created Clerk production instance
- [ ] Copied production keys (pk_live_ and sk_live_)
- [ ] Updated VITE_CLERK_PUBLISHABLE_KEY in Vercel
- [ ] Updated CLERK_SECRET_KEY in Vercel
- [ ] Configured production URLs in Clerk
- [ ] Triggered new deployment
- [ ] Verified no console warnings
- [ ] Tested authentication flow
- [ ] Checked API endpoints

## Support Resources

- Clerk Documentation: https://clerk.com/docs
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Neon Database: https://neon.tech/docs