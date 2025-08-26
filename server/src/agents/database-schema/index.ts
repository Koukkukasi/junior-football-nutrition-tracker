import { PrismaClient } from '@prisma/client';
import { SchemaEvolution } from './modules/schema-evolution';
import { SchemaValidator } from './modules/schema-validator';
import { QueryOptimizer } from './modules/query-optimizer';
import { SchemaDocumentationGenerator } from './modules/schema-docs';
import { AgentConfig } from './config/agent.config';
import { logger } from './utils/logger';

export class DatabaseSchemaAgent {
  private prisma: PrismaClient;
  private schemaEvolution: SchemaEvolution;
  private schemaValidator: SchemaValidator;
  private queryOptimizer: QueryOptimizer;
  private schemaDocsGenerator: SchemaDocumentationGenerator;
  private config: AgentConfig;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
    this.config = new AgentConfig();
    this.schemaEvolution = new SchemaEvolution(this.prisma, this.config);
    this.schemaValidator = new SchemaValidator(this.prisma, this.config);
    this.queryOptimizer = new QueryOptimizer(this.prisma, this.config);
    this.schemaDocsGenerator = new SchemaDocumentationGenerator(this.config);
  }

  async initialize(): Promise<void> {
    logger.info('🚀 Initializing Database Schema Agent...');
    
    try {
      await this.prisma.$connect();
      logger.info('✅ Database connection established');
      
      const validationResult = await this.schemaValidator.validateConnection();
      if (!validationResult.isValid) {
        throw new Error(`Database validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      logger.info('✅ Database Schema Agent initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Database Schema Agent:', error);
      throw error;
    }
  }

  async validateSchema(): Promise<{ 
    isValid: boolean; 
    issues: string[]; 
    summary: { errors: number; warnings: number; info: number; } 
  }> {
    logger.info('🔍 Validating database schema...');
    const result = await this.schemaValidator.validateFullSchema();
    return {
      isValid: result.isValid,
      issues: result.issues,
      summary: result.summary
    };
  }

  async generateMigration(name: string, description?: string): Promise<void> {
    logger.info(`📝 Generating migration: ${name}`);
    await this.schemaEvolution.generateMigration(name, description);
  }

  async runMigrations(): Promise<void> {
    logger.info('🚀 Running database migrations...');
    await this.schemaEvolution.runPendingMigrations();
  }

  async rollbackMigration(steps: number = 1): Promise<void> {
    logger.info(`⏪ Rolling back ${steps} migration(s)...`);
    await this.schemaEvolution.rollback(steps);
  }

  async optimizeQueries(): Promise<{ recommendations: string[] }> {
    logger.info('⚡ Analyzing query performance...');
    return await this.queryOptimizer.analyzeAndOptimize();
  }

  async generateDocumentation(outputPath?: string): Promise<void> {
    logger.info('📚 Generating schema documentation...');
    await this.schemaDocsGenerator.generateFullDocumentation(outputPath);
  }

  async backupDatabase(backupPath?: string): Promise<string> {
    logger.info('💾 Creating database backup...');
    const backup = await this.schemaEvolution.createBackup(backupPath);
    logger.info(`✅ Backup created: ${backup}`);
    return backup;
  }

  async restoreDatabase(backupPath: string): Promise<void> {
    logger.info(`📥 Restoring database from: ${backupPath}`);
    await this.schemaEvolution.restoreFromBackup(backupPath);
    logger.info('✅ Database restored successfully');
  }

  async seedData(seedType: 'test' | 'demo' | 'production'): Promise<void> {
    logger.info(`🌱 Seeding ${seedType} data...`);
    await this.schemaEvolution.seedDatabase(seedType);
  }

  async analyzePerformance(): Promise<{
    slowQueries: any[];
    missingIndexes: string[];
    unusedIndexes: string[];
    tableStats: any[];
  }> {
    logger.info('📊 Analyzing database performance...');
    return await this.queryOptimizer.performanceAnalysis();
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    logger.info('🏥 Running health check...');
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      
      const validation = await this.validateSchema();
      const performance = await this.analyzePerformance();
      
      const status = validation.isValid && performance.slowQueries.length === 0 
        ? 'healthy' 
        : validation.isValid 
          ? 'degraded' 
          : 'unhealthy';
      
      return {
        status,
        details: {
          schemaValid: validation.isValid,
          schemaIssues: validation.issues,
          slowQueries: performance.slowQueries.length,
          missingIndexes: performance.missingIndexes.length,
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: (error as Error).message }
      };
    }
  }

  async cleanup(): Promise<void> {
    logger.info('🧹 Cleaning up Database Schema Agent...');
    await this.prisma.$disconnect();
    logger.info('✅ Cleanup completed');
  }
}

export default DatabaseSchemaAgent;