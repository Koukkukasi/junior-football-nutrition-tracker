# Playwright MCP Integration Guide

## Overview
This project is configured with Playwright for E2E testing and integrated with MCP (Model Context Protocol) browser automation tools for AI-powered testing.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd client
npm install
npm run test:install  # Install Playwright browsers
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Run Tests

#### Run All Tests
```bash
npm run test
```

#### Run Specific Test Suites
```bash
npm run test:food-log      # Food logging tests
npm run test:mobile        # Mobile device tests
npm run test:desktop       # Desktop browser tests
npm run test:visual        # Visual regression tests
```

#### Interactive Mode
```bash
npm run test:ui           # UI mode for debugging
npm run test:debug        # Debug mode
npm run test:headed       # Run with visible browser
```

## 📁 Project Structure

```
client/
├── playwright.config.ts       # Playwright configuration
├── tests/
│   ├── e2e/                  # End-to-end tests
│   │   └── food-log.spec.ts  # Food logging tests
│   ├── pages/                # Page object models
│   │   ├── BasePage.ts       # Base page functionality
│   │   └── FoodLogPage.ts    # Food log page interactions
│   └── utils/
│       └── mcp-helpers.ts    # MCP browser tool helpers
├── agents/
│   ├── testing-agent/        # Test orchestration
│   │   └── runner.ts         # Automated test runner
│   ├── nutrition-agent/      # Nutrition analysis
│   │   └── analyzer.ts       # Food quality scoring
│   └── ui-agent/            # UI validation
```

## 🤖 MCP Browser Tools

The project uses MCP browser automation tools for advanced testing capabilities:

### Available MCP Tools
- `mcp__playwright__browser_navigate` - Navigate to URLs
- `mcp__playwright__browser_click` - Click elements
- `mcp__playwright__browser_type` - Type text
- `mcp__playwright__browser_snapshot` - Capture page state
- `mcp__playwright__browser_take_screenshot` - Visual testing
- `mcp__playwright__browser_wait_for` - Wait for conditions
- `mcp__playwright__browser_select_option` - Select dropdowns
- `mcp__playwright__browser_resize` - Test responsive design

### Example Usage
```typescript
// Navigate to app
await mcp__playwright__browser_navigate({ url: 'http://localhost:5173' })

// Fill form
await mcp__playwright__browser_type({
  element: 'Email input',
  ref: 'input[type="email"]',
  text: 'test@example.com'
})

// Click button
await mcp__playwright__browser_click({
  element: 'Submit button',
  ref: 'button[type="submit"]'
})

// Take screenshot
await mcp__playwright__browser_take_screenshot({
  filename: 'test-result.png',
  fullPage: true
})
```

## 🧪 Test Features

### Food Logging Tests
- Quality analysis (excellent/good/fair/poor)
- Nutrition score calculations
- Form validation
- Meal persistence
- Visual elements

### Visual Regression Testing
- Capture baseline screenshots
- Compare with current state
- Detect UI changes
- Multi-viewport testing

### Performance Testing
- Page load times
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

### Accessibility Testing
- WCAG compliance
- Keyboard navigation
- Screen reader support
- Color contrast validation

## 🎯 Sub-Agents

### Testing Agent
Orchestrates test execution and generates reports:
```bash
npm run test:agent
```

### Nutrition Agent
Analyzes food quality and provides recommendations:
- Food quality scoring
- Macro/micronutrient calculations
- Meal recommendations
- Daily goal tracking

### UI Agent
Validates user interface elements:
- Responsive design testing
- Theme consistency
- Component validation
- Accessibility checks

## 📊 Test Reports

### HTML Report
After running tests, view the detailed HTML report:
```bash
npm run test:report
```

### JSON Results
Test results are saved to `test-results.json` for programmatic access.

### Screenshots
- Test failures: `test-results/`
- Visual regression: `tests/screenshots/`
- Baseline images: `tests/baseline/`

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)
- **Browsers**: Chrome, Firefox, Safari
- **Devices**: Desktop, iPhone 12, Pixel 5
- **Base URL**: http://localhost:5173
- **Timeouts**: 15s action, 30s navigation
- **Retries**: 2 on CI, 0 locally

### Test Scripts
All test commands are configured in `package.json`:
```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:headed": "playwright test --headed",
    "test:food-log": "playwright test tests/e2e/food-log.spec.ts",
    "test:report": "playwright show-report",
    "test:visual": "playwright test --grep visual",
    "test:mobile": "playwright test --project=mobile-chrome --project=mobile-safari",
    "test:desktop": "playwright test --project=chromium --project=firefox --project=webkit"
  }
}
```

## 🐛 Troubleshooting

### Tests Failing
1. Ensure dev server is running: `npm run dev`
2. Check correct routes (e.g., `/food` not `/food-log`)
3. Verify Clerk authentication is configured
4. Install browsers: `npm run test:install`

### MCP Tools Not Working
1. Ensure MCP server is running
2. Check browser automation permissions
3. Verify tool names are correct
4. Check console for error messages

### Visual Tests Failing
1. Update baseline images if UI changed intentionally
2. Check viewport sizes match configuration
3. Ensure consistent rendering across runs
4. Clear browser cache if needed

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [MCP Protocol Spec](https://modelcontextprotocol.io)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Visual Testing Guide](https://playwright.dev/docs/test-snapshots)

## 🎉 Benefits

1. **Automated Testing**: Comprehensive E2E test coverage
2. **AI-Powered**: MCP integration for intelligent testing
3. **Visual Regression**: Catch UI changes automatically
4. **Cross-Browser**: Test on all major browsers
5. **Mobile Testing**: Ensure responsive design
6. **Fast Feedback**: Quick test execution
7. **Detailed Reports**: HTML and JSON reporting
8. **Maintainable**: Page object models for easy updates

This setup provides a robust testing framework that combines traditional Playwright testing with advanced MCP browser automation capabilities for comprehensive quality assurance.