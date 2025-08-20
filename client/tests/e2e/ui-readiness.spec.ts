import { test, expect } from '@playwright/test';

test.describe('UI Readiness Testing', () => {
  
  // Test 1: Capture UI while loading
  test('capture loading state without waiting', async ({ page }) => {
    // Navigate without waiting for load to complete
    page.goto('http://localhost:5173', { waitUntil: 'commit' });
    
    // Immediately take screenshot to catch loading state
    await page.screenshot({ 
      path: 'tests/screenshots/ui-loading-state.png',
      fullPage: true 
    });
    
    // Also capture specific loading indicators
    const loadingElement = page.locator('text=Loading');
    if (await loadingElement.isVisible()) {
      await loadingElement.screenshot({ 
        path: 'tests/screenshots/loading-indicator.png' 
      });
    }
  });

  // Test 2: Capture missing elements
  test('capture missing UI elements', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Try to find elements that should exist
    const missingElements = [];
    
    // Check for required elements
    const requiredElements = [
      { selector: '[data-testid="nutrition-score"]', name: 'Nutrition Score' },
      { selector: '[data-testid="meal-form"]', name: 'Meal Form' },
      { selector: '[data-testid="daily-goals"]', name: 'Daily Goals' }
    ];
    
    for (const element of requiredElements) {
      const exists = await page.locator(element.selector).count() > 0;
      if (!exists) {
        missingElements.push(element.name);
        
        // Take screenshot showing the missing element area
        await page.screenshot({ 
          path: `tests/screenshots/missing-${element.name.replace(/\s+/g, '-').toLowerCase()}.png`,
          fullPage: true 
        });
      }
    }
    
    // Document what's missing
    if (missingElements.length > 0) {
      console.log('Missing UI Elements:', missingElements);
    }
  });

  // Test 3: Capture layout issues
  test('capture layout breaking at different viewports', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const problematicViewports = [
      { width: 375, height: 667, name: 'iphone-se' },
      { width: 768, height: 1024, name: 'ipad' },
      { width: 1366, height: 768, name: 'laptop' }
    ];
    
    for (const viewport of problematicViewports) {
      await page.setViewportSize(viewport);
      
      // Wait a bit for layout to adjust
      await page.waitForTimeout(500);
      
      // Take screenshot
      await page.screenshot({ 
        path: `tests/screenshots/layout-issue-${viewport.name}.png`,
        fullPage: true 
      });
      
      // Check for overlapping elements
      const overlapping = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const issues = [];
        
        for (let i = 0; i < elements.length; i++) {
          const rect1 = elements[i].getBoundingClientRect();
          for (let j = i + 1; j < elements.length; j++) {
            const rect2 = elements[j].getBoundingClientRect();
            
            // Check if elements overlap
            if (!(rect1.right < rect2.left || 
                  rect1.left > rect2.right || 
                  rect1.bottom < rect2.top || 
                  rect1.top > rect2.bottom)) {
              issues.push({
                element1: elements[i].tagName,
                element2: elements[j].tagName
              });
            }
          }
        }
        return issues;
      });
      
      if (overlapping.length > 0) {
        console.log(`Layout issues at ${viewport.name}:`, overlapping);
      }
    }
  });

  // Test 4: Capture slow loading content
  test('capture progressive loading issues', async ({ page }) => {
    // Start navigation
    const navigationPromise = page.goto('http://localhost:5173/food');
    
    // Take screenshots at intervals during load
    const intervals = [100, 500, 1000, 2000, 3000];
    
    for (const ms of intervals) {
      setTimeout(async () => {
        await page.screenshot({ 
          path: `tests/screenshots/progressive-load-${ms}ms.png`,
          fullPage: true 
        });
      }, ms);
    }
    
    // Wait for navigation to complete
    await navigationPromise;
    
    // Final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/progressive-load-complete.png',
      fullPage: true 
    });
  });

  // Test 5: Capture rendering issues
  test('capture CSS not loaded properly', async ({ page }) => {
    // Block CSS to see unstyled content
    await page.route('**/*.css', route => route.abort());
    
    await page.goto('http://localhost:5173');
    
    // Screenshot without CSS
    await page.screenshot({ 
      path: 'tests/screenshots/no-css-loaded.png',
      fullPage: true 
    });
  });

  // Test 6: Capture JavaScript errors affecting UI
  test('capture UI with JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('http://localhost:5173');
    
    // If there are errors, take screenshot
    if (errors.length > 0) {
      await page.screenshot({ 
        path: 'tests/screenshots/ui-with-js-errors.png',
        fullPage: true 
      });
      
      // Annotate the screenshot with error info
      await page.evaluate((errorList) => {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: red;
          color: white;
          padding: 10px;
          z-index: 10000;
          max-width: 300px;
        `;
        errorDiv.innerHTML = `
          <strong>JS Errors Detected:</strong><br>
          ${errorList.join('<br>')}
        `;
        document.body.appendChild(errorDiv);
      }, errors);
      
      // Take another screenshot with error overlay
      await page.screenshot({ 
        path: 'tests/screenshots/ui-with-error-overlay.png',
        fullPage: true 
      });
    }
  });

  // Test 7: Capture timing issues
  test('capture UI before data loads', async ({ page }) => {
    // Navigate and immediately screenshot
    page.goto('http://localhost:5173/food', { waitUntil: 'commit' });
    
    // Capture at different stages
    await page.screenshot({ 
      path: 'tests/screenshots/before-dom-content.png' 
    });
    
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ 
      path: 'tests/screenshots/after-dom-content.png' 
    });
    
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'tests/screenshots/after-network-idle.png' 
    });
  });

  // Test 8: Capture specific UI problems
  test('highlight UI problems with annotations', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Find and highlight problems
    await page.evaluate(() => {
      // Find elements with potential issues
      const problems = [];
      
      // Check for missing alt text
      document.querySelectorAll('img:not([alt])').forEach(img => {
        img.style.border = '3px solid red';
        problems.push('Image missing alt text');
      });
      
      // Check for small touch targets
      document.querySelectorAll('button, a').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          (el as HTMLElement).style.outline = '3px solid orange';
          problems.push('Touch target too small');
        }
      });
      
      // Check for low contrast text
      document.querySelectorAll('*').forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;
        
        // Simple contrast check (you'd use a proper algorithm in production)
        if (color && bgColor && color === bgColor) {
          (el as HTMLElement).style.textDecoration = 'underline wavy red';
          problems.push('Potential contrast issue');
        }
      });
      
      // Add problem summary to page
      if (problems.length > 0) {
        const summary = document.createElement('div');
        summary.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 0, 0, 0.9);
          color: white;
          padding: 10px;
          z-index: 10000;
          font-family: monospace;
        `;
        summary.innerHTML = `
          <strong>UI Issues Found:</strong> ${problems.length}<br>
          ${[...new Set(problems)].join(', ')}
        `;
        document.body.appendChild(summary);
      }
    });
    
    // Take annotated screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/ui-problems-highlighted.png',
      fullPage: true 
    });
  });

  // Test 9: Capture flashing/flickering content
  test('capture UI instability', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Take rapid screenshots to catch flickering
    const screenshots = [];
    for (let i = 0; i < 5; i++) {
      screenshots.push(
        page.screenshot({ 
          path: `tests/screenshots/flicker-test-${i}.png` 
        })
      );
      await page.waitForTimeout(100);
    }
    
    await Promise.all(screenshots);
  });

  // Test 10: Network failure UI states
  test('capture UI with network failures', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    try {
      await page.goto('http://localhost:5173', { 
        waitUntil: 'commit',
        timeout: 5000 
      });
    } catch (e) {
      // Expected to fail
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/ui-offline-state.png',
      fullPage: true 
    });
    
    // Simulate slow network
    await page.context().setOffline(false);
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 3000); // 3 second delay
    });
    
    page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/ui-slow-network.png',
      fullPage: true 
    });
  });
});

// Helper test for MCP browser tools
test.describe('UI Readiness with MCP Tools', () => {
  test('use MCP to capture UI issues', async () => {
    // This demonstrates using MCP tools to capture UI problems
    console.log(`
    // MCP Browser Tool Commands:
    
    // 1. Navigate without waiting
    await mcp__playwright__browser_navigate({ 
      url: 'http://localhost:5173' 
    });
    
    // 2. Immediately screenshot
    await mcp__playwright__browser_take_screenshot({
      filename: 'ui-not-ready.png',
      fullPage: true
    });
    
    // 3. Check for loading indicators
    await mcp__playwright__browser_snapshot();
    
    // 4. Evaluate page state
    await mcp__playwright__browser_evaluate({
      function: () => {
        return {
          hasLoader: !!document.querySelector('.loading'),
          hasContent: !!document.querySelector('.content'),
          errors: Array.from(document.querySelectorAll('.error')).map(e => e.textContent)
        };
      }
    });
    
    // 5. Take screenshot with annotations
    await mcp__playwright__browser_evaluate({
      function: () => {
        // Highlight problems
        document.querySelectorAll('[data-loading]').forEach(el => {
          el.style.border = '3px solid red';
        });
      }
    });
    
    await mcp__playwright__browser_take_screenshot({
      filename: 'ui-problems-highlighted.png',
      fullPage: true
    });
    `);
  });
});