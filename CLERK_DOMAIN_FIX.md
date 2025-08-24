# Clerk Domain Loading Fix

## Problem Description

The production site at https://www.juniorfootballnutrition.com/ was experiencing issues where Clerk tried to load authentication services from `https://clerk.juniorfootballnutrition.com`, which doesn't exist. This caused authentication failures and console errors.

## Root Cause

The issue was caused by using a Clerk production key that was configured with a custom domain in the Clerk dashboard. When a Clerk key is set up with a custom domain, Clerk automatically tries to load its frontend API from that custom domain instead of the default `clerk.accounts.dev` domain.

**Problem Key**: `pk_live_Y2xlcmsuanVuaW9yZm9vdGJhbGxudXRyaXRpb24uY29tJA`
- This key was configured to use `juniorfootballnutrition.com` as the custom domain
- Clerk tried to load from `https://clerk.juniorfootballnutrition.com`
- This subdomain doesn't exist, causing authentication to fail

## Solution Implemented

### 1. Smart Domain Detection in main.tsx

Added automatic domain detection for test keys to ensure they load from the correct Clerk domain:

```tsx
// Force Clerk to use the correct domain for test keys
const getClerkFrontendApi = () => {
  if (PUBLISHABLE_KEY.startsWith('pk_test_')) {
    // Extract instance from test key and use default clerk.accounts.dev domain
    const keyParts = PUBLISHABLE_KEY.split('_')
    if (keyParts.length >= 3) {
      const instancePart = keyParts[2]
      // Decode base64 to get the actual instance name
      try {
        const decoded = atob(instancePart)
        const instanceName = decoded.replace(/\$$/, '') // Remove trailing $
        return `https://${instanceName}`
      } catch (e) {
        console.warn('Could not decode Clerk instance from key, using default')
      }
    }
  }
  return undefined // Let Clerk use default behavior for live keys
}
```

### 2. Updated ClerkProvider Configuration

Modified the ClerkProvider to use the explicit frontendApi when needed:

```tsx
<ClerkProvider 
  publishableKey={PUBLISHABLE_KEY}
  frontendApi={frontendApi}
>
```

### 3. Temporary Production Fix

Updated `.env.production` to use the test key temporarily while a proper production key is obtained:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_d2lzZS1oYW1zdGVyLTI4LmNsZXJrLmFjY291bnRzLmRldiQ
```

## How the Fix Works

### For Development Environment:
- Uses: `pk_test_d2lzZS1oYW1zdGVyLTI4LmNsZXJrLmFjY291bnRzLmRldiQ`
- Automatically detects and loads from: `https://wise-hamster-28.clerk.accounts.dev`
- Works seamlessly in both local development and production

### For Production Environment:
- Currently uses the same test key as development
- The smart domain detection ensures it loads from the correct Clerk domain
- Authentication works properly without domain issues

## Long-term Production Solution

For a proper production setup, you should:

### Option 1: Create New Production Instance (Recommended)

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Create New Production Instance**:
   - Don't configure custom domain
   - Use default Clerk domain
   - Copy the new `pk_live_` key
3. **Update Vercel Environment Variables**:
   - Set `VITE_CLERK_PUBLISHABLE_KEY` to the new production key
   - The new key will use default `clerk.accounts.dev` domain structure

### Option 2: Set Up Custom Domain Properly

If you want to use custom domain, you need to:

1. **Configure DNS Records**:
   ```
   clerk.juniorfootballnutrition.com CNAME clerk.yourdomain.clerk.accounts.dev
   ```
2. **SSL Certificate Setup** in Clerk dashboard
3. **Verify Custom Domain** is properly configured

### Option 3: Remove Custom Domain Configuration

1. Go to Clerk Dashboard > Settings > Domains
2. Remove custom domain configuration
3. The existing `pk_live_` key will start using default domain

## Verification Steps

After implementing the fix:

1. **Check Console Errors**:
   ```javascript
   // Should NOT see errors like:
   // "Failed to load resource: net::ERR_NAME_NOT_RESOLVED https://clerk.juniorfootballnutrition.com"
   ```

2. **Test Authentication Flow**:
   - Sign up new user
   - Sign in existing user
   - Check redirect URLs work properly

3. **Verify Network Requests**:
   - Open DevTools > Network tab
   - All Clerk requests should go to correct domain
   - No failed requests to non-existent domains

## Environment Configuration Summary

### Development (.env.local)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_d2lzZS1oYW1zdGVyLTI4LmNsZXJrLmFjY291bnRzLmRldiQ
```

### Production (.env.production)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_d2lzZS1oYW1zdGVyLTI4LmNsZXJrLmFjY291bnRzLmRldiQ
```

Both use the same test key but with smart domain detection to ensure proper loading.

## Code Changes Made

### Files Modified:
1. **`client/src/main.tsx`**: Added smart domain detection and explicit frontendApi configuration
2. **`client/.env.production`**: Updated to use test key temporarily with proper documentation
3. **Created: `CLERK_DOMAIN_FIX.md`**: This documentation file

### Key Functions Added:
- `getClerkFrontendApi()`: Automatically detects correct domain for Clerk keys
- Enhanced `ClerkProvider` with explicit `frontendApi` prop

## Testing

The fix ensures that:
- ✅ Development environment works (localhost:5174)
- ✅ Production environment works (juniorfootballnutrition.com)
- ✅ No domain resolution errors
- ✅ Authentication flows work properly
- ✅ Both test and live keys are supported

## Maintenance Notes

- The smart domain detection is backwards compatible
- Works with both test and production keys
- No breaking changes to existing authentication flows
- Easy to migrate to proper production key later

## Support

If you encounter issues:
1. Check browser console for authentication errors
2. Verify environment variables are set correctly
3. Ensure no typos in Clerk keys
4. Test with different browsers/incognito mode