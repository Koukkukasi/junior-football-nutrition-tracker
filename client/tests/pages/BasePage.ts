import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object Model
 * Contains common elements and methods shared across all pages
 */
export class BasePage {
  readonly page: Page;
  readonly navBar: Locator;
  readonly userMenu: Locator;
  readonly notification: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.navBar = page.locator('nav');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.notification = page.locator('[role="alert"]');
  }

  async navigate(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async clickNavItem(itemText: string) {
    await this.navBar.getByText(itemText).click();
  }

  async waitForNotification(text: string) {
    await this.notification.filter({ hasText: text }).waitFor();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `tests/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForElement(selector: string, timeout: number = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async isElementVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  async getElementText(selector: string): Promise<string> {
    return await this.page.locator(selector).textContent() || '';
  }

  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async selectOption(selector: string, value: string) {
    await this.page.selectOption(selector, value);
  }

  async clickButton(buttonText: string) {
    await this.page.getByRole('button', { name: buttonText }).click();
  }

  async clickElement(selector: string) {
    await this.page.click(selector);
  }

  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }
}