import { test, expect } from '@playwright/test'
import { AuthPage } from '../pages/AuthPage'

test.describe('Authentication Flow', () => {
  let authPage: AuthPage

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
  })

  test.describe('Sign Up', () => {
    test('should display sign up form with all required fields', async ({ page }) => {
      await page.goto('/sign-up')
      
      // Verify all required form elements are present
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
      await expect(page.locator('text=/sign in/i')).toBeVisible()
    })

    test('should validate email format', async ({ page }) => {
      await page.goto('/sign-up')
      
      // Test invalid email
      await page.fill('input[type="email"]', 'invalid-email')
      await page.fill('input[type="password"]', 'ValidPass123!')
      await page.click('button[type="submit"]')
      
      // Check for validation error
      await expect(page.locator('text=/invalid email/i')).toBeVisible()
    })

    test('should validate password strength', async ({ page }) => {
      await page.goto('/sign-up')
      
      // Test weak password
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', '123')
      await page.click('button[type="submit"]')
      
      // Check for password strength error
      await expect(page.locator('text=/password must be/i')).toBeVisible()
    })

    test('should successfully create account and redirect to dashboard', async ({ page }) => {
      await page.goto('/sign-up')
      
      // Fill valid credentials
      const timestamp = Date.now()
      await page.fill('input[type="email"]', `player${timestamp}@test.com`)
      await page.fill('input[type="password"]', 'SecurePass123!')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Should redirect to dashboard
      await page.waitForURL('/dashboard', { timeout: 10000 })
      await expect(page.locator('h1:has-text("Welcome")')).toBeVisible()
    })

    test('should prevent duplicate email registration', async ({ page }) => {
      await page.goto('/sign-up')
      
      // Try to register with existing email
      await page.fill('input[type="email"]', 'existing@test.com')
      await page.fill('input[type="password"]', 'ValidPass123!')
      await page.click('button[type="submit"]')
      
      // Check for duplicate email error
      await expect(page.locator('text=/already exists/i')).toBeVisible()
    })
  })

  test.describe('Sign In', () => {
    test('should display sign in form with all required fields', async ({ page }) => {
      await page.goto('/sign-in')
      
      // Verify form elements
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
      await expect(page.locator('text=/sign up/i')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/sign-in')
      
      // Enter invalid credentials
      await page.fill('input[type="email"]', 'wrong@test.com')
      await page.fill('input[type="password"]', 'WrongPass123!')
      await page.click('button[type="submit"]')
      
      // Check for error message
      await expect(page.locator('text=/invalid credentials/i')).toBeVisible()
    })

    test('should successfully sign in with valid credentials', async ({ page }) => {
      await page.goto('/sign-in')
      
      // Enter valid credentials
      await page.fill('input[type="email"]', 'player@test.com')
      await page.fill('input[type="password"]', 'ValidPass123!')
      await page.click('button[type="submit"]')
      
      // Should redirect to dashboard
      await page.waitForURL('/dashboard', { timeout: 10000 })
      await expect(page.locator('h1:has-text("Welcome")')).toBeVisible()
    })

    test('should handle "Remember me" functionality', async ({ page }) => {
      await page.goto('/sign-in')
      
      // Check remember me checkbox
      await page.check('input[type="checkbox"]')
      
      // Sign in
      await page.fill('input[type="email"]', 'player@test.com')
      await page.fill('input[type="password"]', 'ValidPass123!')
      await page.click('button[type="submit"]')
      
      // Wait for dashboard
      await page.waitForURL('/dashboard')
      
      // Clear session storage but keep local storage
      await page.evaluate(() => sessionStorage.clear())
      
      // Reload page - should still be logged in
      await page.reload()
      await expect(page).toHaveURL('/dashboard')
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to sign in', async ({ page }) => {
      // Try to access protected route
      await page.goto('/dashboard')
      
      // Should redirect to sign in
      await expect(page).toHaveURL('/sign-in')
    })

    test('should allow authenticated users to access protected routes', async ({ page }) => {
      // First sign in
      await authPage.signIn('player@test.com', 'ValidPass123!')
      
      // Navigate to protected routes
      await page.goto('/food')
      await expect(page).toHaveURL('/food')
      
      await page.goto('/performance')
      await expect(page).toHaveURL('/performance')
      
      await page.goto('/team')
      await expect(page).toHaveURL('/team')
    })
  })

  test.describe('Sign Out', () => {
    test('should successfully sign out and redirect to landing page', async ({ page }) => {
      // Sign in first
      await authPage.signIn('player@test.com', 'ValidPass123!')
      
      // Find and click sign out button
      await page.click('button:has-text("Sign Out")')
      
      // Should redirect to landing page
      await expect(page).toHaveURL('/')
      
      // Try to access protected route - should redirect to sign in
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/sign-in')
    })

    test('should clear all session data on sign out', async ({ page }) => {
      // Sign in
      await authPage.signIn('player@test.com', 'ValidPass123!')
      
      // Store some data in session
      await page.evaluate(() => {
        sessionStorage.setItem('test-data', 'value')
        localStorage.setItem('test-data', 'value')
      })
      
      // Sign out
      await page.click('button:has-text("Sign Out")')
      
      // Check that session data is cleared
      const sessionData = await page.evaluate(() => sessionStorage.getItem('test-data'))
      const localData = await page.evaluate(() => localStorage.getItem('test-data'))
      
      expect(sessionData).toBeNull()
      expect(localData).toBeNull()
    })
  })

  test.describe('Session Management', () => {
    test('should handle session expiry gracefully', async ({ page }) => {
      // Sign in
      await authPage.signIn('player@test.com', 'ValidPass123!')
      
      // Simulate session expiry
      await page.evaluate(() => {
        // Clear auth tokens
        localStorage.removeItem('auth-token')
        sessionStorage.removeItem('auth-token')
      })
      
      // Try to navigate to protected route
      await page.goto('/dashboard')
      
      // Should redirect to sign in with message
      await expect(page).toHaveURL('/sign-in')
      await expect(page.locator('text=/session expired/i')).toBeVisible()
    })

    test('should refresh token before expiry', async ({ page }) => {
      // Sign in
      await authPage.signIn('player@test.com', 'ValidPass123!')
      
      // Wait for automatic token refresh (simulate with network request)
      await page.waitForTimeout(2000)
      
      // Check that user is still authenticated
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/dashboard')
    })
  })

  test.describe('OAuth Integration', () => {
    test('should display OAuth provider buttons', async ({ page }) => {
      await page.goto('/sign-in')
      
      // Check for OAuth buttons
      await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible()
      await expect(page.locator('button:has-text("Continue with GitHub")')).toBeVisible()
    })

    test.skip('should handle OAuth flow correctly', async ({ page }) => {
      // This test would require OAuth provider mocking
      // Skipped in E2E, should be tested with integration tests
    })
  })

  test.describe('Password Reset', () => {
    test('should display forgot password link and form', async ({ page }) => {
      await page.goto('/sign-in')
      
      // Click forgot password link
      await page.click('text=/forgot password/i')
      
      // Should show reset form
      await expect(page.locator('h1:has-text("Reset Password")')).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('button:has-text("Send Reset Link")')).toBeVisible()
    })

    test('should send password reset email', async ({ page }) => {
      await page.goto('/sign-in')
      await page.click('text=/forgot password/i')
      
      // Enter email
      await page.fill('input[type="email"]', 'player@test.com')
      await page.click('button:has-text("Send Reset Link")')
      
      // Should show success message
      await expect(page.locator('text=/reset link sent/i')).toBeVisible()
    })
  })

  test.describe('User Profile', () => {
    test('should display user information after sign in', async ({ page }) => {
      // Sign in
      await authPage.signIn('player@test.com', 'ValidPass123!')
      
      // Check user info is displayed
      await expect(page.locator('text=/player@test.com/i')).toBeVisible()
    })

    test('should allow user to update profile', async ({ page }) => {
      // Sign in
      await authPage.signIn('player@test.com', 'ValidPass123!')
      
      // Navigate to profile
      await page.click('button[aria-label="User menu"]')
      await page.click('text=/profile/i')
      
      // Update profile fields
      await page.fill('input[name="firstName"]', 'John')
      await page.fill('input[name="lastName"]', 'Doe')
      await page.click('button:has-text("Save Changes")')
      
      // Check success message
      await expect(page.locator('text=/profile updated/i')).toBeVisible()
    })
  })

  test.describe('Security Features', () => {
    test('should implement rate limiting on failed login attempts', async ({ page }) => {
      await page.goto('/sign-in')
      
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.fill('input[type="email"]', 'player@test.com')
        await page.fill('input[type="password"]', 'WrongPass!')
        await page.click('button[type="submit"]')
        await page.waitForTimeout(500)
      }
      
      // Should show rate limit message
      await expect(page.locator('text=/too many attempts/i')).toBeVisible()
    })

    test('should enforce HTTPS in production', async ({ page }) => {
      // This would be tested in production environment
      // Check that page protocol is HTTPS
      const url = page.url()
      if (process.env.NODE_ENV === 'production') {
        expect(url).toMatch(/^https:/)
      }
    })
  })
})