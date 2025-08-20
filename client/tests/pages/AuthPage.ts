import { Page } from '@playwright/test'

export class AuthPage {
  constructor(private page: Page) {}

  async signIn(email: string, password: string) {
    await this.page.goto('/sign-in')
    await this.page.fill('input[type="email"]', email)
    await this.page.fill('input[type="password"]', password)
    await this.page.click('button[type="submit"]')
    await this.page.waitForURL('/dashboard', { timeout: 10000 })
  }

  async signUp(email: string, password: string, firstName?: string, lastName?: string) {
    await this.page.goto('/sign-up')
    
    if (firstName) {
      await this.page.fill('input[name="firstName"]', firstName)
    }
    
    if (lastName) {
      await this.page.fill('input[name="lastName"]', lastName)
    }
    
    await this.page.fill('input[type="email"]', email)
    await this.page.fill('input[type="password"]', password)
    await this.page.click('button[type="submit"]')
    await this.page.waitForURL('/dashboard', { timeout: 10000 })
  }

  async signOut() {
    await this.page.click('button:has-text("Sign Out")')
    await this.page.waitForURL('/')
  }

  async resetPassword(email: string) {
    await this.page.goto('/sign-in')
    await this.page.click('text=/forgot password/i')
    await this.page.fill('input[type="email"]', email)
    await this.page.click('button:has-text("Send Reset Link")')
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.page.goto('/dashboard')
      await this.page.waitForURL('/dashboard', { timeout: 5000 })
      return true
    } catch {
      return false
    }
  }

  async getErrorMessage(): Promise<string | null> {
    const errorElement = this.page.locator('.error-message, [role="alert"]').first()
    if (await errorElement.isVisible()) {
      return await errorElement.textContent()
    }
    return null
  }

  async fillSignUpForm(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    age?: number
    teamCode?: string
  }) {
    await this.page.goto('/sign-up')
    
    if (data.firstName) {
      await this.page.fill('input[name="firstName"]', data.firstName)
    }
    
    if (data.lastName) {
      await this.page.fill('input[name="lastName"]', data.lastName)
    }
    
    if (data.age) {
      await this.page.fill('input[name="age"]', data.age.toString())
    }
    
    if (data.teamCode) {
      await this.page.fill('input[name="teamCode"]', data.teamCode)
    }
    
    await this.page.fill('input[type="email"]', data.email)
    await this.page.fill('input[type="password"]', data.password)
  }

  async submitForm() {
    await this.page.click('button[type="submit"]')
  }

  async checkRememberMe() {
    await this.page.check('input[type="checkbox"][name="rememberMe"]')
  }

  async clickOAuthProvider(provider: 'google' | 'github' | 'facebook') {
    const providerText = {
      google: 'Continue with Google',
      github: 'Continue with GitHub',
      facebook: 'Continue with Facebook'
    }
    
    await this.page.click(`button:has-text("${providerText[provider]}")`)
  }

  async waitForRedirect(url: string, timeout = 10000) {
    await this.page.waitForURL(url, { timeout })
  }

  async getUserEmail(): Promise<string | null> {
    const emailElement = this.page.locator('[data-testid="user-email"], .user-email').first()
    if (await emailElement.isVisible()) {
      return await emailElement.textContent()
    }
    return null
  }

  async isSignInPage(): Promise<boolean> {
    return this.page.url().includes('/sign-in')
  }

  async isSignUpPage(): Promise<boolean> {
    return this.page.url().includes('/sign-up')
  }

  async isDashboardPage(): Promise<boolean> {
    return this.page.url().includes('/dashboard')
  }
}