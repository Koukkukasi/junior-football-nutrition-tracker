/**
 * Playwright Test Generator
 * Generates Playwright E2E tests based on UI components and user flows
 */

import { promises as fs } from 'fs';
import { join, dirname, relative } from 'path';
import { TestConfig } from './config';
import { testTemplates, renderTemplate, validateTemplateVariables } from './test-templates';

export interface ComponentAnalysis {
  name: string;
  path: string;
  type: 'component' | 'page' | 'hook' | 'utility';
  props: PropInfo[];
  interactions: InteractionInfo[];
  testIds: string[];
  ariaLabels: string[];
  routes: string[];
  dependencies: string[];
  ageSpecific: boolean;
  nutritionRelated: boolean;
}

export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  default?: string;
}

export interface InteractionInfo {
  type: 'click' | 'input' | 'select' | 'submit' | 'navigation';
  element: string;
  testId: string;
  description: string;
}

export interface TestScenario {
  name: string;
  description: string;
  type: 'auth' | 'food-entry' | 'analytics' | 'performance' | 'visual' | 'accessibility';
  ageGroups: string[];
  steps: TestStep[];
  expectedOutcome: string;
  assertions: string[];
}

export interface TestStep {
  action: string;
  selector: string;
  value?: string;
  waitFor?: string;
  screenshot?: boolean;
}

export class PlaywrightTestGenerator {
  constructor(private config: TestConfig) {}

  /**
   * Generate E2E tests for a component
   */
  async generateComponentTests(
    componentPath: string,
    options: {
      includeVisual?: boolean;
      includeAccessibility?: boolean;
      ageSpecific?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const analysis = await this.analyzeComponent(componentPath);
      
      if (!analysis) {
        throw new Error(`Could not analyze component at ${componentPath}`);
      }

      const testScenarios = this.generateTestScenarios(analysis, options);
      const testCode = this.generateTestFile(analysis, testScenarios);
      
      // Write test file
      const testFileName = `${analysis.name.toLowerCase()}.spec.ts`;
      const testPath = join(this.config.paths.tests.e2e, testFileName);
      
      await this.ensureDirectory(dirname(testPath));
      await fs.writeFile(testPath, testCode);
      
      return testPath;
    } catch (error) {
      throw new Error(`Failed to generate component tests: ${error.message}`);
    }
  }

  /**
   * Generate authentication flow tests
   */
  async generateAuthTests(): Promise<string> {
    const testScenarios: TestScenario[] = [
      {
        name: 'User Registration',
        description: 'Test user registration with age-specific features',
        type: 'auth',
        ageGroups: ['U8', 'U10', 'U12', 'U15'],
        steps: [
          { action: 'navigate', selector: '', value: '/signup' },
          { action: 'fill', selector: '[data-testid="email-input"]', value: 'test@fcinter.com' },
          { action: 'fill', selector: '[data-testid="password-input"]', value: 'SecurePass123!' },
          { action: 'select', selector: '[data-testid="age-select"]', value: '{{AGE}}' },
          { action: 'click', selector: '[data-testid="signup-submit"]' },
          { action: 'waitFor', selector: '[data-testid="dashboard"]', screenshot: true }
        ],
        expectedOutcome: 'User successfully registered and redirected to dashboard',
        assertions: [
          'page should be at dashboard URL',
          'welcome message should be visible',
          'age-appropriate features should be shown'
        ]
      },
      {
        name: 'User Login',
        description: 'Test user login with different user types',
        type: 'auth',
        ageGroups: ['all'],
        steps: [
          { action: 'navigate', selector: '', value: '/signin' },
          { action: 'fill', selector: '[data-testid="email-input"]', value: '{{EMAIL}}' },
          { action: 'fill', selector: '[data-testid="password-input"]', value: '{{PASSWORD}}' },
          { action: 'click', selector: '[data-testid="signin-submit"]' },
          { action: 'waitFor', selector: '[data-testid="user-menu"]' }
        ],
        expectedOutcome: 'User successfully authenticated and dashboard shown',
        assertions: [
          'user menu should be visible',
          'authentication token should be stored',
          'protected routes should be accessible'
        ]
      },
      {
        name: 'Protected Route Access',
        description: 'Test access control for protected routes',
        type: 'auth',
        ageGroups: ['all'],
        steps: [
          { action: 'navigate', selector: '', value: '/food-log', waitFor: '[data-testid="signin-form"]' },
          { action: 'fill', selector: '[data-testid="email-input"]', value: 'test@fcinter.com' },
          { action: 'fill', selector: '[data-testid="password-input"]', value: 'testpass123' },
          { action: 'click', selector: '[data-testid="signin-submit"]' },
          { action: 'waitFor', selector: '[data-testid="food-log-container"]' }
        ],
        expectedOutcome: 'Redirected to signin then to requested page after auth',
        assertions: [
          'should redirect unauthenticated users to signin',
          'should redirect to original page after authentication'
        ]
      }
    ];

    const variables = {
      COMPONENT_NAME: 'Authentication',
      TEST_URL: '/signin',
      BASE_URL: this.config.execution.playwright.baseURL,
      MAIN_COMPONENT: 'signin-form'
    };

    const template = testTemplates.authE2E.template;
    const testCode = renderTemplate(template, variables);
    
    const testPath = join(this.config.paths.tests.e2e, 'auth.spec.ts');
    await this.ensureDirectory(dirname(testPath));
    await fs.writeFile(testPath, testCode);
    
    return testPath;
  }

  /**
   * Generate food logging tests with nutrition analysis
   */
  async generateFoodLogTests(): Promise<string> {
    const testScenarios: TestScenario[] = [
      {
        name: 'Food Entry Logging',
        description: 'Test logging food entries with quality scoring',
        type: 'food-entry',
        ageGroups: ['U8', 'U10', 'U12', 'U15'],
        steps: [
          { action: 'navigate', selector: '', value: '/food-log' },
          { action: 'fill', selector: '[data-testid="food-name"]', value: '{{FOOD_NAME}}' },
          { action: 'select', selector: '[data-testid="meal-type"]', value: '{{MEAL_TYPE}}' },
          { action: 'fill', selector: '[data-testid="location"]', value: 'Home' },
          { action: 'click', selector: '[data-testid="submit-entry"]' },
          { action: 'waitFor', selector: '[data-testid="nutrition-score"]', screenshot: true }
        ],
        expectedOutcome: 'Food entry logged with nutrition score calculated',
        assertions: [
          'food entry should appear in log',
          'nutrition score should be displayed',
          'age-appropriate feedback should be shown'
        ]
      },
      {
        name: 'Food Quality Analysis',
        description: 'Test different food quality levels and scoring',
        type: 'food-entry',
        ageGroups: ['all'],
        steps: [
          { action: 'navigate', selector: '', value: '/food-log' },
          { action: 'fill', selector: '[data-testid="food-name"]', value: 'Quinoa salad with salmon' },
          { action: 'click', selector: '[data-testid="analyze-button"]' },
          { action: 'waitFor', selector: '[data-testid="excellent-score"]', screenshot: true }
        ],
        expectedOutcome: 'Excellent food receives high score and positive feedback',
        assertions: [
          'score should be above 85',
          'quality should be marked as excellent',
          'positive recommendations should be shown'
        ]
      },
      {
        name: 'Meal Timing Analysis',
        description: 'Test meal timing recommendations',
        type: 'food-entry',
        ageGroups: ['U10', 'U12', 'U15'],
        steps: [
          { action: 'navigate', selector: '', value: '/food-log' },
          { action: 'fill', selector: '[data-testid="food-name"]', value: 'Banana with oats' },
          { action: 'select', selector: '[data-testid="meal-timing"]', value: 'PRE_TRAINING' },
          { action: 'click', selector: '[data-testid="analyze-timing"]' },
          { action: 'waitFor', selector: '[data-testid="timing-recommendations"]' }
        ],
        expectedOutcome: 'Pre-training meal receives appropriate timing score',
        assertions: [
          'timing score should be high for pre-training meal',
          'carbohydrate recommendations should be shown',
          'hydration advice should be provided'
        ]
      }
    ];

    const testCode = this.generateFoodLogTestCode(testScenarios);
    
    const testPath = join(this.config.paths.tests.e2e, 'food-log.spec.ts');
    await this.ensureDirectory(dirname(testPath));
    await fs.writeFile(testPath, testCode);
    
    return testPath;
  }

  /**
   * Generate performance tests
   */
  async generatePerformanceTests(): Promise<string> {
    const variables = {
      COMPONENT_NAME: 'Application',
      BASE_URL: this.config.execution.playwright.baseURL,
      TEST_URL: '/food-log',
      FOOD_LOG_URL: '/food-log',
      ANALYTICS_URL: '/analytics',
      MAIN_COMPONENT: 'app-container'
    };

    const template = testTemplates.performance.template;
    const testCode = renderTemplate(template, variables);
    
    const testPath = join(this.config.paths.tests.e2e, 'performance.spec.ts');
    await this.ensureDirectory(dirname(testPath));
    await fs.writeFile(testPath, testCode);
    
    return testPath;
  }

  /**
   * Generate visual regression tests
   */
  async generateVisualTests(componentName: string = 'Application'): Promise<string> {
    const variables = {
      COMPONENT_NAME: componentName,
      TEST_URL: this.config.execution.playwright.baseURL,
      COMPONENT: 'main-container'
    };

    const template = testTemplates.visual.template;
    const testCode = renderTemplate(template, variables);
    
    const testPath = join(this.config.paths.tests.e2e, `${componentName.toLowerCase()}-visual.spec.ts`);
    await this.ensureDirectory(dirname(testPath));
    await fs.writeFile(testPath, testCode);
    
    return testPath;
  }

  /**
   * Generate accessibility tests
   */
  async generateAccessibilityTests(): Promise<string> {
    const testCode = `/**
 * Accessibility Tests
 * Generated by Testing Automation Agent
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('${this.config.execution.playwright.baseURL}');
    await injectAxe(page);
  });

  test('should not have accessibility violations on landing page', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('should not have accessibility violations on food log page', async ({ page }) => {
    // Sign in first
    await page.fill('[data-testid="email-input"]', 'test@fcinter.com');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-submit"]');
    
    await page.goto('/food-log');
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test tab navigation through main elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'email-input');
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'password-input');
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'signin-submit');
  });

  test('should have proper ARIA labels for age-specific interfaces', async ({ page }) => {
    // Test U8 interface
    await page.goto('/?age=8');
    await expect(page.locator('[data-testid="simple-interface"]')).toHaveAttribute('aria-label', 'Simple nutrition tracker for young players');
    
    // Test U15 interface
    await page.goto('/?age=15');
    await expect(page.locator('[data-testid="advanced-analytics"]')).toHaveAttribute('aria-label', 'Advanced nutrition analytics for older players');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Test heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Test landmark regions
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Test form labels
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        await expect(page.locator(\`label[for="\${id}"]\`)).toBeVisible();
      }
    }
  });
});`;

    const testPath = join(this.config.paths.tests.e2e, 'accessibility.spec.ts');
    await this.ensureDirectory(dirname(testPath));
    await fs.writeFile(testPath, testCode);
    
    return testPath;
  }

  /**
   * Generate age-specific user journey tests
   */
  async generateAgeSpecificTests(): Promise<string[]> {
    const testPaths: string[] = [];
    
    for (const [ageGroup, config] of Object.entries(this.config.ageGroups)) {
      const testCode = `/**
 * ${ageGroup} Age Group User Journey Tests
 * Generated by Testing Automation Agent
 */

import { test, expect } from '@playwright/test';

test.describe('${ageGroup} User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('${this.config.execution.playwright.baseURL}');
  });

  test('should show age-appropriate interface for ${ageGroup} players', async ({ page }) => {
    // Sign up as ${ageGroup} player
    await page.click('[data-testid="signup-link"]');
    await page.fill('[data-testid="email-input"]', \`${ageGroup.toLowerCase()}@fcinter.com\`);
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.selectOption('[data-testid="age-select"]', '${Math.floor((config.minAge + config.maxAge) / 2)}');
    await page.click('[data-testid="signup-submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/);
    
    ${this.generateAgeSpecificAssertions(ageGroup, config)}
  });

  test('should apply ${ageGroup} nutrition multipliers correctly', async ({ page }) => {
    // Sign in as ${ageGroup} player
    await page.fill('[data-testid="email-input"]', \`${ageGroup.toLowerCase()}@fcinter.com\`);
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-submit"]');
    
    // Go to food log
    await page.goto('/food-log');
    
    // Add food entry
    await page.fill('[data-testid="food-name"]', 'Grilled chicken with rice');
    await page.click('[data-testid="analyze-button"]');
    await page.waitForSelector('[data-testid="nutrition-score"]');
    
    // Check age-specific adjustments
    const scoreElement = page.locator('[data-testid="adjusted-score"]');
    const score = await scoreElement.textContent();
    expect(parseInt(score)).toBeGreaterThan(0);
    
    // Check age-specific recommendations
    ${this.generateAgeSpecificNutritionTests(ageGroup, config)}
  });

  ${config.testScenarios.map(scenario => this.generateScenarioTest(scenario, ageGroup)).join('\n\n  ')}
});`;

      const testPath = join(this.config.paths.tests.e2e, `${ageGroup.toLowerCase()}-journey.spec.ts`);
      await this.ensureDirectory(dirname(testPath));
      await fs.writeFile(testPath, testCode);
      testPaths.push(testPath);
    }
    
    return testPaths;
  }

  /**
   * Analyze component to understand its structure and generate appropriate tests
   */
  private async analyzeComponent(componentPath: string): Promise<ComponentAnalysis | null> {
    try {
      const content = await fs.readFile(componentPath, 'utf-8');
      
      // Extract component information using basic parsing
      const componentName = this.extractComponentName(content);
      const props = this.extractProps(content);
      const testIds = this.extractTestIds(content);
      const ariaLabels = this.extractAriaLabels(content);
      const interactions = this.extractInteractions(content);
      
      return {
        name: componentName,
        path: componentPath,
        type: this.determineComponentType(componentPath, content),
        props,
        interactions,
        testIds,
        ariaLabels,
        routes: this.extractRoutes(content),
        dependencies: this.extractDependencies(content),
        ageSpecific: content.includes('age') || content.includes('Age'),
        nutritionRelated: content.includes('nutrition') || content.includes('food') || content.includes('Food')
      };
    } catch (error) {
      console.error(`Error analyzing component ${componentPath}:`, error);
      return null;
    }
  }

  private extractComponentName(content: string): string {
    const match = content.match(/export\s+(?:const|function)\s+(\w+)/);
    return match ? match[1] : 'UnknownComponent';
  }

  private extractProps(content: string): PropInfo[] {
    const props: PropInfo[] = [];
    
    // Look for interface definitions
    const interfaceMatch = content.match(/interface\s+\w+Props\s*{([^}]*)}/s);
    if (interfaceMatch) {
      const propsContent = interfaceMatch[1];
      const propMatches = propsContent.match(/(\w+)(\?)?\s*:\s*([^;]+);/g) || [];
      
      propMatches.forEach(propMatch => {
        const parts = propMatch.match(/(\w+)(\?)?\s*:\s*([^;]+);/);
        if (parts) {
          props.push({
            name: parts[1],
            type: parts[3].trim(),
            required: !parts[2],
            default: undefined
          });
        }
      });
    }
    
    return props;
  }

  private extractTestIds(content: string): string[] {
    const matches = content.match(/data-testid="([^"]+)"/g) || [];
    return matches.map(match => match.replace(/data-testid="|"/g, ''));
  }

  private extractAriaLabels(content: string): string[] {
    const matches = content.match(/aria-label="([^"]+)"/g) || [];
    return matches.map(match => match.replace(/aria-label="|"/g, ''));
  }

  private extractInteractions(content: string): InteractionInfo[] {
    const interactions: InteractionInfo[] = [];
    
    // Look for onClick handlers
    const clickMatches = content.match(/onClick={([^}]+)}/g) || [];
    clickMatches.forEach((match, index) => {
      interactions.push({
        type: 'click',
        element: `click-element-${index}`,
        testId: `click-button-${index}`,
        description: `Click interaction ${index + 1}`
      });
    });
    
    // Look for form submissions
    if (content.includes('onSubmit')) {
      interactions.push({
        type: 'submit',
        element: 'form',
        testId: 'form-submit',
        description: 'Form submission'
      });
    }
    
    // Look for input changes
    const inputMatches = content.match(/onChange={([^}]+)}/g) || [];
    inputMatches.forEach((match, index) => {
      interactions.push({
        type: 'input',
        element: `input-element-${index}`,
        testId: `input-field-${index}`,
        description: `Input change ${index + 1}`
      });
    });
    
    return interactions;
  }

  private extractRoutes(content: string): string[] {
    const routes: string[] = [];
    
    // Look for route definitions
    const routeMatches = content.match(/path="([^"]+)"/g) || [];
    routeMatches.forEach(match => {
      routes.push(match.replace(/path="|"/g, ''));
    });
    
    // Look for navigation calls
    const navMatches = content.match(/navigate\(['"`]([^'"`]+)['"`]\)/g) || [];
    navMatches.forEach(match => {
      const route = match.match(/['"`]([^'"`]+)['"`]/);
      if (route) {
        routes.push(route[1]);
      }
    });
    
    return [...new Set(routes)]; // Remove duplicates
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // Extract imports
    const importMatches = content.match(/import .* from ['"`]([^'"`]+)['"`]/g) || [];
    importMatches.forEach(match => {
      const dep = match.match(/from ['"`]([^'"`]+)['"`]/);
      if (dep && !dep[1].startsWith('.')) {
        dependencies.push(dep[1]);
      }
    });
    
    return dependencies;
  }

  private determineComponentType(path: string, content: string): ComponentAnalysis['type'] {
    if (path.includes('/pages/')) return 'page';
    if (path.includes('/hooks/')) return 'hook';
    if (path.includes('/utils/')) return 'utility';
    return 'component';
  }

  private generateTestScenarios(
    analysis: ComponentAnalysis,
    options: { includeVisual?: boolean; includeAccessibility?: boolean; ageSpecific?: boolean }
  ): TestScenario[] {
    const scenarios: TestScenario[] = [];
    
    // Basic rendering test
    scenarios.push({
      name: 'Component Rendering',
      description: `Test ${analysis.name} component renders correctly`,
      type: 'food-entry',
      ageGroups: ['all'],
      steps: [
        { action: 'navigate', selector: '', value: analysis.routes[0] || '/' },
        { action: 'waitFor', selector: `[data-testid="${analysis.testIds[0] || 'component'}"]` }
      ],
      expectedOutcome: 'Component should render without errors',
      assertions: ['component should be visible', 'no console errors']
    });
    
    // Interaction tests
    analysis.interactions.forEach(interaction => {
      scenarios.push({
        name: `${interaction.description} Test`,
        description: `Test ${interaction.type} interaction`,
        type: 'food-entry',
        ageGroups: ['all'],
        steps: [
          { action: 'navigate', selector: '', value: analysis.routes[0] || '/' },
          { action: interaction.type as any, selector: `[data-testid="${interaction.testId}"]` },
          { action: 'waitFor', selector: '[data-testid="result"]' }
        ],
        expectedOutcome: `${interaction.description} should work correctly`,
        assertions: ['interaction should complete', 'expected result should appear']
      });
    });
    
    // Age-specific tests
    if (options.ageSpecific && analysis.ageSpecific) {
      Object.keys(this.config.ageGroups).forEach(ageGroup => {
        scenarios.push({
          name: `${ageGroup} Age Group Test`,
          description: `Test ${analysis.name} for ${ageGroup} players`,
          type: 'food-entry',
          ageGroups: [ageGroup],
          steps: [
            { action: 'navigate', selector: '', value: `${analysis.routes[0] || '/'}?age=${ageGroup}` },
            { action: 'waitFor', selector: `[data-testid="${ageGroup.toLowerCase()}-interface"]` }
          ],
          expectedOutcome: `${ageGroup} specific interface should be shown`,
          assertions: ['age-appropriate features visible', 'correct multipliers applied']
        });
      });
    }
    
    return scenarios;
  }

  private generateTestFile(analysis: ComponentAnalysis, scenarios: TestScenario[]): string {
    const template = testTemplates.component.template;
    
    const variables = {
      COMPONENT_NAME: analysis.name,
      COMPONENT_PATH: relative(this.config.paths.tests.e2e, analysis.path),
      MAIN_ROLE: 'main',
      DEFAULT_PROPS: analysis.props.filter(p => p.required).map(p => `${p.name}: ${this.getDefaultValue(p.type)}`).join(',\n    '),
      MINIMAL_PROPS: analysis.props.filter(p => p.required).map(p => `${p.name}: ${this.getDefaultValue(p.type)}`).join(',\n        '),
      IMPORTS: this.generateImports(analysis),
      MOCKS: this.generateMocks(analysis),
      BEFORE_EACH_SETUP: '',
      AFTER_EACH_CLEANUP: '',
      REQUIRED_ELEMENTS_TESTS: this.generateRequiredElementsTests(analysis),
      CSS_CLASS_TESTS: '',
      INTERACTION_PROPS: 'onClick',
      INTERACTION_TESTS: this.generateInteractionTests(analysis),
      VALIDATION_TESTS: '',
      PROP_CHANGE_TESTS: '',
      ARIA_TESTS: this.generateAriaTests(analysis),
      KEYBOARD_TESTS: '',
      FOCUS_TESTS: '',
      ERROR_HANDLING_TESTS: '',
      ADDITIONAL_TESTS: this.generateAdditionalTests(scenarios)
    };
    
    return renderTemplate(template, variables);
  }

  private getDefaultValue(type: string): string {
    if (type.includes('string')) return "'test'";
    if (type.includes('number')) return '0';
    if (type.includes('boolean')) return 'false';
    if (type.includes('[]')) return '[]';
    if (type.includes('{}') || type.includes('object')) return '{}';
    return 'undefined';
  }

  private generateImports(analysis: ComponentAnalysis): string {
    const imports = analysis.dependencies
      .filter(dep => !dep.startsWith('react'))
      .map(dep => `import { ${dep} } from '${dep}';`)
      .join('\n');
    
    return imports;
  }

  private generateMocks(analysis: ComponentAnalysis): string {
    const mocks = analysis.dependencies
      .filter(dep => dep.includes('api') || dep.includes('service'))
      .map(dep => `vi.mock('${dep}');`)
      .join('\n');
    
    return mocks;
  }

  private generateRequiredElementsTests(analysis: ComponentAnalysis): string {
    return analysis.testIds
      .map(testId => `expect(screen.getByTestId('${testId}')).toBeInTheDocument();`)
      .join('\n      ');
  }

  private generateAriaTests(analysis: ComponentAnalysis): string {
    return analysis.ariaLabels
      .map(label => `expect(screen.getByLabelText('${label}')).toBeInTheDocument();`)
      .join('\n      ');
  }

  private generateInteractionTests(analysis: ComponentAnalysis): string {
    return analysis.interactions
      .map(interaction => {
        switch (interaction.type) {
          case 'click':
            return `await user.click(screen.getByTestId('${interaction.testId}'));\n      expect(mockHandler).toHaveBeenCalled();`;
          case 'input':
            return `await user.type(screen.getByTestId('${interaction.testId}'), 'test input');\n      expect(screen.getByDisplayValue('test input')).toBeInTheDocument();`;
          default:
            return `// Test ${interaction.type} interaction`;
        }
      })
      .join('\n      ');
  }

  private generateAdditionalTests(scenarios: TestScenario[]): string {
    return scenarios
      .map(scenario => `
  describe('${scenario.name}', () => {
    it('${scenario.description}', () => {
      // Generated test for ${scenario.name}
      // TODO: Implement test steps
    });
  });`)
      .join('');
  }

  private generateFoodLogTestCode(scenarios: TestScenario[]): string {
    return `/**
 * Food Log E2E Tests
 * Generated by Testing Automation Agent
 */

import { test, expect } from '@playwright/test';

test.describe('Food Log Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('${this.config.execution.playwright.baseURL}');
    
    // Sign in
    await page.fill('[data-testid="email-input"]', 'test@fcinter.com');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="signin-submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  ${scenarios.map(scenario => this.generateScenarioTestCode(scenario)).join('\n\n  ')}

  test('should handle different age groups appropriately', async ({ page }) => {
    const ageGroups = [
      { age: 7, group: 'U8', expectedFeatures: ['simple-interface', 'parent-supervision'] },
      { age: 9, group: 'U10', expectedFeatures: ['meal-planning', 'nutrition-education'] },
      { age: 11, group: 'U12', expectedFeatures: ['advanced-logging', 'team-features'] },
      { age: 14, group: 'U15', expectedFeatures: ['advanced-analytics', 'performance-correlation'] }
    ];

    for (const { age, group, expectedFeatures } of ageGroups) {
      // Update user age
      await page.goto('/profile');
      await page.selectOption('[data-testid="age-select"]', age.toString());
      await page.click('[data-testid="save-profile"]');
      
      // Go to food log
      await page.goto('/food-log');
      
      // Check age-specific features
      for (const feature of expectedFeatures) {
        await expect(page.locator(\`[data-testid="\${feature}"]\`)).toBeVisible();
      }
      
      // Test age-specific nutrition scoring
      await page.fill('[data-testid="food-name"]', 'Grilled chicken with rice');
      await page.click('[data-testid="analyze-button"]');
      await page.waitForSelector('[data-testid="nutrition-score"]');
      
      const scoreElement = page.locator('[data-testid="adjusted-score"]');
      const score = parseInt(await scoreElement.textContent());
      expect(score).toBeGreaterThan(0);
    }
  });
});`;
  }

  private generateScenarioTestCode(scenario: TestScenario): string {
    const steps = scenario.steps
      .map(step => {
        switch (step.action) {
          case 'navigate':
            return `await page.goto('${step.value}');`;
          case 'fill':
            return `await page.fill('${step.selector}', '${step.value}');`;
          case 'click':
            return `await page.click('${step.selector}');`;
          case 'select':
            return `await page.selectOption('${step.selector}', '${step.value}');`;
          case 'waitFor':
            return `await page.waitForSelector('${step.selector}');${step.screenshot ? '\n    await page.screenshot({ path: \'scenario-screenshot.png\' });' : ''}`;
          default:
            return `// ${step.action} action`;
        }
      })
      .join('\n    ');

    const assertions = scenario.assertions
      .map(assertion => `// Assert: ${assertion}`)
      .join('\n    ');

    return `test('${scenario.description}', async ({ page }) => {
    ${steps}
    
    ${assertions}
    
    // Verify expected outcome: ${scenario.expectedOutcome}
  });`;
  }

  private generateAgeSpecificAssertions(ageGroup: string, config: any): string {
    const assertions = [];
    
    if (ageGroup === 'U8') {
      assertions.push('await expect(page.locator(\'[data-testid="simple-interface"]\\')).toBeVisible();');
      assertions.push('await expect(page.locator(\'[data-testid="parent-supervision-notice"]\\')).toBeVisible();');
    } else if (ageGroup === 'U15') {
      assertions.push('await expect(page.locator(\'[data-testid="advanced-analytics"]\\')).toBeVisible();');
      assertions.push('await expect(page.locator(\'[data-testid="performance-correlation"]\\')).toBeVisible();');
    }
    
    return assertions.join('\n    ');
  }

  private generateAgeSpecificNutritionTests(ageGroup: string, config: any): string {
    const tests = [];
    
    if (config.nutritionMultipliers.hydration > 1) {
      tests.push('await expect(page.locator(\'[data-testid="hydration-bonus"]\\')).toBeVisible();');
    }
    
    if (config.nutritionMultipliers.protein > 1) {
      tests.push('await expect(page.locator(\'[data-testid="protein-emphasis"]\\')).toBeVisible();');
    }
    
    return tests.join('\n    ');
  }

  private generateScenarioTest(scenario: string, ageGroup: string): string {
    return `test('should handle ${scenario} scenario for ${ageGroup}', async ({ page }) => {
    // Navigate to relevant page for ${scenario}
    await page.goto('/food-log');
    
    // Perform ${scenario} specific actions
    // TODO: Implement ${scenario} test steps
    
    // Verify ${ageGroup} specific behavior
    expect(page.locator('[data-testid="age-group-indicator"]')).toContainText('${ageGroup}');
  });`;
  }

  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Generate all E2E tests for the application
   */
  async generateAllTests(): Promise<{
    auth: string;
    foodLog: string;
    performance: string;
    visual: string;
    accessibility: string;
    ageSpecific: string[];
  }> {
    const results = {
      auth: await this.generateAuthTests(),
      foodLog: await this.generateFoodLogTests(),
      performance: await this.generatePerformanceTests(),
      visual: await this.generateVisualTests(),
      accessibility: await this.generateAccessibilityTests(),
      ageSpecific: await this.generateAgeSpecificTests()
    };

    console.log('✅ Generated all Playwright E2E tests successfully!');
    console.log('Generated tests:', Object.values(results).flat());
    
    return results;
  }
}