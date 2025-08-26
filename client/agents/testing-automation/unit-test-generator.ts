/**
 * Unit Test Generator
 * Creates unit tests for critical functions (food analysis, scoring, calculations)
 */

import { promises as fs } from 'fs';
import { join, dirname, relative, parse } from 'path';
import { TestConfig } from './config';
import { testTemplates, renderTemplate, validateTemplateVariables } from './test-templates';

export interface FunctionAnalysis {
  name: string;
  path: string;
  type: 'pure' | 'async' | 'hook' | 'class' | 'utility';
  parameters: ParameterInfo[];
  returnType: string;
  isExported: boolean;
  dependencies: string[];
  complexity: 'low' | 'medium' | 'high';
  testPriority: 'low' | 'medium' | 'high' | 'critical';
  ageSpecific: boolean;
  nutritionRelated: boolean;
  categories: string[];
}

export interface ParameterInfo {
  name: string;
  type: string;
  required: boolean;
  default?: string;
}

export interface TestCase {
  name: string;
  description: string;
  input: any;
  expectedOutput: any;
  shouldThrow?: boolean;
  errorMessage?: string;
  category: 'happy-path' | 'edge-case' | 'error-case' | 'boundary' | 'age-specific';
}

export class UnitTestGenerator {
  constructor(private config: TestConfig) {}

  /**
   * Generate unit tests for a specific function
   */
  async generateFunctionTests(functionPath: string, functionName: string): Promise<string> {
    try {
      const analysis = await this.analyzeFunction(functionPath, functionName);
      
      if (!analysis) {
        throw new Error(`Could not analyze function ${functionName} in ${functionPath}`);
      }

      const testCases = this.generateTestCases(analysis);
      const testCode = this.generateTestFileCode(analysis, testCases);
      
      // Write test file
      const testFileName = `${parse(functionPath).name}.test.ts`;
      const testPath = join(this.config.paths.tests.unit, testFileName);
      
      await this.ensureDirectory(dirname(testPath));
      await fs.writeFile(testPath, testCode);
      
      return testPath;
    } catch (error) {
      throw new Error(`Failed to generate function tests: ${error.message}`);
    }
  }

  /**
   * Generate tests for all food analysis functions
   */
  async generateFoodAnalysisTests(): Promise<string[]> {
    const testPaths: string[] = [];
    
    // Food analyzer functions
    const foodAnalyzerPath = join(this.config.paths.src.lib, 'food-analyzer.ts');
    const foodAnalysisFunctions = [
      'analyzeFoodQuality',
      'getFoodRecommendations',
      'calculateNutritionScore',
      'getAgeSpecificBonus',
      'analyzeTimingOptimal'
    ];
    
    for (const funcName of foodAnalysisFunctions) {
      try {
        const testPath = await this.generateFunctionTests(foodAnalyzerPath, funcName);
        testPaths.push(testPath);
      } catch (error) {
        console.warn(`Failed to generate tests for ${funcName}:`, error.message);
      }
    }
    
    // Food database functions
    const foodDatabasePath = join(this.config.paths.src.lib, 'food-database.ts');
    const databaseFunctions = [
      'searchFoodsByKeywords',
      'calculateFoodScore',
      'getFoodCategory',
      'analyzeFoodKeywords'
    ];
    
    for (const funcName of databaseFunctions) {
      try {
        const testPath = await this.generateFunctionTests(foodDatabasePath, funcName);
        testPaths.push(testPath);
      } catch (error) {
        console.warn(`Failed to generate tests for ${funcName}:`, error.message);
      }
    }
    
    return testPaths;
  }

  /**
   * Generate tests for utility functions
   */
  async generateUtilityTests(): Promise<string[]> {
    const testPaths: string[] = [];
    
    try {
      const utilsPath = this.config.paths.src.utils;
      const utilFiles = await fs.readdir(utilsPath);
      
      for (const file of utilFiles.filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'))) {
        const filePath = join(utilsPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const functions = this.extractExportedFunctions(content);
        
        for (const funcName of functions) {
          try {
            const testPath = await this.generateFunctionTests(filePath, funcName);
            testPaths.push(testPath);
          } catch (error) {
            console.warn(`Failed to generate tests for ${funcName} in ${file}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to scan utility functions:', error.message);
    }
    
    return testPaths;
  }

  /**
   * Generate tests for React hooks
   */
  async generateHookTests(): Promise<string[]> {
    const testPaths: string[] = [];
    
    try {
      const hooksPath = this.config.paths.src.hooks;
      const hookFiles = await fs.readdir(hooksPath);
      
      for (const file of hookFiles.filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'))) {
        const filePath = join(hooksPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        if (content.includes('export') && content.includes('use')) {
          const hookName = this.extractHookName(content);
          const testPath = await this.generateHookTestFile(filePath, hookName);
          testPaths.push(testPath);
        }
      }
    } catch (error) {
      console.warn('Failed to scan hook functions:', error.message);
    }
    
    return testPaths;
  }

  /**
   * Generate comprehensive food scoring algorithm tests
   */
  async generateFoodScoringTests(): Promise<string> {
    const testCode = `/**
 * Food Scoring Algorithm Comprehensive Tests
 * Generated by Testing Automation Agent
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeFoodQuality, getFoodRecommendations } from '../lib/food-analyzer';
import { getAgeSpecificBonus } from '../lib/food-data/age-specific';

describe('Food Scoring Algorithm Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Quality Scoring Accuracy', () => {
    const testFoods = ${JSON.stringify(this.config.foodTesting.testFoods, null, 6)};

    Object.entries(testFoods).forEach(([category, foods]) => {
      describe(\`\${category.toUpperCase()} Quality Foods\`, () => {
        foods.forEach(food => {
          it(\`should score "\${food.name}" as \${category}\`, () => {
            const result = analyzeFoodQuality(food.name, 12);
            
            expect(result.score).toBeCloseTo(food.expectedScore, 10);
            expect(result.quality).toBe(category);
            expect(result.detectedKeywords).toEqual(expect.arrayContaining(food.keywords));
          });
        });
      });
    });
  });

  describe('Age-Specific Scoring Adjustments', () => {
    const testFood = 'Grilled chicken with rice and vegetables';
    
    ${Object.entries(this.config.ageGroups).map(([ageGroup, config]) => `
    it('should apply ${ageGroup} multipliers correctly', () => {
      const age = ${Math.floor((config.minAge + config.maxAge) / 2)};
      const result = analyzeFoodQuality(testFood, age);
      
      expect(result.ageGroup).toBe('${ageGroup}');
      expect(result.ageAdjustments).toBeDefined();
      expect(result.ageAdjustments.calorieMultiplier).toBeCloseTo(${config.nutritionMultipliers.calories}, 2);
      expect(result.ageAdjustments.proteinMultiplier).toBeCloseTo(${config.nutritionMultipliers.protein}, 2);
      expect(result.ageAdjustments.carbMultiplier).toBeCloseTo(${config.nutritionMultipliers.carbs}, 2);
      expect(result.ageAdjustments.hydrationMultiplier).toBeCloseTo(${config.nutritionMultipliers.hydration}, 2);
    });`).join('\n    ')}
  });

  describe('Keyword Detection Accuracy', () => {
    it('should detect protein keywords correctly', () => {
      const proteinFoods = [
        'Grilled chicken breast',
        'Greek yogurt with berries',
        'Salmon fillet',
        'Lean beef steak',
        'Quinoa salad',
        'Eggs and toast'
      ];

      proteinFoods.forEach(food => {
        const result = analyzeFoodQuality(food, 12);
        expect(result.nutrients.protein).toBeGreaterThan(0);
        expect(result.detectedKeywords).toEqual(expect.arrayContaining(['protein']));
      });
    });

    it('should detect complex carbohydrate keywords correctly', () => {
      const carbFoods = [
        'Brown rice with vegetables',
        'Oatmeal with fruit',
        'Sweet potato fries',
        'Quinoa bowl',
        'Whole grain bread'
      ];

      carbFoods.forEach(food => {
        const result = analyzeFoodQuality(food, 12);
        expect(result.nutrients.carbohydrates).toBeGreaterThan(0);
        expect(result.detectedKeywords).toEqual(expect.arrayContaining(['complex carbs']));
      });
    });

    it('should detect healthy fat keywords correctly', () => {
      const fatFoods = [
        'Avocado toast',
        'Salmon with nuts',
        'Olive oil drizzled salad',
        'Almond butter sandwich'
      ];

      fatFoods.forEach(food => {
        const result = analyzeFoodQuality(food, 12);
        expect(result.nutrients.healthyFats).toBeGreaterThan(0);
        expect(result.detectedKeywords).toEqual(expect.arrayContaining(['healthy fats']));
      });
    });

    it('should detect hydration keywords correctly', () => {
      const hydrationFoods = [
        'Watermelon slices',
        'Cucumber salad',
        'Sports drink',
        'Coconut water',
        'Fresh fruit smoothie'
      ];

      hydrationFoods.forEach(food => {
        const result = analyzeFoodQuality(food, 12);
        expect(result.hydrationScore).toBeGreaterThan(60);
        expect(result.detectedKeywords).toEqual(expect.arrayContaining(['hydration']));
      });
    });
  });

  describe('Meal Timing Optimization', () => {
    const timingTests = [
      {
        food: 'Banana with oats',
        timing: 'PRE_TRAINING',
        expectedScore: 85,
        expectedAdvice: 'quick energy'
      },
      {
        food: 'Chocolate milk with protein',
        timing: 'POST_TRAINING',
        expectedScore: 90,
        expectedAdvice: 'recovery'
      },
      {
        food: 'Pasta with lean protein',
        timing: 'MATCH_DAY',
        expectedScore: 80,
        expectedAdvice: 'sustained energy'
      },
      {
        food: 'Light salad',
        timing: 'EVENING',
        expectedScore: 70,
        expectedAdvice: 'light digestion'
      }
    ];

    timingTests.forEach(test => {
      it(\`should optimize \${test.food} for \${test.timing}\`, () => {
        const result = analyzeFoodQuality(test.food, 12, test.timing);
        
        expect(result.timingScore).toBeGreaterThanOrEqual(test.expectedScore);
        expect(result.timingRecommendations).toEqual(
          expect.arrayContaining([expect.stringContaining(test.expectedAdvice)])
        );
      });
    });
  });

  describe('Performance Impact Analysis', () => {
    it('should predict positive performance impact for excellent foods', () => {
      const excellentFoods = [
        'Quinoa salad with salmon and vegetables',
        'Greek yogurt with berries and nuts',
        'Grilled chicken with sweet potato'
      ];

      excellentFoods.forEach(food => {
        const result = analyzeFoodQuality(food, 12);
        expect(result.performanceImpact).toBe('positive');
        expect(result.energyLevel).toBe('sustained');
        expect(result.focusLevel).toBe('high');
      });
    });

    it('should warn about negative performance impact for poor foods', () => {
      const poorFoods = [
        'Candy bar with chips',
        'Energy drink with cookies',
        'Fast food burger and fries'
      ];

      poorFoods.forEach(food => {
        const result = analyzeFoodQuality(food, 12);
        expect(result.performanceImpact).toBe('negative');
        expect(result.warnings).toEqual(
          expect.arrayContaining([expect.stringContaining('performance')])
        );
      });
    });
  });

  describe('Boundary Value Testing', () => {
    it('should handle minimum score boundary (0)', () => {
      const result = analyzeFoodQuality('', 12);
      expect(result.score).toBe(0);
      expect(result.quality).toBe('poor');
    });

    it('should handle maximum score boundary (100)', () => {
      const perfectFood = 'Organic quinoa salad with wild salmon, avocado, berries, nuts, and olive oil';
      const result = analyzeFoodQuality(perfectFood, 12);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle age boundaries', () => {
      const testFood = 'Grilled chicken with rice';
      
      // Test minimum age
      const minResult = analyzeFoodQuality(testFood, 6);
      expect(minResult.ageGroup).toBe('U8');
      
      // Test maximum age
      const maxResult = analyzeFoodQuality(testFood, 15);
      expect(maxResult.ageGroup).toBe('U15');
      
      // Test age boundary transitions
      const u8Result = analyzeFoodQuality(testFood, 8);
      const u10Result = analyzeFoodQuality(testFood, 9);
      expect(u8Result.ageGroup).toBe('U8');
      expect(u10Result.ageGroup).toBe('U10');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(() => analyzeFoodQuality(null as any, 12)).not.toThrow();
      expect(() => analyzeFoodQuality(undefined as any, 12)).not.toThrow();
      expect(() => analyzeFoodQuality('test food', null as any)).not.toThrow();
    });

    it('should handle empty string inputs', () => {
      const result = analyzeFoodQuality('', 12);
      expect(result).toBeDefined();
      expect(result.score).toBe(0);
      expect(result.quality).toBe('poor');
    });

    it('should handle very long food names', () => {
      const longFoodName = 'A'.repeat(1000);
      expect(() => analyzeFoodQuality(longFoodName, 12)).not.toThrow();
    });

    it('should handle special characters in food names', () => {
      const specialFoods = [
        'Crème brûlée',
        'Jalapeño peppers',
        'Açaí bowl',
        'Food with émojis 🍎🥗',
        'Food-with-dashes',
        'Food_with_underscores'
      ];

      specialFoods.forEach(food => {
        expect(() => analyzeFoodQuality(food, 12)).not.toThrow();
      });
    });

    it('should handle invalid age values gracefully', () => {
      const testFood = 'Test food';
      
      expect(() => analyzeFoodQuality(testFood, -1)).not.toThrow();
      expect(() => analyzeFoodQuality(testFood, 0)).not.toThrow();
      expect(() => analyzeFoodQuality(testFood, 100)).not.toThrow();
      expect(() => analyzeFoodQuality(testFood, NaN)).not.toThrow();
      expect(() => analyzeFoodQuality(testFood, Infinity)).not.toThrow();
    });
  });

  describe('Performance Requirements', () => {
    it('should analyze food within performance threshold', () => {
      const startTime = performance.now();
      
      analyzeFoodQuality('Complex food with many ingredients and keywords', 12);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(10); // 10ms max
    });

    it('should handle batch analysis efficiently', () => {
      const foods = Array.from({ length: 100 }, (_, i) => \`Test food \${i}\`);
      
      const startTime = performance.now();
      
      foods.forEach(food => {
        analyzeFoodQuality(food, 12);
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / foods.length;
      
      expect(averageTime).toBeLessThan(5); // 5ms average per food
    });
  });

  describe('Consistency and Determinism', () => {
    it('should return consistent results for identical inputs', () => {
      const testFood = 'Grilled chicken with rice';
      const age = 12;
      
      const result1 = analyzeFoodQuality(testFood, age);
      const result2 = analyzeFoodQuality(testFood, age);
      const result3 = analyzeFoodQuality(testFood, age);
      
      expect(result1.score).toBe(result2.score);
      expect(result2.score).toBe(result3.score);
      expect(result1.quality).toBe(result2.quality);
      expect(result2.quality).toBe(result3.quality);
    });

    it('should be case-insensitive for food names', () => {
      const lowerCase = analyzeFoodQuality('grilled chicken', 12);
      const upperCase = analyzeFoodQuality('GRILLED CHICKEN', 12);
      const mixedCase = analyzeFoodQuality('Grilled Chicken', 12);
      
      expect(lowerCase.score).toBe(upperCase.score);
      expect(upperCase.score).toBe(mixedCase.score);
    });
  });

  describe('Integration with Age-Specific Data', () => {
    it('should integrate properly with age-specific bonus calculations', () => {
      const testFood = 'Greek yogurt with berries';
      
      Object.entries(${JSON.stringify(this.config.ageGroups)}).forEach(([ageGroup, config]) => {
        const age = Math.floor((config.minAge + config.maxAge) / 2);
        const result = analyzeFoodQuality(testFood, age);
        
        expect(result.ageGroup).toBe(ageGroup);
        expect(result.ageAdjustments).toBeDefined();
        
        // Verify bonus calculations are applied
        if (config.nutritionMultipliers.protein > 1) {
          expect(result.ageAdjustments.proteinBonus).toBeGreaterThan(0);
        }
        
        if (config.nutritionMultipliers.hydration > 1) {
          expect(result.ageAdjustments.hydrationBonus).toBeGreaterThan(0);
        }
      });
    });
  });
});`;

    const testPath = join(this.config.paths.tests.unit, 'food-scoring-comprehensive.test.ts');
    await this.ensureDirectory(dirname(testPath));
    await fs.writeFile(testPath, testCode);
    
    return testPath;
  }

  /**
   * Generate tests for authentication utilities
   */
  async generateAuthUtilTests(): Promise<string> {
    const testCode = `/**
 * Authentication Utilities Tests
 * Generated by Testing Automation Agent
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateEmail, validatePassword, hashPassword, verifyPassword } from '../utils/authUtils';

describe('Authentication Utilities Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'user@example.com',
        'player@fcinter.com',
        'coach.name@football.org',
        'test.email+tag@domain.co.uk',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user.example.com',
        'user@.com',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email as any)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validateEmail('a@b.co')).toBe(true); // Minimal valid email
      expect(validateEmail('very.long.email.address@very.long.domain.name.com')).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'SecurePass123!',
        'FootballPlayer2024@',
        'MyStr0ngP@ssw0rd',
        'Complex!Password123'
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.strength).toBe('strong');
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        '12345678'
      ];

      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.strength).toBe('weak');
      });
    });

    it('should validate medium strength passwords', () => {
      const mediumPasswords = [
        'Password123',
        'football2024',
        'UserName456'
      ];

      mediumPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.strength).toBe('medium');
      });
    });

    it('should require minimum length', () => {
      const shortPasswords = ['12345', 'abc', 'xy'];
      
      shortPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be at least 8 characters long');
      });
    });

    it('should provide helpful validation messages', () => {
      const result = validatePassword('weakpass');
      expect(result.errors).toEqual(expect.arrayContaining([
        expect.stringContaining('uppercase'),
        expect.stringContaining('number'),
        expect.stringContaining('special character')
      ]));
    });
  });

  describe('Password Hashing and Verification', () => {
    it('should hash passwords securely', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 characters
    });

    it('should verify correct passwords', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should handle edge cases in password verification', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      // Test with null/undefined
      expect(await verifyPassword(null as any, hash)).toBe(false);
      expect(await verifyPassword(password, null as any)).toBe(false);
      expect(await verifyPassword(undefined as any, hash)).toBe(false);
      expect(await verifyPassword(password, undefined as any)).toBe(false);
      
      // Test with empty strings
      expect(await verifyPassword('', hash)).toBe(false);
      expect(await verifyPassword(password, '')).toBe(false);
    });

    it('should handle different password lengths', async () => {
      const passwords = [
        'Short1!',
        'MediumLength123!',
        'VeryLongPasswordWithManyCharacters123!@#$%'
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(true);
      }
    });

    it('should be consistent across multiple hash operations', async () => {
      const password = 'ConsistencyTest123!';
      
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      // Hashes should be different (due to salt)
      expect(hash1).not.toBe(hash2);
      
      // But both should verify the same password
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('Performance Requirements', () => {
    it('should hash passwords within reasonable time', async () => {
      const password = 'PerformanceTest123!';
      const startTime = performance.now();
      
      await hashPassword(password);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should verify passwords quickly', async () => {
      const password = 'VerificationTest123!';
      const hash = await hashPassword(password);
      
      const startTime = performance.now();
      await verifyPassword(password, hash);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // Should complete within 100ms
    });
  });
});`;

    const testPath = join(this.config.paths.tests.unit, 'auth-utils.test.ts');
    await this.ensureDirectory(dirname(testPath));
    await fs.writeFile(testPath, testCode);
    
    return testPath;
  }

  /**
   * Analyze a function to understand its structure and generate appropriate tests
   */
  private async analyzeFunction(filePath: string, functionName: string): Promise<FunctionAnalysis | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract function information
      const functionMatch = content.match(
        new RegExp(`export\\s+(?:const|function)\\s+${functionName}\\s*[=:]?\\s*([^{]+)\\{([^}]+)\\}`, 's')
      );
      
      if (!functionMatch) {
        return null;
      }
      
      const parameters = this.extractParameters(functionMatch[1]);
      const returnType = this.extractReturnType(content, functionName);
      const dependencies = this.extractFunctionDependencies(content);
      
      return {
        name: functionName,
        path: filePath,
        type: this.determineFunctionType(content, functionName),
        parameters,
        returnType,
        isExported: content.includes(`export`) && content.includes(functionName),
        dependencies,
        complexity: this.calculateComplexity(functionMatch[2]),
        testPriority: this.calculateTestPriority(functionName, filePath),
        ageSpecific: content.includes('age') || content.includes('Age'),
        nutritionRelated: content.includes('nutrition') || content.includes('food') || content.includes('Food'),
        categories: this.categorizeFunction(functionName, filePath)
      };
    } catch (error) {
      console.error(`Error analyzing function ${functionName}:`, error);
      return null;
    }
  }

  private extractParameters(signature: string): ParameterInfo[] {
    const params: ParameterInfo[] = [];
    const paramMatch = signature.match(/\(([^)]*)\)/);
    
    if (paramMatch && paramMatch[1]) {
      const paramString = paramMatch[1];
      const paramParts = paramString.split(',').map(p => p.trim());
      
      paramParts.forEach(param => {
        if (param) {
          const parts = param.split(':').map(p => p.trim());
          const name = parts[0].replace(/[{}]/, ''); // Remove destructuring syntax
          const type = parts[1] || 'any';
          const required = !name.includes('?') && !param.includes('=');
          const defaultValue = param.includes('=') ? param.split('=')[1].trim() : undefined;
          
          params.push({
            name: name.replace('?', ''),
            type,
            required,
            default: defaultValue
          });
        }
      });
    }
    
    return params;
  }

  private extractReturnType(content: string, functionName: string): string {
    const returnMatch = content.match(
      new RegExp(`${functionName}[^:]*:\\s*([^=>{]+)(?:=>|{)`)
    );
    
    if (returnMatch) {
      return returnMatch[1].trim();
    }
    
    // Try to infer from return statements
    const functionBlock = this.extractFunctionBlock(content, functionName);
    if (functionBlock.includes('return true') || functionBlock.includes('return false')) {
      return 'boolean';
    }
    if (functionBlock.includes('return ') && functionBlock.includes('number')) {
      return 'number';
    }
    if (functionBlock.includes('return ') && functionBlock.includes('string')) {
      return 'string';
    }
    
    return 'any';
  }

  private extractFunctionBlock(content: string, functionName: string): string {
    const startIndex = content.indexOf(functionName);
    if (startIndex === -1) return '';
    
    let braceCount = 0;
    let inFunction = false;
    let functionContent = '';
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      
      if (char === '{') {
        braceCount++;
        inFunction = true;
      } else if (char === '}') {
        braceCount--;
      }
      
      if (inFunction) {
        functionContent += char;
      }
      
      if (inFunction && braceCount === 0) {
        break;
      }
    }
    
    return functionContent;
  }

  private extractFunctionDependencies(content: string): string[] {
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

  private determineFunctionType(content: string, functionName: string): FunctionAnalysis['type'] {
    const functionBlock = this.extractFunctionBlock(content, functionName);
    
    if (functionBlock.includes('async') || functionBlock.includes('await') || functionBlock.includes('Promise')) {
      return 'async';
    }
    
    if (functionName.startsWith('use') && content.includes('useState') || content.includes('useEffect')) {
      return 'hook';
    }
    
    if (content.includes('class ') && content.includes(`${functionName}(`)) {
      return 'class';
    }
    
    if (!functionBlock.includes('fetch') && !functionBlock.includes('api') && !functionBlock.includes('database')) {
      return 'pure';
    }
    
    return 'utility';
  }

  private calculateComplexity(functionBody: string): FunctionAnalysis['complexity'] {
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(functionBody);
    
    if (cyclomaticComplexity <= 5) return 'low';
    if (cyclomaticComplexity <= 10) return 'medium';
    return 'high';
  }

  private calculateCyclomaticComplexity(code: string): number {
    let complexity = 1; // Base complexity
    
    // Count decision points
    const decisionPoints = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\?\s*:/g, // Ternary operator
      /&&/g,
      /\|\|/g
    ];
    
    decisionPoints.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  private calculateTestPriority(functionName: string, filePath: string): FunctionAnalysis['testPriority'] {
    // Critical functions that must be thoroughly tested
    const criticalFunctions = [
      'analyzeFoodQuality',
      'calculateNutritionScore',
      'getFoodRecommendations',
      'validateEmail',
      'validatePassword',
      'hashPassword',
      'verifyPassword'
    ];
    
    if (criticalFunctions.includes(functionName)) {
      return 'critical';
    }
    
    // High priority for food analysis and auth functions
    if (filePath.includes('food-analyzer') || filePath.includes('auth')) {
      return 'high';
    }
    
    // Medium priority for utilities
    if (filePath.includes('utils') || filePath.includes('lib')) {
      return 'medium';
    }
    
    return 'low';
  }

  private categorizeFunction(functionName: string, filePath: string): string[] {
    const categories: string[] = [];
    
    if (filePath.includes('food') || functionName.includes('food') || functionName.includes('nutrition')) {
      categories.push('nutrition');
    }
    
    if (filePath.includes('auth') || functionName.includes('auth') || functionName.includes('login')) {
      categories.push('authentication');
    }
    
    if (functionName.includes('validate')) {
      categories.push('validation');
    }
    
    if (functionName.includes('calculate') || functionName.includes('score')) {
      categories.push('calculation');
    }
    
    if (functionName.includes('age') || functionName.includes('Age')) {
      categories.push('age-specific');
    }
    
    return categories;
  }

  private generateTestCases(analysis: FunctionAnalysis): TestCase[] {
    const testCases: TestCase[] = [];
    
    // Generate happy path tests
    testCases.push(...this.generateHappyPathTests(analysis));
    
    // Generate edge case tests
    testCases.push(...this.generateEdgeCaseTests(analysis));
    
    // Generate error case tests
    testCases.push(...this.generateErrorCaseTests(analysis));
    
    // Generate boundary tests
    testCases.push(...this.generateBoundaryTests(analysis));
    
    // Generate age-specific tests if applicable
    if (analysis.ageSpecific) {
      testCases.push(...this.generateAgeSpecificTests(analysis));
    }
    
    return testCases;
  }

  private generateHappyPathTests(analysis: FunctionAnalysis): TestCase[] {
    const tests: TestCase[] = [];
    
    if (analysis.nutritionRelated) {
      tests.push({
        name: 'should analyze excellent food correctly',
        description: 'Test with high-quality food',
        input: { foodName: 'Quinoa salad with salmon', age: 12 },
        expectedOutput: { score: expect.any(Number), quality: 'excellent' },
        category: 'happy-path'
      });
      
      tests.push({
        name: 'should analyze good food correctly',
        description: 'Test with good-quality food',
        input: { foodName: 'Grilled chicken with rice', age: 12 },
        expectedOutput: { score: expect.any(Number), quality: 'good' },
        category: 'happy-path'
      });
    }
    
    if (analysis.categories.includes('authentication')) {
      tests.push({
        name: 'should validate correct email',
        description: 'Test with valid email format',
        input: 'user@fcinter.com',
        expectedOutput: true,
        category: 'happy-path'
      });
      
      tests.push({
        name: 'should validate strong password',
        description: 'Test with strong password',
        input: 'SecurePass123!',
        expectedOutput: { isValid: true, strength: 'strong' },
        category: 'happy-path'
      });
    }
    
    return tests;
  }

  private generateEdgeCaseTests(analysis: FunctionAnalysis): TestCase[] {
    const tests: TestCase[] = [];
    
    // Empty string tests
    tests.push({
      name: 'should handle empty string input',
      description: 'Test with empty string',
      input: '',
      expectedOutput: analysis.returnType.includes('boolean') ? false : null,
      category: 'edge-case'
    });
    
    // Null/undefined tests
    tests.push({
      name: 'should handle null input',
      description: 'Test with null value',
      input: null,
      expectedOutput: analysis.returnType.includes('boolean') ? false : null,
      category: 'edge-case'
    });
    
    tests.push({
      name: 'should handle undefined input',
      description: 'Test with undefined value',
      input: undefined,
      expectedOutput: analysis.returnType.includes('boolean') ? false : null,
      category: 'edge-case'
    });
    
    return tests;
  }

  private generateErrorCaseTests(analysis: FunctionAnalysis): TestCase[] {
    const tests: TestCase[] = [];
    
    if (analysis.type === 'async') {
      tests.push({
        name: 'should handle network errors',
        description: 'Test error handling for network failures',
        input: { simulateError: true },
        expectedOutput: null,
        shouldThrow: true,
        errorMessage: 'Network error',
        category: 'error-case'
      });
    }
    
    if (analysis.categories.includes('validation')) {
      tests.push({
        name: 'should reject invalid input format',
        description: 'Test with malformed input',
        input: 'invalid-format',
        expectedOutput: false,
        category: 'error-case'
      });
    }
    
    return tests;
  }

  private generateBoundaryTests(analysis: FunctionAnalysis): TestCase[] {
    const tests: TestCase[] = [];
    
    if (analysis.nutritionRelated) {
      tests.push({
        name: 'should handle minimum age boundary',
        description: 'Test with minimum valid age',
        input: { foodName: 'Test food', age: 6 },
        expectedOutput: { ageGroup: 'U8' },
        category: 'boundary'
      });
      
      tests.push({
        name: 'should handle maximum age boundary',
        description: 'Test with maximum valid age',
        input: { foodName: 'Test food', age: 15 },
        expectedOutput: { ageGroup: 'U15' },
        category: 'boundary'
      });
    }
    
    return tests;
  }

  private generateAgeSpecificTests(analysis: FunctionAnalysis): TestCase[] {
    const tests: TestCase[] = [];
    
    Object.entries(this.config.ageGroups).forEach(([ageGroup, config]) => {
      const testAge = Math.floor((config.minAge + config.maxAge) / 2);
      
      tests.push({
        name: `should handle ${ageGroup} age group correctly`,
        description: `Test with ${ageGroup} player age`,
        input: { foodName: 'Test food', age: testAge },
        expectedOutput: { ageGroup },
        category: 'age-specific'
      });
    });
    
    return tests;
  }

  private generateTestFileCode(analysis: FunctionAnalysis, testCases: TestCase[]): string {
    const template = analysis.type === 'hook' ? 
      testTemplates.hook.template : 
      testTemplates.foodAnalysis.template;
    
    const variables = {
      FUNCTION_NAME: analysis.name,
      FUNCTION_PATH: relative(dirname(join(this.config.paths.tests.unit, 'dummy')), analysis.path),
      AGE_PARAM: '12',
      ADDITIONAL_IMPORTS: this.generateTestImports(analysis),
      ERROR_MOCK_SETUP: 'vi.mocked(apiCall).mockRejectedValue(new Error("Test error"));',
      ERROR_TRIGGER: 'act(() => { result.current.triggerError(); });',
      CLEANUP_VERIFICATION: 'expect(mockCleanup).toHaveBeenCalled();',
      CANCELLATION_VERIFICATION: 'expect(mockCancel).toHaveBeenCalled();',
      HOOK_NAME: analysis.name,
      HOOK_PATH: relative(dirname(join(this.config.paths.tests.unit, 'dummy')), analysis.path),
      DEFAULT_PARAMS: this.generateDefaultParams(analysis),
      CUSTOM_PARAMS: this.generateCustomParams(analysis),
      EXPECTED_INITIAL_STATE: this.generateInitialState(analysis),
      STATE_PROPERTY: 'data',
      UPDATE_FUNCTION: 'update',
      UPDATE_VALUE: 'newValue',
      EXPECTED_VALUE: 'expectedValue',
      EXPECTED_UPDATED_VALUE: 'newValue',
      ASYNC_FUNCTION: 'fetchData',
      ASYNC_PARAMS: '{}',
      RESULT_PROPERTY: 'data',
      ADDITIONAL_TESTS: this.generateAdditionalTestsCode(testCases)
    };
    
    return renderTemplate(template, variables);
  }

  private generateTestImports(analysis: FunctionAnalysis): string {
    const imports = analysis.dependencies
      .map(dep => `import { ${dep} } from '${dep}';`)
      .join('\n');
    
    if (analysis.type === 'hook') {
      return imports + '\nimport { renderHook, act } from \'@testing-library/react-hooks\';';
    }
    
    return imports;
  }

  private generateDefaultParams(analysis: FunctionAnalysis): string {
    return analysis.parameters
      .filter(p => p.required)
      .map(p => `${p.name}: ${this.getDefaultTestValue(p.type)}`)
      .join(', ');
  }

  private generateCustomParams(analysis: FunctionAnalysis): string {
    return analysis.parameters
      .map(p => `${p.name}: ${this.getCustomTestValue(p.type)}`)
      .join(', ');
  }

  private generateInitialState(analysis: FunctionAnalysis): string {
    if (analysis.type === 'hook') {
      return `
        data: null,
        loading: false,
        error: null
      `;
    }
    return '{}';
  }

  private getDefaultTestValue(type: string): string {
    if (type.includes('string')) return "'test'";
    if (type.includes('number')) return '0';
    if (type.includes('boolean')) return 'false';
    if (type.includes('[]')) return '[]';
    return '{}';
  }

  private getCustomTestValue(type: string): string {
    if (type.includes('string')) return "'custom'";
    if (type.includes('number')) return '42';
    if (type.includes('boolean')) return 'true';
    if (type.includes('[]')) return '[1, 2, 3]';
    return '{ custom: true }';
  }

  private generateAdditionalTestsCode(testCases: TestCase[]): string {
    return testCases
      .map(testCase => `
  it('${testCase.name}', ${testCase.shouldThrow ? 'async ' : ''}() => {
    ${testCase.shouldThrow ? 'expect(() => ' : ''}
    const result = ${testCase.category === 'age-specific' ? 'await ' : ''}functionUnderTest(${JSON.stringify(testCase.input)});
    ${testCase.shouldThrow ? ').toThrow();' : ''}
    
    ${!testCase.shouldThrow ? `expect(result).toEqual(${JSON.stringify(testCase.expectedOutput)});` : ''}
  });`)
      .join('\n  ');
  }

  private extractExportedFunctions(content: string): string[] {
    const functions: string[] = [];
    
    // Match exported functions
    const exportMatches = content.match(/export\s+(?:const|function)\s+(\w+)/g) || [];
    exportMatches.forEach(match => {
      const funcMatch = match.match(/export\s+(?:const|function)\s+(\w+)/);
      if (funcMatch) {
        functions.push(funcMatch[1]);
      }
    });
    
    return functions;
  }

  private extractHookName(content: string): string {
    const hookMatch = content.match(/export\s+(?:const|function)\s+(use\w+)/);
    return hookMatch ? hookMatch[1] : 'useUnknownHook';
  }

  private async generateHookTestFile(filePath: string, hookName: string): Promise<string> {
    const analysis = await this.analyzeFunction(filePath, hookName);
    if (!analysis) {
      throw new Error(`Could not analyze hook ${hookName}`);
    }

    const template = testTemplates.hook.template;
    const variables = {
      HOOK_NAME: hookName,
      HOOK_PATH: relative(dirname(join(this.config.paths.tests.unit, 'dummy')), filePath),
      DEFAULT_PARAMS: '{}',
      CUSTOM_PARAMS: '{ customOption: true }',
      EXPECTED_INITIAL_STATE: 'data: null, loading: false, error: null',
      STATE_PROPERTY: 'data',
      UPDATE_FUNCTION: 'updateData',
      UPDATE_VALUE: "'new value'",
      EXPECTED_VALUE: "'new value'",
      EXPECTED_UPDATED_VALUE: "'new value'",
      ASYNC_FUNCTION: 'fetchData',
      ASYNC_PARAMS: '{}',
      RESULT_PROPERTY: 'data',
      ERROR_MOCK_SETUP: '',
      ERROR_TRIGGER: '',
      CLEANUP_VERIFICATION: '',
      CANCELLATION_VERIFICATION: '',
      BEFORE_EACH_SETUP: '',
      AFTER_EACH_CLEANUP: '',
      ADDITIONAL_TESTS: ''
    };

    const testCode = renderTemplate(template, variables);
    
    const testFileName = `${parse(filePath).name}.test.ts`;
    const testPath = join(this.config.paths.tests.unit, testFileName);
    
    await this.ensureDirectory(dirname(testPath));
    await fs.writeFile(testPath, testCode);
    
    return testPath;
  }

  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Generate all unit tests for the application
   */
  async generateAllUnitTests(): Promise<{
    foodAnalysis: string[];
    utilities: string[];
    hooks: string[];
    foodScoring: string;
    authUtils: string;
  }> {
    const results = {
      foodAnalysis: await this.generateFoodAnalysisTests(),
      utilities: await this.generateUtilityTests(),
      hooks: await this.generateHookTests(),
      foodScoring: await this.generateFoodScoringTests(),
      authUtils: await this.generateAuthUtilTests()
    };

    console.log('✅ Generated all unit tests successfully!');
    console.log('Generated test files:', [
      ...results.foodAnalysis,
      ...results.utilities,
      ...results.hooks,
      results.foodScoring,
      results.authUtils
    ]);

    return results;
  }
}