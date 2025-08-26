import { PrismaClient } from '@prisma/client';
import { AgentConfig } from '../config/agent.config';
import { schemaRules } from '../config/schema.rules';
import { logger } from '../utils/logger';

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  table?: string;
  column?: string;
  recommendation?: string;
}

export interface SchemaValidationResult {
  isValid: boolean;
  issues: string[];
  details: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

export class SchemaValidator {
  private prisma: PrismaClient;
  private config: AgentConfig;

  constructor(prisma: PrismaClient, config: AgentConfig) {
    this.prisma = prisma;
    this.config = config;
  }

  async validateConnection(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      logger.info('✅ Database connection validated');
    } catch (error) {
      errors.push(`Database connection failed: ${(error as Error).message}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validateFullSchema(): Promise<SchemaValidationResult> {
    const issues: ValidationIssue[] = [];
    
    try {
      // Validate table structure
      const structureIssues = await this.validateTableStructure();
      issues.push(...structureIssues);

      // Validate relationships
      const relationshipIssues = await this.validateRelationships();
      issues.push(...relationshipIssues);

      // Validate data integrity
      const integrityIssues = await this.validateDataIntegrity();
      issues.push(...integrityIssues);

      // Validate indexes
      const indexIssues = await this.validateIndexes();
      issues.push(...indexIssues);

      // Validate constraints
      const constraintIssues = await this.validateConstraints();
      issues.push(...constraintIssues);

      // Apply custom validation rules
      const customRuleResults = await schemaRules.validateAll();
      for (const [ruleId, result] of customRuleResults) {
        if (!result.passed) {
          issues.push({
            type: 'error',
            message: `Rule ${ruleId} failed: ${result.message}`,
            recommendation: result.recommendation
          });
        }
      }

    } catch (error) {
      logger.error('Schema validation failed:', error);
      issues.push({
        type: 'error',
        message: `Validation error: ${(error as Error).message}`
      });
    }

    const summary = {
      errors: issues.filter(i => i.type === 'error').length,
      warnings: issues.filter(i => i.type === 'warning').length,
      info: issues.filter(i => i.type === 'info').length,
    };

    return {
      isValid: summary.errors === 0,
      issues: issues.map(i => i.message),
      details: issues,
      summary
    };
  }

  private async validateTableStructure(): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    try {
      const tables = await this.prisma.$queryRaw<any[]>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;

      for (const table of tables) {
        const tableName = table.table_name;
        
        // Check for primary key
        const primaryKey = await this.prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count
          FROM information_schema.table_constraints
          WHERE table_name = ${tableName}
          AND constraint_type = 'PRIMARY KEY'
        `;

        if (primaryKey[0].count === '0') {
          issues.push({
            type: 'error',
            message: `Table ${tableName} is missing a primary key`,
            table: tableName,
            recommendation: 'Add a primary key to ensure data integrity'
          });
        }

        // Check for timestamp fields
        const columns = await this.prisma.$queryRaw<any[]>`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = ${tableName}
        `;

        const columnNames = columns.map(c => c.column_name);
        
        if (!columnNames.includes('created_at') && !columnNames.includes('createdAt')) {
          issues.push({
            type: 'warning',
            message: `Table ${tableName} is missing createdAt timestamp`,
            table: tableName,
            recommendation: 'Add createdAt field for audit trail'
          });
        }

        if (!columnNames.includes('updated_at') && !columnNames.includes('updatedAt')) {
          issues.push({
            type: 'warning',
            message: `Table ${tableName} is missing updatedAt timestamp`,
            table: tableName,
            recommendation: 'Add updatedAt field for change tracking'
          });
        }
      }
    } catch (error) {
      logger.error('Table structure validation failed:', error);
    }

    return issues;
  }

  private async validateRelationships(): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    try {
      // Check for orphaned records in FoodEntry
      const orphanedFoodEntries = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count
        FROM "FoodEntry" f
        LEFT JOIN "User" u ON f."userId" = u.id
        WHERE u.id IS NULL
      `;

      if (parseInt(orphanedFoodEntries[0].count) > 0) {
        issues.push({
          type: 'error',
          message: `Found ${orphanedFoodEntries[0].count} orphaned food entries`,
          table: 'FoodEntry',
          recommendation: 'Clean up orphaned records or add cascade delete'
        });
      }

      // Check for orphaned records in PerformanceMetric
      const orphanedMetrics = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count
        FROM "PerformanceMetric" p
        LEFT JOIN "User" u ON p."userId" = u.id
        WHERE u.id IS NULL
      `;

      if (parseInt(orphanedMetrics[0].count) > 0) {
        issues.push({
          type: 'error',
          message: `Found ${orphanedMetrics[0].count} orphaned performance metrics`,
          table: 'PerformanceMetric',
          recommendation: 'Clean up orphaned records or add cascade delete'
        });
      }

      // Check for users without teams
      const usersWithoutTeams = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count
        FROM "User"
        WHERE "teamId" IS NULL AND role = 'PLAYER'
      `;

      if (parseInt(usersWithoutTeams[0].count) > 0) {
        issues.push({
          type: 'info',
          message: `${usersWithoutTeams[0].count} players are not assigned to teams`,
          table: 'User',
          recommendation: 'Consider assigning players to teams'
        });
      }
    } catch (error) {
      logger.error('Relationship validation failed:', error);
    }

    return issues;
  }

  private async validateDataIntegrity(): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    try {
      // Check for invalid age values
      const invalidAges = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count
        FROM "User"
        WHERE age < 10 OR age > 100
      `;

      if (parseInt(invalidAges[0].count) > 0) {
        issues.push({
          type: 'warning',
          message: `Found ${invalidAges[0].count} users with invalid ages`,
          table: 'User',
          column: 'age',
          recommendation: 'Review and correct user age values'
        });
      }

      // Check for invalid nutrition scores
      const invalidScores = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count
        FROM "FoodEntry"
        WHERE "nutritionScore" IS NOT NULL 
        AND ("nutritionScore" < 0 OR "nutritionScore" > 100)
      `;

      if (parseInt(invalidScores[0].count) > 0) {
        issues.push({
          type: 'error',
          message: `Found ${invalidScores[0].count} food entries with invalid nutrition scores`,
          table: 'FoodEntry',
          column: 'nutritionScore',
          recommendation: 'Nutrition scores should be between 0 and 100'
        });
      }

      // Check for duplicate emails
      const duplicateEmails = await this.prisma.$queryRaw<any[]>`
        SELECT email, COUNT(*) as count
        FROM "User"
        GROUP BY email
        HAVING COUNT(*) > 1
      `;

      if (duplicateEmails.length > 0) {
        issues.push({
          type: 'error',
          message: `Found ${duplicateEmails.length} duplicate email addresses`,
          table: 'User',
          column: 'email',
          recommendation: 'Email addresses must be unique'
        });
      }
    } catch (error) {
      logger.error('Data integrity validation failed:', error);
    }

    return issues;
  }

  private async validateIndexes(): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    try {
      // Check for missing indexes on foreign keys
      const foreignKeys = await this.prisma.$queryRaw<any[]>`
        SELECT 
          tc.table_name,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
      `;

      for (const fk of foreignKeys) {
        const indexExists = await this.prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count
          FROM pg_indexes
          WHERE tablename = ${fk.table_name}
          AND indexdef LIKE '%${fk.column_name}%'
        `;

        if (indexExists[0].count === '0') {
          issues.push({
            type: 'warning',
            message: `Missing index on foreign key ${fk.table_name}.${fk.column_name}`,
            table: fk.table_name,
            column: fk.column_name,
            recommendation: 'Add index to improve join performance'
          });
        }
      }

      // Check for unused indexes
      const unusedIndexes = await this.prisma.$queryRaw<any[]>`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey'
      `;

      for (const idx of unusedIndexes) {
        issues.push({
          type: 'info',
          message: `Unused index ${idx.indexname} on ${idx.tablename}`,
          table: idx.tablename,
          recommendation: 'Consider removing unused indexes to save storage'
        });
      }
    } catch (error) {
      logger.error('Index validation failed:', error);
    }

    return issues;
  }

  private async validateConstraints(): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    try {
      // Check for missing NOT NULL constraints on required fields
      const nullableRequiredFields = await this.prisma.$queryRaw<any[]>`
        SELECT 
          table_name,
          column_name
        FROM information_schema.columns
        WHERE is_nullable = 'YES'
        AND column_name IN ('email', 'name', 'userId', 'teamId')
        AND table_schema = 'public'
      `;

      for (const field of nullableRequiredFields) {
        issues.push({
          type: 'warning',
          message: `Column ${field.table_name}.${field.column_name} allows NULL but seems required`,
          table: field.table_name,
          column: field.column_name,
          recommendation: 'Consider adding NOT NULL constraint'
        });
      }

      // Check for missing unique constraints
      const shouldBeUnique = [
        { table: 'User', column: 'email' },
        { table: 'Team', column: 'inviteCode' }
      ];

      for (const check of shouldBeUnique) {
        const uniqueExists = await this.prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count
          FROM information_schema.table_constraints tc
          JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
          WHERE tc.table_name = ${check.table}
          AND ccu.column_name = ${check.column}
          AND tc.constraint_type = 'UNIQUE'
        `;

        if (uniqueExists[0].count === '0') {
          issues.push({
            type: 'error',
            message: `Missing unique constraint on ${check.table}.${check.column}`,
            table: check.table,
            column: check.column,
            recommendation: 'Add unique constraint to prevent duplicates'
          });
        }
      }
    } catch (error) {
      logger.error('Constraint validation failed:', error);
    }

    return issues;
  }

  async validateMigration(migrationName: string): Promise<boolean> {
    try {
      logger.info(`Validating migration: ${migrationName}`);
      
      // Run validation after migration
      const result = await this.validateFullSchema();
      
      if (!result.isValid) {
        logger.error(`Migration validation failed with ${result.summary.errors} errors`);
        return false;
      }

      logger.info('✅ Migration validation passed');
      return true;
    } catch (error) {
      logger.error('Migration validation error:', error);
      return false;
    }
  }
}

export default SchemaValidator;