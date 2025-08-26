import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface MealEntry {
  mealType: 'BREAKFAST' | 'SNACK' | 'LUNCH' | 'DINNER' | 'PRE_GAME' | 'POST_GAME';
  time: string;
  location: string;
  description: string;
  notes?: string;
}

/**
 * Food Log Page Object Model
 * Handles all interactions with the food logging page
 */
export class FoodLogPage extends BasePage {
  readonly addMealButton: Locator;
  readonly mealTypeSelect: Locator;
  readonly timeInput: Locator;
  readonly locationInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly notesInput: Locator;
  readonly saveMealButton: Locator;
  readonly cancelButton: Locator;
  readonly nutritionScore: Locator;
  readonly scoreBar: Locator;
  readonly mealsList: Locator;
  readonly mealForm: Locator;

  constructor(page: Page) {
    super(page);
    this.addMealButton = page.getByRole('button', { name: /Add Meal/i });
    this.mealTypeSelect = page.locator('select').first();
    this.timeInput = page.locator('input[type="time"]');
    this.locationInput = page.locator('input[placeholder*="Home, School"]');
    this.descriptionTextarea = page.locator('textarea[placeholder*="Describe your meal"]');
    this.notesInput = page.locator('input[placeholder*="How did you feel"]');
    this.saveMealButton = page.getByRole('button', { name: /Save Meal/i });
    this.cancelButton = page.getByRole('button', { name: /Cancel/i });
    this.nutritionScore = page.locator(':text-matches("\\d+/100")');
    this.scoreBar = page.locator('[style*="linear-gradient"]');
    this.mealsList = page.locator('.divide-y').last();
    this.mealForm = page.locator('form');
  }

  async navigateToFoodLog() {
    await this.navigate('/food');
    await this.page.waitForSelector('h1:has-text("Food Log")');
  }

  async openMealForm() {
    await this.addMealButton.click();
    await this.mealForm.waitFor({ state: 'visible' });
  }

  async closeMealForm() {
    await this.cancelButton.click();
    await this.mealForm.waitFor({ state: 'hidden' });
  }

  async fillMealForm(meal: MealEntry) {
    await this.mealTypeSelect.selectOption(meal.mealType);
    await this.timeInput.fill(meal.time);
    await this.locationInput.fill(meal.location);
    await this.descriptionTextarea.fill(meal.description);
    
    if (meal.notes) {
      await this.notesInput.fill(meal.notes);
    }
  }

  async submitMealForm() {
    await this.saveMealButton.click();
    // Wait for form to close
    await this.mealForm.waitFor({ state: 'hidden' });
  }

  async addMeal(meal: MealEntry) {
    await this.openMealForm();
    await this.fillMealForm(meal);
    await this.submitMealForm();
  }

  async getNutritionScore(): Promise<number> {
    const scoreText = await this.nutritionScore.textContent();
    if (!scoreText) return 0;
    const match = scoreText.match(/(\d+)\/100/);
    return match ? parseInt(match[1]) : 0;
  }

  async getScoreStatus(): Promise<string> {
    const scoreElement = this.page.locator('span[style*="backgroundColor"]');
    const text = await scoreElement.textContent();
    return text || '';
  }

  async getMealCount(): Promise<number> {
    const meals = await this.mealsList.locator('> div').count();
    return meals;
  }

  async getMealQuality(index: number): Promise<string> {
    const meal = this.mealsList.locator('> div').nth(index);
    const qualityBadge = meal.locator('.rounded-full');
    const text = await qualityBadge.textContent();
    return text || '';
  }

  async verifyMealEntry(description: string): Promise<boolean> {
    const meal = this.page.locator(`text="${description}"`);
    return await meal.isVisible();
  }

  async getMealDetails(index: number) {
    const meal = this.mealsList.locator('> div').nth(index);
    const mealType = await meal.locator('.font-medium').first().textContent();
    const timeLocation = await meal.locator('.text-gray-500').first().textContent();
    const description = await meal.locator('.text-gray-700').textContent();
    const quality = await this.getMealQuality(index);
    
    return {
      mealType,
      timeLocation,
      description,
      quality
    };
  }

  async verifyScoreInRange(min: number, max: number) {
    const score = await this.getNutritionScore();
    expect(score).toBeGreaterThanOrEqual(min);
    expect(score).toBeLessThanOrEqual(max);
  }

  async verifyQualityAnalysis(description: string, expectedQuality: string) {
    await this.addMeal({
      mealType: 'LUNCH',
      time: '12:00',
      location: 'Test',
      description: description
    });
    
    const lastMealIndex = (await this.getMealCount()) - 1;
    const quality = await this.getMealQuality(lastMealIndex);
    expect(quality.toLowerCase()).toContain(expectedQuality.toLowerCase());
  }

  async clearAllMeals() {
    // This would need backend integration to actually clear meals
    // For now, it's a placeholder for future implementation
    console.log('Clear meals functionality to be implemented');
  }

  async exportMealData() {
    // Placeholder for exporting meal data functionality
    console.log('Export functionality to be implemented');
  }
}