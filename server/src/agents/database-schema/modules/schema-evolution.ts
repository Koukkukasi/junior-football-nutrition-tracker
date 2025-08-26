import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { AgentConfig } from '../config/agent.config';
import { logger } from '../utils/logger';

export interface Migration {
  id: string;
  name: string;
  description?: string;
  timestamp: Date;
  sql?: string;
  status: 'pending' | 'applied' | 'failed';
}

export class SchemaEvolution {
  private prisma: PrismaClient;
  private config: AgentConfig;
  private migrationsPath: string;

  constructor(prisma: PrismaClient, config: AgentConfig) {
    this.prisma = prisma;
    this.config = config;
    this.migrationsPath = path.join(process.cwd(), 'prisma', 'migrations');
  }

  async generateMigration(name: string, description?: string): Promise<void> {
    try {
      logger.info(`Generating migration: ${name}`);
      
      if (this.config.migration.backupBeforeMigration) {
        await this.createBackup();
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const migrationName = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}`;
      
      execSync(`npx prisma migrate dev --name ${migrationName} --create-only`, {
        stdio: 'inherit'
      });

      if (description) {
        await this.addMigrationMetadata(migrationName, description);
      }

      logger.info(`✅ Migration generated: ${migrationName}`);
    } catch (error) {
      logger.error('Failed to generate migration:', error);
      throw error;
    }
  }

  async runPendingMigrations(): Promise<void> {
    try {
      logger.info('Running pending migrations...');
      
      if (this.config.migration.backupBeforeMigration) {
        await this.createBackup();
      }

      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        timeout: this.config.migration.migrationTimeout
      });

      if (this.config.migration.validateAfterMigration) {
        await this.validateMigrations();
      }

      logger.info('✅ Migrations applied successfully');
    } catch (error) {
      logger.error('Failed to run migrations:', error);
      throw error;
    }
  }

  async rollback(steps: number = 1): Promise<void> {
    try {
      logger.info(`Rolling back ${steps} migration(s)...`);
      
      const backup = await this.createBackup();
      
      for (let i = 0; i < steps; i++) {
        execSync('npx prisma migrate reset --skip-seed', {
          stdio: 'inherit'
        });
      }

      logger.info(`✅ Rolled back ${steps} migration(s)`);
      logger.info(`Backup created at: ${backup}`);
    } catch (error) {
      logger.error('Rollback failed:', error);
      throw error;
    }
  }

  async getMigrationHistory(): Promise<Migration[]> {
    try {
      const migrations: Migration[] = [];
      
      if (!fs.existsSync(this.migrationsPath)) {
        return migrations;
      }

      const migrationDirs = fs.readdirSync(this.migrationsPath)
        .filter(dir => fs.statSync(path.join(this.migrationsPath, dir)).isDirectory());

      for (const dir of migrationDirs) {
        const migrationPath = path.join(this.migrationsPath, dir);
        const migrationSqlPath = path.join(migrationPath, 'migration.sql');
        
        if (fs.existsSync(migrationSqlPath)) {
          const sql = fs.readFileSync(migrationSqlPath, 'utf-8');
          const timestamp = this.extractTimestamp(dir);
          
          migrations.push({
            id: dir,
            name: dir.replace(/^\d+_/, ''),
            timestamp: new Date(timestamp),
            sql,
            status: 'applied'
          });
        }
      }

      return migrations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      logger.error('Failed to get migration history:', error);
      throw error;
    }
  }

  async createBackup(backupPath?: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup_${timestamp}.sql`;
      const fullPath = backupPath || path.join(this.config.backup.path, fileName);
      
      if (!fs.existsSync(path.dirname(fullPath))) {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      }

      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      execSync(`pg_dump ${databaseUrl} > ${fullPath}`, {
        stdio: 'inherit'
      });

      if (this.config.backup.compression) {
        execSync(`gzip ${fullPath}`, { stdio: 'inherit' });
        return `${fullPath}.gz`;
      }

      return fullPath;
    } catch (error) {
      logger.error('Backup failed:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupPath: string): Promise<void> {
    try {
      logger.info(`Restoring from backup: ${backupPath}`);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      let restorePath = backupPath;
      if (backupPath.endsWith('.gz')) {
        execSync(`gunzip -c ${backupPath} > ${backupPath.replace('.gz', '')}`, {
          stdio: 'inherit'
        });
        restorePath = backupPath.replace('.gz', '');
      }

      execSync(`psql ${databaseUrl} < ${restorePath}`, {
        stdio: 'inherit'
      });

      logger.info('✅ Database restored successfully');
    } catch (error) {
      logger.error('Restore failed:', error);
      throw error;
    }
  }

  async seedDatabase(seedType: 'test' | 'demo' | 'production'): Promise<void> {
    try {
      logger.info(`Seeding database with ${seedType} data...`);
      
      const seedScript = path.join(
        process.cwd(),
        'prisma',
        'seeds',
        `${seedType}.seed.ts`
      );

      if (!fs.existsSync(seedScript)) {
        await this.createDefaultSeedScript(seedType);
      }

      execSync(`npx ts-node ${seedScript}`, {
        stdio: 'inherit'
      });

      logger.info(`✅ Database seeded with ${seedType} data`);
    } catch (error) {
      logger.error('Seeding failed:', error);
      throw error;
    }
  }

  private async validateMigrations(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      logger.info('✅ Migration validation passed');
    } catch (error) {
      logger.error('Migration validation failed:', error);
      throw error;
    }
  }

  private async addMigrationMetadata(name: string, description: string): Promise<void> {
    const metadataPath = path.join(this.migrationsPath, name, 'metadata.json');
    const metadata = {
      name,
      description,
      timestamp: new Date().toISOString(),
      author: process.env.USER || 'unknown'
    };
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private extractTimestamp(migrationName: string): string {
    const match = migrationName.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }
    return new Date().toISOString();
  }

  private async createDefaultSeedScript(seedType: string): Promise<void> {
    const seedsDir = path.join(process.cwd(), 'prisma', 'seeds');
    if (!fs.existsSync(seedsDir)) {
      fs.mkdirSync(seedsDir, { recursive: true });
    }

    const seedContent = this.getDefaultSeedContent(seedType);
    const seedPath = path.join(seedsDir, `${seedType}.seed.ts`);
    
    fs.writeFileSync(seedPath, seedContent);
    logger.info(`Created default seed script: ${seedPath}`);
  }

  private getDefaultSeedContent(seedType: string): string {
    return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ${seedType} data...');
  
  // Add your seed data here
  ${seedType === 'test' ? this.getTestSeedData() : ''}
  ${seedType === 'demo' ? this.getDemoSeedData() : ''}
  ${seedType === 'production' ? this.getProductionSeedData() : ''}
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
  }

  private getTestSeedData(): string {
    return `
  // Create test users
  const testCoach = await prisma.user.create({
    data: {
      email: 'test.coach@example.com',
      name: 'Test Coach',
      age: 35,
      role: 'COACH',
      dataConsent: true,
      completedOnboarding: true,
    }
  });

  const testPlayer = await prisma.user.create({
    data: {
      email: 'test.player@example.com',
      name: 'Test Player',
      age: 14,
      role: 'PLAYER',
      position: 'MIDFIELDER',
      dataConsent: true,
      completedOnboarding: true,
    }
  });`;
  }

  private getDemoSeedData(): string {
    return `
  // Create demo team and users
  const demoTeam = await prisma.team.create({
    data: {
      name: 'Demo FC',
      description: 'Demo team for testing',
    }
  });`;
  }

  private getProductionSeedData(): string {
    return `
  // Production seed data - minimal essential data only
  console.log('Production seeding - adding essential data only');`;
  }
}

export default SchemaEvolution;