#!/usr/bin/env node

import { DatabaseSchemaAgent } from './index';
import { logger } from './utils/logger';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const agent = new DatabaseSchemaAgent();

  try {
    await agent.initialize();

    switch (command) {
      case 'validate':
        await handleValidate(agent);
        break;
      
      case 'migrate':
        await handleMigrate(agent, args[1]);
        break;
      
      case 'optimize':
        await handleOptimize(agent);
        break;
      
      case 'docs':
        await handleDocs(agent, args[1]);
        break;
      
      case 'backup':
        await handleBackup(agent, args[1]);
        break;
      
      case 'restore':
        await handleRestore(agent, args[1]);
        break;
      
      case 'seed':
        await handleSeed(agent, args[1]);
        break;
      
      case 'health':
        await handleHealth(agent);
        break;
      
      case 'help':
      default:
        showHelp();
        break;
    }

    await agent.cleanup();
    process.exit(0);
  } catch (error) {
    logger.error('Command failed:', error);
    await agent.cleanup();
    process.exit(1);
  }
}

async function handleValidate(agent: DatabaseSchemaAgent) {
  console.log('\n🔍 Validating database schema...\n');
  
  const result = await agent.validateSchema();
  
  if (result.isValid) {
    console.log('✅ Schema validation passed!\n');
  } else {
    console.log('❌ Schema validation failed!\n');
    console.log('Issues found:');
    result.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  }
  
  console.log('\nSummary:');
  console.log(`  Errors: ${result.summary.errors}`);
  console.log(`  Warnings: ${result.summary.warnings}`);
  console.log(`  Info: ${result.summary.info}`);
}

async function handleMigrate(agent: DatabaseSchemaAgent, migrationName?: string) {
  if (!migrationName) {
    console.log('Running pending migrations...');
    await agent.runMigrations();
  } else {
    console.log(`Generating migration: ${migrationName}`);
    await agent.generateMigration(migrationName);
  }
}

async function handleOptimize(agent: DatabaseSchemaAgent) {
  console.log('\n⚡ Analyzing and optimizing database queries...\n');
  
  const result = await agent.optimizeQueries();
  
  if (result.recommendations.length === 0) {
    console.log('✅ No optimization recommendations found. Database is performing well!\n');
  } else {
    console.log('📋 Optimization Recommendations:\n');
    result.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }
}

async function handleDocs(agent: DatabaseSchemaAgent, outputPath?: string) {
  console.log('\n📚 Generating schema documentation...\n');
  
  const resolvedPath = outputPath || path.join(process.cwd(), 'docs', 'database');
  await agent.generateDocumentation(resolvedPath);
  
  console.log(`✅ Documentation generated at: ${resolvedPath}\n`);
}

async function handleBackup(agent: DatabaseSchemaAgent, backupPath?: string) {
  console.log('\n💾 Creating database backup...\n');
  
  const backup = await agent.backupDatabase(backupPath);
  
  console.log(`✅ Backup created successfully: ${backup}\n`);
}

async function handleRestore(agent: DatabaseSchemaAgent, backupPath?: string) {
  if (!backupPath) {
    console.error('❌ Error: Backup path is required for restore');
    console.log('Usage: npm run agent:schema:restore <backup-file-path>');
    process.exit(1);
  }
  
  console.log(`\n📥 Restoring database from: ${backupPath}\n`);
  
  await agent.restoreDatabase(backupPath);
  
  console.log('✅ Database restored successfully!\n');
}

async function handleSeed(agent: DatabaseSchemaAgent, seedType?: string) {
  const type = (seedType as 'test' | 'demo' | 'production') || 'test';
  
  console.log(`\n🌱 Seeding database with ${type} data...\n`);
  
  await agent.seedData(type);
  
  console.log(`✅ Database seeded with ${type} data!\n`);
}

async function handleHealth(agent: DatabaseSchemaAgent) {
  console.log('\n🏥 Running database health check...\n');
  
  const result = await agent.healthCheck();
  
  const statusEmoji = {
    healthy: '✅',
    degraded: '⚠️',
    unhealthy: '❌'
  };
  
  console.log(`${statusEmoji[result.status]} Database Status: ${result.status.toUpperCase()}\n`);
  
  console.log('Details:');
  Object.entries(result.details).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════╗
║           Database Schema Agent - CLI Tool             ║
╚════════════════════════════════════════════════════════╝

Usage: npm run agent:schema <command> [options]

Commands:
  validate              Validate the current database schema
  migrate [name]        Run migrations or generate a new one
  optimize              Analyze and optimize queries
  docs [path]           Generate schema documentation
  backup [path]         Create a database backup
  restore <path>        Restore from a backup file
  seed [type]           Seed database (test/demo/production)
  health                Run a database health check
  help                  Show this help message

Examples:
  npm run agent:schema:validate
  npm run agent:schema:migrate "add_user_preferences"
  npm run agent:schema:optimize
  npm run agent:schema:docs ./documentation
  npm run agent:schema:backup
  npm run agent:schema:restore ./backups/backup_2024.sql
  npm run agent:schema:seed demo
  npm run agent:schema:health

For more information, see the documentation at:
./docs/database/schema.md
  `);
}

// Run the CLI
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});