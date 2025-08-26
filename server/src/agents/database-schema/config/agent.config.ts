export interface SchemaRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: () => Promise<boolean>;
}

export interface MigrationConfig {
  autoRun: boolean;
  backupBeforeMigration: boolean;
  validateAfterMigration: boolean;
  migrationTimeout: number;
}

export interface OptimizationConfig {
  slowQueryThreshold: number;
  indexAnalysisEnabled: boolean;
  queryLogEnabled: boolean;
  performanceMonitoring: boolean;
}

export class AgentConfig {
  public readonly agentName = 'Database Schema Agent';
  public readonly version = '1.0.0';
  public readonly description = 'Manages and evolves PostgreSQL database schema for junior football nutrition tracking';
  
  public readonly migration: MigrationConfig = {
    autoRun: false,
    backupBeforeMigration: true,
    validateAfterMigration: true,
    migrationTimeout: 60000, // 60 seconds
  };

  public readonly optimization: OptimizationConfig = {
    slowQueryThreshold: 1000, // milliseconds
    indexAnalysisEnabled: true,
    queryLogEnabled: process.env.NODE_ENV === 'development',
    performanceMonitoring: true,
  };

  public readonly backup = {
    path: process.env.BACKUP_PATH || './backups',
    retention: 7, // days
    compression: true,
    encryption: false,
  };

  public readonly monitoring = {
    healthCheckInterval: 300000, // 5 minutes
    alertThresholds: {
      slowQueries: 10,
      failedMigrations: 1,
      schemaValidationErrors: 5,
    },
  };

  public readonly documentation = {
    outputPath: './docs/database',
    formats: ['markdown', 'html', 'json'],
    includeERDiagram: true,
    includeChangeLog: true,
  };

  public readonly dataIntegrity = {
    enforceConstraints: true,
    validateRelationships: true,
    checkOrphanedRecords: true,
    auditDataChanges: true,
  };

  public readonly performance = {
    connectionPoolSize: 20,
    queryTimeout: 30000,
    enableQueryCache: true,
    cacheTimeout: 300000, // 5 minutes
  };

  public readonly security = {
    encryptSensitiveData: true,
    auditLogEnabled: true,
    dataRetentionPeriod: 365, // days
    anonymizeOldData: true,
  };

  public getEnvironmentConfig(): any {
    return {
      database: {
        url: process.env.DATABASE_URL,
        shadowUrl: process.env.SHADOW_DATABASE_URL,
      },
      environment: process.env.NODE_ENV || 'development',
      debug: process.env.DEBUG === 'true',
    };
  }

  public isProductionMode(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  public getSchemaRules(): SchemaRule[] {
    return [
      {
        name: 'required-indexes',
        description: 'All foreign keys should have indexes',
        severity: 'warning',
        check: async () => true, // Implementation in schema-validator
      },
      {
        name: 'naming-convention',
        description: 'Tables and columns should follow naming conventions',
        severity: 'error',
        check: async () => true,
      },
      {
        name: 'no-orphaned-records',
        description: 'No orphaned records should exist',
        severity: 'error',
        check: async () => true,
      },
      {
        name: 'timestamp-fields',
        description: 'All tables should have createdAt and updatedAt',
        severity: 'warning',
        check: async () => true,
      },
    ];
  }
}

export default AgentConfig;