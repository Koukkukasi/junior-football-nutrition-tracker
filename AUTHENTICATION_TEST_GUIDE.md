# Authentication Testing Guide with Clerk

## Prerequisites
Ensure you have:
1. ✅ Frontend running at http://localhost:5174
2. ✅ Backend running at http://localhost:3001
3. ✅ Clerk API keys configured in environment variables

---

## 🔐 Step-by-Step Authentication Testing

### 1. Access the Application
1. Open your browser (Chrome/Firefox/Edge)
2. Navigate to: **http://localhost:5174**
3. You should see the Landing Page

### 2. Test Sign Up Flow

#### A. Navigate to Sign Up
1. Click "Sign Up" button on landing page
2. URL should change to: `/sign-up`
3. Clerk sign-up widget should appear

#### B. Create New Account
```
Test Account Details:
- Email: testplayer@example.com
- Password: TestPass123!
- First Name: Test
- Last Name: Player
```

#### C. Email Verification
1. Check for verification code email
2. Enter the verification code
3. Should redirect after successful verification

#### D. Onboarding Flow (New Users)
After sign up, you should be redirected to `/onboarding`:

**Step 1 - Age Group:**
- Select "16-18" for testing

**Step 2 - Position:**
- Select "MIDFIELDER"

**Step 3 - Goals:**
- Select "Improve Nutrition" and "Track Performance"

**Step 4 - Training Days:**
- Set to 4 days per week

**Step 5 - Team Code (Optional):**
- Enter: `TEST-TEAM-2024`
- Or leave empty to skip

**Complete:**
- Click "Complete Setup"
- Should save to backend and redirect to `/dashboard`

### 3. Test Sign In Flow

#### A. Sign Out First
1. Click user menu/avatar
2. Select "Sign Out"
3. Should redirect to landing page

#### B. Sign In
1. Click "Sign In" button
2. URL should change to: `/sign-in`
3. Enter credentials:
   - Email: testplayer@example.com
   - Password: TestPass123!
4. Click "Continue"
5. Should redirect to `/dashboard` (skipping onboarding)

### 4. Test Protected Routes

#### While Signed Out:
Try accessing these URLs directly:
- http://localhost:5174/dashboard → Should redirect to sign-in
- http://localhost:5174/food → Should redirect to sign-in
- http://localhost:5174/performance → Should redirect to sign-in
- http://localhost:5174/team → Should redirect to sign-in

#### While Signed In:
All above URLs should be accessible

### 5. Test OAuth Sign-In (if configured)

#### Google OAuth:
1. On sign-in page, click "Continue with Google"
2. Select/enter Google account
3. Authorize the application
4. Should redirect to onboarding (new) or dashboard (existing)

#### GitHub OAuth:
1. On sign-in page, click "Continue with GitHub"
2. Enter GitHub credentials
3. Authorize the application
4. Should redirect appropriately

### 6. Test Session Persistence

1. Sign in successfully
2. Close the browser tab (not sign out)
3. Open new tab and go to http://localhost:5174
4. Should still be signed in
5. Should go directly to dashboard

### 7. Test API Authentication

When signed in, check browser DevTools (F12) → Network tab:

#### Valid Requests Should Include:
- Authorization header with Bearer token
- Example: `Authorization: Bearer eyJhbGci...`

#### Test These API Calls:
1. **User Profile**: `/api/v1/users/profile`
   - Should return 200 with user data

2. **User Stats**: `/api/v1/users/stats`
   - Should return 200 with statistics

3. **Food Entries**: `/api/v1/food/entries`
   - Should return 200 (may be empty array)

### 8. Test Password Reset

1. On sign-in page, click "Forgot password?"
2. Enter email address
3. Check email for reset link
4. Click link and set new password
5. Sign in with new password

---

## 🔍 Expected Behaviors

### ✅ Successful Authentication
- Clerk widget loads properly
- No console errors about missing API keys
- Successful redirect after sign in/up
- API calls include valid Bearer token
- User data persists across page refreshes

### ❌ Common Issues & Solutions

#### Issue: Clerk widget doesn't load
**Solution**: Check `.env.local` for `VITE_CLERK_PUBLISHABLE_KEY`

#### Issue: "Unauthorized" errors from API
**Solution**: Check `.env` for `CLERK_SECRET_KEY`

#### Issue: Infinite redirect loop
**Solution**: Clear localStorage and cookies, try again

#### Issue: Onboarding doesn't save
**Solution**: Check backend logs for database connection

---

## 📊 Console Commands for Testing

Open browser DevTools console (F12) and run:

```javascript
// Check if Clerk is loaded
console.log(window.Clerk)

// Check authentication status
console.log(await window.Clerk?.session)

// Get current user
console.log(await window.Clerk?.user)

// Check localStorage
console.log(localStorage.getItem('onboardingCompleted'))
```

---

## 🧪 Backend Verification

Check backend logs for:
```
✅ Good signs:
- "GET /api/v1/users/profile 200"
- "POST /api/v1/users/onboarding 200"
- User creation logs

❌ Issues to fix:
- "401 Unauthorized" (when should be authenticated)
- "Error: A valid resource ID is required"
- Database connection errors
```

---

## 📝 Test Checklist

### Sign Up Flow
- [ ] Can access sign-up page
- [ ] Clerk widget loads
- [ ] Can create account
- [ ] Email verification works
- [ ] Redirects to onboarding
- [ ] Onboarding saves data
- [ ] Redirects to dashboard

### Sign In Flow
- [ ] Can access sign-in page
- [ ] Can sign in with email/password
- [ ] OAuth providers work (if configured)
- [ ] Redirects to dashboard
- [ ] Session persists

### Protected Routes
- [ ] Unauthenticated users redirected
- [ ] Authenticated users have access
- [ ] API calls include auth token
- [ ] Sign out works properly

### Error Handling
- [ ] Invalid credentials show error
- [ ] Network errors handled gracefully
- [ ] Password reset works

---

## 🚀 Quick Test Script

1. Sign up with new account
2. Complete onboarding
3. Navigate to Food Log
4. Add a food entry
5. Check Performance page
6. Sign out
7. Sign in again
8. Verify data persists

---

## 📞 Support

If authentication isn't working:

1. **Check Environment Variables**:
   - Client: `.env.local` has `VITE_CLERK_PUBLISHABLE_KEY`
   - Server: `.env` has `CLERK_SECRET_KEY`

2. **Verify Clerk Dashboard**:
   - Application is active
   - Development instance selected
   - Allowed origins includes `http://localhost:5174`

3. **Clear Browser Data**:
   - Clear cookies for localhost
   - Clear localStorage
   - Try incognito/private window

---

*Use this guide to systematically test the authentication flow*