/**
 * Testing Automation Agent Configuration
 * Configuration for test paths, thresholds, and settings for the Junior Football Nutrition Tracker
 */

import { join } from 'path';

export interface TestConfig {
  // Path configurations
  paths: {
    root: string;
    client: string;
    server: string;
    tests: {
      e2e: string;
      unit: string;
      integration: string;
      fixtures: string;
      screenshots: string;
      reports: string;
    };
    src: {
      components: string;
      lib: string;
      hooks: string;
      pages: string;
      utils: string;
      types: string;
    };
    coverage: {
      output: string;
      reports: string;
    };
  };
  
  // Test execution settings
  execution: {
    playwright: {
      baseURL: string;
      timeout: number;
      retries: number;
      workers: number;
      browsers: string[];
      devices: string[];
      headless: boolean;
      slowMo: number;
    };
    jest: {
      testTimeout: number;
      setupFiles: string[];
      collectCoverage: boolean;
      coverageThreshold: {
        global: {
          branches: number;
          functions: number;
          lines: number;
          statements: number;
        };
      };
    };
    vitest: {
      environment: string;
      timeout: number;
      threads: boolean;
      coverage: {
        provider: string;
        reporter: string[];
        threshold: {
          functions: number;
          lines: number;
          branches: number;
          statements: number;
        };
      };
    };
  };
  
  // Test generation settings
  generation: {
    autoGenerate: boolean;
    templates: {
      component: boolean;
      hook: boolean;
      utility: boolean;
      api: boolean;
      e2e: boolean;
    };
    naming: {
      testSuffix: string;
      specSuffix: string;
      mockPrefix: string;
    };
    patterns: {
      componentTestPattern: string;
      hookTestPattern: string;
      utilityTestPattern: string;
      e2eTestPattern: string;
    };
  };
  
  // Age-specific testing configurations
  ageGroups: {
    [key: string]: {
      minAge: number;
      maxAge: number;
      nutritionMultipliers: {
        calories: number;
        protein: number;
        carbs: number;
        hydration: number;
      };
      testScenarios: string[];
    };
  };
  
  // Food scoring algorithm test parameters
  foodTesting: {
    categories: string[];
    scoringThresholds: {
      poor: number;
      fair: number;
      good: number;
      excellent: number;
    };
    testFoods: {
      [category: string]: {
        name: string;
        expectedScore: number;
        keywords: string[];
      }[];
    };
  };
  
  // API endpoint testing configuration
  api: {
    baseURL: string;
    timeout: number;
    retries: number;
    endpoints: {
      [key: string]: {
        method: string;
        path: string;
        auth: boolean;
        testData: any[];
      };
    };
  };
  
  // Coverage monitoring
  coverage: {
    enabled: boolean;
    threshold: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
    reports: string[];
    exclude: string[];
    include: string[];
  };
  
  // CI/CD integration
  ci: {
    enabled: boolean;
    parallel: boolean;
    failOnLowCoverage: boolean;
    uploadCoverage: boolean;
    notificationChannels: string[];
  };
  
  // Logging and reporting
  logging: {
    level: string;
    console: boolean;
    file: boolean;
    directory: string;
  };
}

// Default configuration
export const defaultConfig: TestConfig = {
  paths: {
    root: process.cwd(),
    client: join(process.cwd(), 'client'),
    server: join(process.cwd(), 'server'),
    tests: {
      e2e: join(process.cwd(), 'client', 'tests', 'e2e'),
      unit: join(process.cwd(), 'client', 'tests', 'unit'),
      integration: join(process.cwd(), 'server', 'tests', 'integration'),
      fixtures: join(process.cwd(), 'client', 'tests', 'fixtures'),
      screenshots: join(process.cwd(), 'client', 'tests', 'screenshots'),
      reports: join(process.cwd(), 'test-reports'),
    },
    src: {
      components: join(process.cwd(), 'client', 'src', 'components'),
      lib: join(process.cwd(), 'client', 'src', 'lib'),
      hooks: join(process.cwd(), 'client', 'src', 'hooks'),
      pages: join(process.cwd(), 'client', 'src', 'pages'),
      utils: join(process.cwd(), 'client', 'src', 'utils'),
      types: join(process.cwd(), 'client', 'src', 'types'),
    },
    coverage: {
      output: join(process.cwd(), 'coverage'),
      reports: join(process.cwd(), 'coverage-reports'),
    },
  },
  
  execution: {
    playwright: {
      baseURL: 'http://localhost:5173',
      timeout: 30000,
      retries: 2,
      workers: 4,
      browsers: ['chromium', 'firefox', 'webkit'],
      devices: ['Desktop Chrome', 'Desktop Firefox', 'Desktop Safari', 'Pixel 5', 'iPhone 12'],
      headless: true,
      slowMo: 0,
    },
    jest: {
      testTimeout: 10000,
      setupFiles: ['<rootDir>/tests/setup.ts'],
      collectCoverage: true,
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    vitest: {
      environment: 'jsdom',
      timeout: 10000,
      threads: true,
      coverage: {
        provider: 'c8',
        reporter: ['text', 'json', 'html', 'lcov'],
        threshold: {
          functions: 80,
          lines: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  },
  
  generation: {
    autoGenerate: true,
    templates: {
      component: true,
      hook: true,
      utility: true,
      api: true,
      e2e: true,
    },
    naming: {
      testSuffix: '.test.ts',
      specSuffix: '.spec.ts',
      mockPrefix: '__mocks__/',
    },
    patterns: {
      componentTestPattern: '**/*.{test,spec}.{ts,tsx}',
      hookTestPattern: '**/hooks/**/*.{test,spec}.ts',
      utilityTestPattern: '**/utils/**/*.{test,spec}.ts',
      e2eTestPattern: '**/e2e/**/*.spec.ts',
    },
  },
  
  ageGroups: {
    'U8': {
      minAge: 6,
      maxAge: 8,
      nutritionMultipliers: {
        calories: 0.7,
        protein: 0.8,
        carbs: 0.9,
        hydration: 1.2,
      },
      testScenarios: [
        'basic_food_logging',
        'simple_scoring',
        'hydration_reminders',
        'parent_supervision'
      ],
    },
    'U10': {
      minAge: 9,
      maxAge: 10,
      nutritionMultipliers: {
        calories: 0.8,
        protein: 0.9,
        carbs: 1.0,
        hydration: 1.1,
      },
      testScenarios: [
        'meal_planning',
        'nutritional_education',
        'performance_tracking',
        'goal_setting'
      ],
    },
    'U12': {
      minAge: 11,
      maxAge: 12,
      nutritionMultipliers: {
        calories: 0.9,
        protein: 1.0,
        carbs: 1.1,
        hydration: 1.0,
      },
      testScenarios: [
        'advanced_logging',
        'nutrition_analysis',
        'team_features',
        'coach_interaction'
      ],
    },
    'U15': {
      minAge: 13,
      maxAge: 15,
      nutritionMultipliers: {
        calories: 1.1,
        protein: 1.2,
        carbs: 1.2,
        hydration: 1.0,
      },
      testScenarios: [
        'advanced_analytics',
        'performance_correlation',
        'meal_optimization',
        'competition_preparation'
      ],
    },
  },
  
  foodTesting: {
    categories: ['poor', 'fair', 'good', 'excellent'],
    scoringThresholds: {
      poor: 25,
      fair: 50,
      good: 75,
      excellent: 90,
    },
    testFoods: {
      poor: [
        {
          name: 'Candy bar with chips',
          expectedScore: 15,
          keywords: ['candy', 'sugar', 'processed', 'chips', 'artificial']
        },
        {
          name: 'Energy drink',
          expectedScore: 20,
          keywords: ['energy drink', 'caffeine', 'sugar', 'artificial']
        }
      ],
      fair: [
        {
          name: 'White bread sandwich',
          expectedScore: 45,
          keywords: ['white bread', 'processed', 'refined']
        },
        {
          name: 'Cereal with milk',
          expectedScore: 40,
          keywords: ['cereal', 'processed', 'sugar', 'milk']
        }
      ],
      good: [
        {
          name: 'Grilled chicken with rice',
          expectedScore: 80,
          keywords: ['chicken', 'lean protein', 'rice', 'grilled']
        },
        {
          name: 'Greek yogurt with berries',
          expectedScore: 85,
          keywords: ['greek yogurt', 'protein', 'berries', 'antioxidants']
        }
      ],
      excellent: [
        {
          name: 'Quinoa salad with salmon and vegetables',
          expectedScore: 95,
          keywords: ['quinoa', 'salmon', 'omega-3', 'vegetables', 'lean protein', 'complex carbs']
        },
        {
          name: 'Oatmeal with nuts and fruit',
          expectedScore: 90,
          keywords: ['oatmeal', 'fiber', 'nuts', 'healthy fats', 'fruit', 'antioxidants']
        }
      ]
    },
  },
  
  api: {
    baseURL: 'http://localhost:3001/api',
    timeout: 5000,
    retries: 3,
    endpoints: {
      auth: {
        method: 'POST',
        path: '/auth/login',
        auth: false,
        testData: [
          { email: 'test@fcinter.com', password: 'testpass123' },
          { email: 'coach@fcinter.com', password: 'coachpass123' }
        ]
      },
      foodEntry: {
        method: 'POST',
        path: '/food/entries',
        auth: true,
        testData: [
          {
            foodName: 'Grilled chicken breast',
            mealType: 'LUNCH',
            location: 'Home',
            notes: 'Post-training meal'
          }
        ]
      },
      analytics: {
        method: 'GET',
        path: '/analytics/nutrition',
        auth: true,
        testData: []
      }
    },
  },
  
  coverage: {
    enabled: true,
    threshold: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    reports: ['text', 'html', 'lcov', 'json'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/tests/**',
      '**/*.d.ts',
      '**/vite.config.ts',
      '**/tailwind.config.js',
    ],
    include: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.test.{ts,tsx}',
      '!src/**/*.spec.{ts,tsx}',
    ],
  },
  
  ci: {
    enabled: true,
    parallel: true,
    failOnLowCoverage: true,
    uploadCoverage: false,
    notificationChannels: ['github', 'slack'],
  },
  
  logging: {
    level: 'info',
    console: true,
    file: true,
    directory: join(process.cwd(), 'logs'),
  },
};

/**
 * Load configuration from environment or use defaults
 */
export function loadConfig(overrides: Partial<TestConfig> = {}): TestConfig {
  const config = { ...defaultConfig };
  
  // Apply environment-specific overrides
  if (process.env.CI) {
    config.execution.playwright.headless = true;
    config.execution.playwright.workers = 1;
    config.ci.enabled = true;
  }
  
  if (process.env.NODE_ENV === 'development') {
    config.logging.level = 'debug';
    config.execution.playwright.slowMo = 100;
  }
  
  // Apply custom overrides
  return mergeDeep(config, overrides);
}

/**
 * Deep merge utility for configuration objects
 */
function mergeDeep(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Get age group configuration by age
 */
export function getAgeGroupConfig(age: number) {
  for (const [groupName, config] of Object.entries(defaultConfig.ageGroups)) {
    if (age >= config.minAge && age <= config.maxAge) {
      return { name: groupName, ...config };
    }
  }
  
  // Default to U15 for older players
  return { name: 'U15', ...defaultConfig.ageGroups.U15 };
}

/**
 * Validate configuration
 */
export function validateConfig(config: TestConfig): string[] {
  const errors: string[] = [];
  
  // Check required paths exist
  const requiredPaths = ['root', 'client', 'server'];
  requiredPaths.forEach(path => {
    if (!config.paths[path as keyof typeof config.paths]) {
      errors.push(`Missing required path: ${path}`);
    }
  });
  
  // Validate coverage thresholds
  if (config.coverage.threshold.statements < 0 || config.coverage.threshold.statements > 100) {
    errors.push('Coverage threshold for statements must be between 0 and 100');
  }
  
  // Validate age group configurations
  Object.entries(config.ageGroups).forEach(([name, group]) => {
    if (group.minAge >= group.maxAge) {
      errors.push(`Invalid age range for group ${name}: min must be less than max`);
    }
  });
  
  return errors;
}