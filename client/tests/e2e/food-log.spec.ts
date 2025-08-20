import { test, expect } from '@playwright/test';
import { FoodLogPage } from '../pages/FoodLogPage';
import { MCPBrowserTools, MCPTestHelpers } from '../utils/mcp-helpers';

test.describe('Food Logging E2E Tests', () => {
  let foodLogPage: FoodLogPage;

  test.beforeEach(async ({ page }) => {
    foodLogPage = new FoodLogPage(page);
    await foodLogPage.navigateToFoodLog();
  });

  test('should display food log page correctly', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('h1')).toContainText('Food Log');
    await expect(page.locator('text=Track your daily nutrition intake')).toBeVisible();
    await expect(foodLogPage.addMealButton).toBeVisible();
    await expect(foodLogPage.nutritionScore).toBeVisible();
    
    // Take snapshot for visual regression
    await page.screenshot({ path: 'tests/screenshots/food-log-initial.png' });
  });

  test('should open and close meal form', async () => {
    // Open form
    await foodLogPage.openMealForm();
    await expect(foodLogPage.mealForm).toBeVisible();
    await expect(foodLogPage.saveMealButton).toBeVisible();
    
    // Close form
    await foodLogPage.closeMealForm();
    await expect(foodLogPage.mealForm).not.toBeVisible();
  });

  test('should add a healthy meal and calculate good nutrition score', async ({ page }) => {
    const healthyMeal = {
      mealType: 'BREAKFAST' as const,
      time: '08:00',
      location: 'Home',
      description: 'Oatmeal with fresh berries, two eggs, whole grain toast, orange juice',
      notes: 'Felt energized after breakfast'
    };

    // Add the meal
    await foodLogPage.addMeal(healthyMeal);
    
    // Verify meal was added
    await expect(page.locator(`text="${healthyMeal.description}"`)).toBeVisible();
    
    // Verify quality assessment
    const mealCount = await foodLogPage.getMealCount();
    const quality = await foodLogPage.getMealQuality(mealCount - 1);
    expect(quality).toContain('Excellent');
    
    // Verify nutrition score increased
    const score = await foodLogPage.getNutritionScore();
    expect(score).toBeGreaterThan(60);
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/healthy-meal-added.png' });
  });

  test('should add a poor quality meal and show lower nutrition score', async ({ page }) => {
    const junkMeal = {
      mealType: 'LUNCH' as const,
      time: '12:30',
      location: 'School',
      description: 'Chips, candy, soda, chocolate bar',
      notes: 'Quick snack from vending machine'
    };

    // Add the meal
    await foodLogPage.addMeal(junkMeal);
    
    // Verify meal was added
    await expect(page.locator(`text="${junkMeal.description}"`)).toBeVisible();
    
    // Verify quality assessment
    const mealCount = await foodLogPage.getMealCount();
    const quality = await foodLogPage.getMealQuality(mealCount - 1);
    expect(quality).toContain('Poor');
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/junk-meal-added.png' });
  });

  test('should correctly analyze various food qualities', async () => {
    const testCases = [
      {
        description: 'Grilled chicken with vegetables and brown rice',
        expectedQuality: 'excellent'
      },
      {
        description: 'Apple, yogurt, and nuts',
        expectedQuality: 'good'
      },
      {
        description: 'Sandwich with some chips',
        expectedQuality: 'fair'
      },
      {
        description: 'Fast food burger and fries with cola',
        expectedQuality: 'poor'
      }
    ];

    for (const testCase of testCases) {
      await foodLogPage.verifyQualityAnalysis(
        testCase.description,
        testCase.expectedQuality
      );
    }
  });

  test('should show correct nutrition score calculation', async () => {
    // Add multiple meals of different qualities
    const meals = [
      {
        mealType: 'BREAKFAST' as const,
        time: '07:30',
        location: 'Home',
        description: 'Whole grain cereal with milk and banana'
      },
      {
        mealType: 'SNACK' as const,
        time: '10:00',
        location: 'School',
        description: 'Apple and water'
      },
      {
        mealType: 'LUNCH' as const,
        time: '12:30',
        location: 'School',
        description: 'Chicken sandwich, salad, orange juice'
      },
      {
        mealType: 'DINNER' as const,
        time: '18:00',
        location: 'Home',
        description: 'Grilled fish, steamed vegetables, rice'
      },
      {
        mealType: 'EVENING_SNACK' as const,
        time: '20:00',
        location: 'Home',
        description: 'Yogurt with nuts'
      }
    ];

    // Add all meals
    for (const meal of meals) {
      await foodLogPage.addMeal(meal);
    }

    // Verify high nutrition score (5 healthy meals)
    await foodLogPage.verifyScoreInRange(75, 100);
    
    // Verify score status
    const status = await foodLogPage.getScoreStatus();
    expect(status).toMatch(/Excellent|Good/);
  });

  test('should display meal type icons correctly', async ({ page }) => {
    const mealTypes = [
      { type: 'BREAKFAST' as const, icon: '🌅' },
      { type: 'SNACK' as const, icon: '🥨' },
      { type: 'LUNCH' as const, icon: '☀️' },
      { type: 'DINNER' as const, icon: '🌙' },
      { type: 'EVENING_SNACK' as const, icon: '🌃' }
    ];

    for (const { type, icon } of mealTypes) {
      await foodLogPage.addMeal({
        mealType: type,
        time: '12:00',
        location: 'Test',
        description: `Test ${type} meal`
      });
      
      // Verify icon is displayed
      await expect(page.locator(`text="${icon}"`).last()).toBeVisible();
    }
  });

  test('should validate required fields in meal form', async ({ page }) => {
    await foodLogPage.openMealForm();
    
    // Try to submit empty form
    await foodLogPage.saveMealButton.click();
    
    // Form should still be visible (not submitted)
    await expect(foodLogPage.mealForm).toBeVisible();
    
    // Fill required fields one by one and verify
    await foodLogPage.timeInput.fill('12:00');
    await foodLogPage.locationInput.fill('Test Location');
    await foodLogPage.descriptionTextarea.fill('Test meal description');
    
    // Now should be able to submit
    await foodLogPage.saveMealButton.click();
    await expect(foodLogPage.mealForm).not.toBeVisible();
  });

  test('should persist meals after page refresh', async ({ page }) => {
    // Add a meal
    const meal = {
      mealType: 'LUNCH' as const,
      time: '12:00',
      location: 'Office',
      description: 'Salad with grilled chicken',
      notes: 'Light and healthy lunch'
    };
    
    await foodLogPage.addMeal(meal);
    
    // Verify meal is displayed
    await expect(page.locator(`text="${meal.description}"`)).toBeVisible();
    
    // Refresh page
    await page.reload();
    
    // Meal should still be visible
    await expect(page.locator(`text="${meal.description}"`)).toBeVisible();
  });

  test('should show proper nutrition score visualization', async ({ page }) => {
    // Add meals to get different scores
    await foodLogPage.addMeal({
      mealType: 'BREAKFAST' as const,
      time: '08:00',
      location: 'Home',
      description: 'Healthy breakfast with fruits and protein'
    });

    // Check score bar gradient is visible
    await expect(foodLogPage.scoreBar).toBeVisible();
    
    // Check score indicator
    const score = await foodLogPage.getNutritionScore();
    const indicator = page.locator('.w-8.h-8.bg-black.rounded-full');
    await expect(indicator).toBeVisible();
    await expect(indicator).toContainText(score.toString());
    
    // Verify color zones are labeled
    await expect(page.locator('text=POOR')).toBeVisible();
    await expect(page.locator('text=FAIR')).toBeVisible();
    await expect(page.locator('text=GOOD')).toBeVisible();
    await expect(page.locator('text=EXCELLENT')).toBeVisible();
  });

  test('should work correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Navigate to food log
    await foodLogPage.navigateToFoodLog();
    
    // Verify mobile layout
    await expect(foodLogPage.addMealButton).toBeVisible();
    
    // Add a meal on mobile
    await foodLogPage.addMeal({
      mealType: 'LUNCH' as const,
      time: '12:00',
      location: 'Mobile Test',
      description: 'Testing on mobile device'
    });
    
    // Take mobile screenshot
    await page.screenshot({ path: 'tests/screenshots/food-log-mobile.png' });
  });
});

// MCP Browser Tool Tests - These demonstrate using MCP tools directly
test.describe('Food Logging with MCP Browser Tools', () => {
  test('should add meal using MCP browser automation', async () => {
    // Navigate using MCP tool
    await MCPBrowserTools.navigate({ url: 'http://localhost:5173/food-log' });
    
    // Take initial snapshot
    await MCPBrowserTools.snapshot();
    
    // Click Add Meal button
    await MCPBrowserTools.click({
      element: 'Add Meal button',
      ref: 'button:has-text("Add Meal")'
    });
    
    // Fill meal form using MCP tools
    await MCPBrowserTools.selectOption({
      element: 'Meal type dropdown',
      ref: 'select',
      values: ['BREAKFAST']
    });
    
    await MCPBrowserTools.type({
      element: 'Time input',
      ref: 'input[type="time"]',
      text: '08:30'
    });
    
    await MCPBrowserTools.type({
      element: 'Location input',
      ref: 'input[placeholder*="Home"]',
      text: 'Home Kitchen'
    });
    
    await MCPBrowserTools.type({
      element: 'Meal description',
      ref: 'textarea',
      text: 'Scrambled eggs with whole wheat toast and orange juice'
    });
    
    // Submit form
    await MCPBrowserTools.click({
      element: 'Save button',
      ref: 'button:has-text("Save Meal")'
    });
    
    // Wait for meal to be added
    await MCPBrowserTools.waitFor({
      text: 'Scrambled eggs'
    });
    
    // Take screenshot of result
    await MCPBrowserTools.screenshot({
      filename: 'mcp-meal-added.png',
      fullPage: true
    });
  });

  test('should test nutrition scoring with MCP tools', async () => {
    // Use helper to add multiple meals
    await MCPTestHelpers.addMeal({
      type: 'BREAKFAST',
      time: '07:00',
      location: 'Home',
      description: 'Oatmeal with berries',
      notes: 'Healthy start'
    });
    
    await MCPTestHelpers.addMeal({
      type: 'LUNCH',
      time: '12:00',
      location: 'Work',
      description: 'Grilled chicken salad'
    });
    
    await MCPTestHelpers.addMeal({
      type: 'DINNER',
      time: '18:00',
      location: 'Home',
      description: 'Salmon with vegetables'
    });
    
    // Verify nutrition score
    await MCPTestHelpers.verifyNutritionScore(70, 100);
    
    // Capture visual regression
    await MCPTestHelpers.captureVisualRegression('nutrition-score-high');
  });

  test('should test responsive design with MCP', async () => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 390, height: 844, name: 'mobile' }
    ];
    
    await MCPTestHelpers.testResponsive(viewports);
  });
});