import { test } from '@playwright/test';

test.describe('Modern Design Verification', () => {
  test('capture modern styling implementation', async ({ page }) => {
    // Navigate to the updated app
    await page.goto('http://localhost:5174');
    
    // Wait for styles to load
    await page.waitForLoadState('networkidle');
    
    // Capture full page screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/modern-design-implemented.png',
      fullPage: true 
    });
    
    // Check if modern styles are applied
    const hasModernStyles = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const h1 = document.querySelector('h1');
      const button = document.querySelector('.btn-primary');
      
      const results = {
        navShadow: nav ? window.getComputedStyle(nav).boxShadow : 'none',
        h1Color: h1 ? window.getComputedStyle(h1).color : 'none',
        h1Size: h1 ? window.getComputedStyle(h1).fontSize : 'none',
        buttonExists: !!button,
        buttonClasses: button ? button.className : 'none',
        bodyBg: window.getComputedStyle(document.body).backgroundColor,
        gradientBg: !!document.querySelector('.bg-gradient-to-br')
      };
      
      return results;
    });
    
    console.log('Modern Styles Applied:', hasModernStyles);
    
    // Test responsive at different viewports
    const viewports = [
      { width: 390, height: 844, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: `tests/screenshots/modern-design-${viewport.name}.png`,
        fullPage: true 
      });
    }
    
    // Verify color compliance
    const colorCompliance = await page.evaluate(() => {
      const getColors = () => {
        const h1 = document.querySelector('h1');
        const primaryButton = document.querySelector('.btn-primary');
        
        return {
          h1Color: h1 ? window.getComputedStyle(h1).color : null,
          // Check if blue-600 (#2563eb) is used
          isUsingBlue: h1?.className.includes('blue-600'),
          buttonBackground: primaryButton ? window.getComputedStyle(primaryButton).backgroundColor : null,
          // Check gradient
          hasGradient: !!document.querySelector('.gradient-primary')
        };
      };
      
      return getColors();
    });
    
    console.log('Color Compliance:', colorCompliance);
    
    // Check animations
    const hasAnimations = await page.evaluate(() => {
      const animatedElements = document.querySelectorAll('.animate-slide-up, .animate-fade-in');
      return animatedElements.length > 0;
    });
    
    console.log('Has Animations:', hasAnimations);
    
    // Check modern components
    const modernComponents = await page.evaluate(() => {
      return {
        hasFeatureCards: document.querySelectorAll('.feature-card').length,
        hasCardModern: document.querySelectorAll('.card-modern').length,
        hasShadowModern: document.querySelectorAll('.shadow-modern, .shadow-modern-lg').length,
        hasGradients: document.querySelectorAll('[class*="gradient"]').length
      };
    });
    
    console.log('Modern Components Found:', modernComponents);
  });
});