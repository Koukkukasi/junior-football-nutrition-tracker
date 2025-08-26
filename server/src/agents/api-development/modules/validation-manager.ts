import { Request, Response, NextFunction } from 'express';
import { ApiAgentConfig } from '../config/agent.config';
import { logger } from '../utils/logger';

export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'enum' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string | RegExp;
  values?: any[];
  custom?: (value: any) => boolean | string;
  sanitize?: boolean;
  transform?: (value: any) => any;
}

export interface ValidationSchema {
  [field: string]: ValidationRule | ValidationSchema;
}

export class ValidationManager {
  private config: ApiAgentConfig;
  private customRules: Map<string, ValidationRule> = new Map();
  private sanitizers: Map<string, Function> = new Map();

  constructor(config: ApiAgentConfig) {
    this.config = config;
    this.initializeDefaultSanitizers();
  }

  createValidator(schema: ValidationSchema): Function {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors: any[] = [];
      const data = { ...req.body, ...req.params, ...req.query };
      
      // Validate each field
      for (const [field, rule] of Object.entries(schema)) {
        const value = this.getNestedValue(data, field);
        const validationResult = this.validateField(field, value, rule as ValidationRule);
        
        if (validationResult !== true) {
          errors.push({
            field,
            message: validationResult,
            value: value
          });
        } else if (this.config.validation.sanitizeInput && (rule as ValidationRule).sanitize !== false) {
          // Sanitize and transform the value
          const sanitized = this.sanitizeValue(value, rule as ValidationRule);
          this.setNestedValue(req.body, field, sanitized);
        }
      }
      
      if (errors.length > 0) {
        return res.status(422).json({
          error: {
            status: 422,
            message: 'Validation failed',
            details: errors
          }
        });
      }
      
      next();
    };
  }

  validateField(field: string, value: any, rule: ValidationRule): boolean | string {
    // Check if required
    if (rule.required && (value === undefined || value === null || value === '')) {
      return `${field} is required`;
    }
    
    // If not required and no value, skip other validations
    if (!rule.required && (value === undefined || value === null)) {
      return true;
    }
    
    // Type validation
    switch (rule.type) {
      case 'string':
        return this.validateString(field, value, rule);
      case 'number':
        return this.validateNumber(field, value, rule);
      case 'boolean':
        return this.validateBoolean(field, value);
      case 'date':
        return this.validateDate(field, value);
      case 'email':
        return this.validateEmail(field, value);
      case 'url':
        return this.validateUrl(field, value);
      case 'enum':
        return this.validateEnum(field, value, rule);
      case 'array':
        return this.validateArray(field, value, rule);
      case 'object':
        return this.validateObject(field, value, rule);
      default:
        return true;
    }
  }

  private validateString(field: string, value: any, rule: ValidationRule): boolean | string {
    if (typeof value !== 'string') {
      return `${field} must be a string`;
    }
    
    if (rule.min && value.length < rule.min) {
      return `${field} must be at least ${rule.min} characters`;
    }
    
    if (rule.max && value.length > rule.max) {
      return `${field} must be at most ${rule.max} characters`;
    }
    
    if (rule.pattern) {
      const regex = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
      if (!regex.test(value)) {
        return `${field} format is invalid`;
      }
    }
    
    if (rule.custom) {
      const result = rule.custom(value);
      if (result !== true) {
        return typeof result === 'string' ? result : `${field} validation failed`;
      }
    }
    
    return true;
  }

  private validateNumber(field: string, value: any, rule: ValidationRule): boolean | string {
    const num = Number(value);
    
    if (isNaN(num)) {
      return `${field} must be a number`;
    }
    
    if (rule.min !== undefined && num < rule.min) {
      return `${field} must be at least ${rule.min}`;
    }
    
    if (rule.max !== undefined && num > rule.max) {
      return `${field} must be at most ${rule.max}`;
    }
    
    return true;
  }

  private validateBoolean(field: string, value: any): boolean | string {
    if (typeof value === 'boolean') return true;
    if (value === 'true' || value === 'false') return true;
    if (value === 1 || value === 0) return true;
    
    return `${field} must be a boolean`;
  }

  private validateDate(field: string, value: any): boolean | string {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return `${field} must be a valid date`;
    }
    
    return true;
  }

  private validateEmail(field: string, value: any): boolean | string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(value)) {
      return `${field} must be a valid email address`;
    }
    
    return true;
  }

  private validateUrl(field: string, value: any): boolean | string {
    try {
      new URL(value);
      return true;
    } catch {
      return `${field} must be a valid URL`;
    }
  }

  private validateEnum(field: string, value: any, rule: ValidationRule): boolean | string {
    if (!rule.values || !rule.values.includes(value)) {
      return `${field} must be one of: ${rule.values?.join(', ')}`;
    }
    
    return true;
  }

  private validateArray(field: string, value: any, rule: ValidationRule): boolean | string {
    if (!Array.isArray(value)) {
      return `${field} must be an array`;
    }
    
    if (rule.min && value.length < rule.min) {
      return `${field} must have at least ${rule.min} items`;
    }
    
    if (rule.max && value.length > rule.max) {
      return `${field} must have at most ${rule.max} items`;
    }
    
    return true;
  }

  private validateObject(field: string, value: any, rule: ValidationRule): boolean | string {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return `${field} must be an object`;
    }
    
    return true;
  }

  private sanitizeValue(value: any, rule: ValidationRule): any {
    if (rule.transform) {
      value = rule.transform(value);
    }
    
    if (rule.type === 'string' && this.config.validation.sanitizeInput) {
      value = this.sanitizeString(value);
    }
    
    return value;
  }

  private sanitizeString(value: string): string {
    // Basic HTML entity encoding
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  addCustomRule(name: string, rule: ValidationRule | Function): void {
    if (typeof rule === 'function') {
      this.customRules.set(name, {
        type: 'string',
        custom: rule as any
      });
    } else {
      this.customRules.set(name, rule);
    }
    
    logger.info(`Custom validation rule added: ${name}`);
  }

  addSanitizer(name: string, sanitizer: Function): void {
    this.sanitizers.set(name, sanitizer);
    logger.info(`Custom sanitizer added: ${name}`);
  }

  private initializeDefaultSanitizers(): void {
    this.sanitizers.set('trim', (value: string) => value.trim());
    this.sanitizers.set('lowercase', (value: string) => value.toLowerCase());
    this.sanitizers.set('uppercase', (value: string) => value.toUpperCase());
    this.sanitizers.set('escape', (value: string) => this.sanitizeString(value));
  }

  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return value;
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current = obj;
    
    for (const key of keys) {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }

  createSchemaFromModel(modelName: string): ValidationSchema {
    // Generate validation schema from Prisma model
    // This would be integrated with Prisma schema parsing
    const schemas: Record<string, ValidationSchema> = {
      user: {
        email: { type: 'email', required: true },
        name: { type: 'string', required: true, min: 2, max: 100 },
        age: { type: 'number', required: true, min: 10, max: 100 },
        role: { type: 'enum', values: ['PLAYER', 'COACH', 'ADMIN'] }
      },
      foodEntry: {
        mealType: { 
          type: 'enum', 
          values: ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER', 'EVENING_SNACK'],
          required: true 
        },
        description: { type: 'string', required: true, min: 1, max: 500 },
        date: { type: 'date', required: true },
        time: { type: 'string', required: true, pattern: /^\d{2}:\d{2}$/ },
        location: { type: 'string', max: 100 }
      },
      nutritionGoal: {
        goalType: { type: 'string', required: true },
        targetValue: { type: 'number', required: true, min: 0 },
        unit: { type: 'string', required: true },
        startDate: { type: 'date', required: true },
        endDate: { type: 'date' },
        isActive: { type: 'boolean' }
      }
    };
    
    return schemas[modelName] || {};
  }

  isConfigured(): boolean {
    return this.config.validation.strictMode;
  }
}

export default ValidationManager;