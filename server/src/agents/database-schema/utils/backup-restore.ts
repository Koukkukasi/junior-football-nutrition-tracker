import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { logger } from './logger';

export interface BackupOptions {
  path?: string;
  compress?: boolean;
  encrypt?: boolean;
  retention?: number; // days
}

export interface RestoreOptions {
  dropExisting?: boolean;
  createIfNotExists?: boolean;
}

export class BackupRestore {
  private defaultBackupPath: string;

  constructor(backupPath: string = './backups') {
    this.defaultBackupPath = backupPath;
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.defaultBackupPath)) {
      fs.mkdirSync(this.defaultBackupPath, { recursive: true });
      logger.info(`Created backup directory: ${this.defaultBackupPath}`);
    }
  }

  async createBackup(options: BackupOptions = {}): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${timestamp}.sql`;
    const backupPath = options.path || this.defaultBackupPath;
    const fullPath = path.join(backupPath, fileName);

    try {
      logger.info(`Creating backup at: ${fullPath}`);
      
      const databaseUrl = this.getDatabaseUrl();
      const connectionParams = this.parseConnectionString(databaseUrl);
      
      // Create pg_dump command
      const pgDumpCommand = this.buildPgDumpCommand(connectionParams, fullPath);
      
      execSync(pgDumpCommand, { 
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: connectionParams.password }
      });

      let finalPath = fullPath;

      // Compress if requested
      if (options.compress) {
        finalPath = await this.compressBackup(fullPath);
      }

      // Encrypt if requested
      if (options.encrypt) {
        finalPath = await this.encryptBackup(finalPath);
      }

      // Clean up old backups if retention is set
      if (options.retention) {
        await this.cleanOldBackups(backupPath, options.retention);
      }

      logger.info(`✅ Backup created successfully: ${finalPath}`);
      return finalPath;
    } catch (error) {
      logger.error('Backup failed:', error);
      throw new Error(`Backup failed: ${(error as Error).message}`);
    }
  }

  async restoreBackup(backupPath: string, options: RestoreOptions = {}): Promise<void> {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      logger.info(`Restoring from backup: ${backupPath}`);
      
      let restorePath = backupPath;

      // Decrypt if needed
      if (backupPath.endsWith('.enc')) {
        restorePath = await this.decryptBackup(backupPath);
      }

      // Decompress if needed
      if (restorePath.endsWith('.gz')) {
        restorePath = await this.decompressBackup(restorePath);
      }

      const databaseUrl = this.getDatabaseUrl();
      const connectionParams = this.parseConnectionString(databaseUrl);

      // Drop existing database if requested
      if (options.dropExisting) {
        await this.dropDatabase(connectionParams);
      }

      // Create database if requested
      if (options.createIfNotExists) {
        await this.createDatabase(connectionParams);
      }

      // Restore the backup
      const psqlCommand = this.buildPsqlCommand(connectionParams, restorePath);
      
      execSync(psqlCommand, {
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: connectionParams.password }
      });

      logger.info('✅ Database restored successfully');
    } catch (error) {
      logger.error('Restore failed:', error);
      throw new Error(`Restore failed: ${(error as Error).message}`);
    }
  }

  async listBackups(): Promise<Array<{
    name: string;
    path: string;
    size: number;
    created: Date;
  }>> {
    const backups: Array<{
      name: string;
      path: string;
      size: number;
      created: Date;
    }> = [];

    try {
      const files = fs.readdirSync(this.defaultBackupPath);
      
      for (const file of files) {
        if (file.startsWith('backup_') && 
            (file.endsWith('.sql') || file.endsWith('.sql.gz') || file.endsWith('.sql.enc'))) {
          const filePath = path.join(this.defaultBackupPath, file);
          const stats = fs.statSync(filePath);
          
          backups.push({
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime
          });
        }
      }

      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      logger.error('Failed to list backups:', error);
      return [];
    }
  }

  async verifyBackup(backupPath: string): Promise<boolean> {
    try {
      if (!fs.existsSync(backupPath)) {
        logger.error(`Backup file not found: ${backupPath}`);
        return false;
      }

      let checkPath = backupPath;

      // Handle encrypted files
      if (backupPath.endsWith('.enc')) {
        checkPath = await this.decryptBackup(backupPath, true); // temp decrypt for verification
      }

      // Handle compressed files
      if (checkPath.endsWith('.gz')) {
        checkPath = await this.decompressBackup(checkPath, true); // temp decompress for verification
      }

      // Check if file contains valid SQL
      const content = fs.readFileSync(checkPath, 'utf-8');
      const isValid = content.includes('PostgreSQL database dump') ||
                     content.includes('CREATE TABLE') ||
                     content.includes('INSERT INTO');

      // Clean up temp files
      if (checkPath !== backupPath) {
        fs.unlinkSync(checkPath);
      }

      logger.info(`Backup verification ${isValid ? 'passed' : 'failed'}: ${backupPath}`);
      return isValid;
    } catch (error) {
      logger.error('Backup verification failed:', error);
      return false;
    }
  }

  private async compressBackup(filePath: string): Promise<string> {
    const compressedPath = `${filePath}.gz`;
    execSync(`gzip -c "${filePath}" > "${compressedPath}"`);
    fs.unlinkSync(filePath); // Remove uncompressed file
    logger.info(`Backup compressed: ${compressedPath}`);
    return compressedPath;
  }

  private async decompressBackup(filePath: string, temp: boolean = false): Promise<string> {
    const decompressedPath = temp 
      ? filePath.replace('.gz', '.tmp.sql')
      : filePath.replace('.gz', '');
    
    execSync(`gunzip -c "${filePath}" > "${decompressedPath}"`);
    
    if (!temp) {
      fs.unlinkSync(filePath); // Remove compressed file
    }
    
    logger.info(`Backup decompressed: ${decompressedPath}`);
    return decompressedPath;
  }

  private async encryptBackup(filePath: string): Promise<string> {
    // Simple encryption using openssl (requires openssl to be installed)
    const encryptedPath = `${filePath}.enc`;
    const password = process.env.BACKUP_ENCRYPTION_KEY || 'default-encryption-key';
    
    execSync(
      `openssl enc -aes-256-cbc -salt -in "${filePath}" -out "${encryptedPath}" -k "${password}"`,
      { stdio: 'pipe' }
    );
    
    fs.unlinkSync(filePath); // Remove unencrypted file
    logger.info(`Backup encrypted: ${encryptedPath}`);
    return encryptedPath;
  }

  private async decryptBackup(filePath: string, temp: boolean = false): Promise<string> {
    const decryptedPath = temp
      ? filePath.replace('.enc', '.tmp')
      : filePath.replace('.enc', '');
    
    const password = process.env.BACKUP_ENCRYPTION_KEY || 'default-encryption-key';
    
    execSync(
      `openssl enc -aes-256-cbc -d -in "${filePath}" -out "${decryptedPath}" -k "${password}"`,
      { stdio: 'pipe' }
    );
    
    if (!temp) {
      fs.unlinkSync(filePath); // Remove encrypted file
    }
    
    logger.info(`Backup decrypted: ${decryptedPath}`);
    return decryptedPath;
  }

  private async cleanOldBackups(backupPath: string, retentionDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const files = fs.readdirSync(backupPath);
    let deletedCount = 0;

    for (const file of files) {
      if (file.startsWith('backup_')) {
        const filePath = path.join(backupPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.birthtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
          logger.info(`Deleted old backup: ${file}`);
        }
      }
    }

    if (deletedCount > 0) {
      logger.info(`Cleaned up ${deletedCount} old backup(s)`);
    }
  }

  private getDatabaseUrl(): string {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    return url;
  }

  private parseConnectionString(url: string): {
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
  } {
    const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = url.match(regex);
    
    if (!match) {
      throw new Error('Invalid database connection string');
    }

    return {
      username: match[1],
      password: match[2],
      host: match[3],
      port: match[4],
      database: match[5].split('?')[0] // Remove query parameters
    };
  }

  private buildPgDumpCommand(params: any, outputPath: string): string {
    return `pg_dump -h ${params.host} -p ${params.port} -U ${params.username} -d ${params.database} -f "${outputPath}" --verbose --no-owner --no-acl`;
  }

  private buildPsqlCommand(params: any, inputPath: string): string {
    return `psql -h ${params.host} -p ${params.port} -U ${params.username} -d ${params.database} -f "${inputPath}"`;
  }

  private async dropDatabase(params: any): Promise<void> {
    logger.warn(`Dropping database: ${params.database}`);
    const command = `psql -h ${params.host} -p ${params.port} -U ${params.username} -d postgres -c "DROP DATABASE IF EXISTS ${params.database}"`;
    
    execSync(command, {
      stdio: 'pipe',
      env: { ...process.env, PGPASSWORD: params.password }
    });
  }

  private async createDatabase(params: any): Promise<void> {
    logger.info(`Creating database: ${params.database}`);
    const command = `psql -h ${params.host} -p ${params.port} -U ${params.username} -d postgres -c "CREATE DATABASE ${params.database}"`;
    
    execSync(command, {
      stdio: 'pipe',
      env: { ...process.env, PGPASSWORD: params.password }
    });
  }
}

export const backupRestore = new BackupRestore();
export default BackupRestore;