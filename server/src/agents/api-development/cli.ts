#!/usr/bin/env node

import express from 'express';
import { ApiDevelopmentAgent } from './index';
import { logger } from './utils/logger';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  // Create a minimal Express app for the agent
  const app = express();
  const agent = new ApiDevelopmentAgent(app);

  try {
    await agent.initialize();

    switch (command) {
      case 'generate':
        await handleGenerate(agent, args.slice(1));
        break;
      
      case 'analyze':
        await handleAnalyze(agent);
        break;
      
      case 'docs':
        await handleDocs(agent, args[1]);
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

async function handleGenerate(agent: ApiDevelopmentAgent, args: string[]) {
  const resource = args[0];
  
  if (!resource) {
    console.error('❌ Error: Resource name is required');
    console.log('Usage: npm run agent:api generate <resource>');
    process.exit(1);
  }

  console.log(`\n📝 Generating CRUD endpoints for: ${resource}\n`);
  
  await agent.generateEndpoint({
    resource,
    operations: ['list', 'get', 'create', 'update', 'delete'],
    authentication: true,
    validation: true,
    version: 'v1'
  });

  console.log(`✅ Endpoints generated for ${resource}`);
  console.log('\nGenerated endpoints:');
  console.log(`  GET    /api/v1/${resource}`);
  console.log(`  GET    /api/v1/${resource}/:id`);
  console.log(`  POST   /api/v1/${resource}`);
  console.log(`  PUT    /api/v1/${resource}/:id`);
  console.log(`  DELETE /api/v1/${resource}/:id`);
}

async function handleAnalyze(agent: ApiDevelopmentAgent) {
  console.log('\n🔍 Analyzing API routes...\n');
  
  const analysis = await agent.analyzeRoutes();
  
  console.log('📊 API Analysis Report\n');
  console.log(`Total Endpoints: ${analysis.totalEndpoints}`);
  console.log(`Secured: ${analysis.securedEndpoints}`);
  console.log(`Public: ${analysis.publicEndpoints}`);
  console.log(`Validated: ${analysis.validatedEndpoints}`);
  console.log(`Undocumented: ${analysis.undocumentedEndpoints}`);
  
  console.log('\nEndpoints by Method:');
  for (const [method, count] of Object.entries(analysis.byMethod)) {
    console.log(`  ${method}: ${count}`);
  }
  
  console.log('\nEndpoints by Version:');
  for (const [version, count] of Object.entries(analysis.byVersion)) {
    console.log(`  ${version}: ${count}`);
  }
  
  if (analysis.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }
}

async function handleDocs(agent: ApiDevelopmentAgent, format?: string) {
  const selectedFormat = (format as any) || 'openapi';
  
  console.log(`\n📚 Generating API documentation (${selectedFormat})...\n`);
  
  const docs = await agent.generateDocumentation({
    format: selectedFormat as any,
    outputPath: `./docs/api/api-docs.${selectedFormat === 'openapi' ? 'json' : selectedFormat === 'postman' ? 'json' : 'md'}`,
    includeExamples: true
  });
  
  console.log(`✅ Documentation generated successfully`);
  console.log(`📁 Saved to: ./docs/api/`);
}

async function handleHealth(agent: ApiDevelopmentAgent) {
  console.log('\n🏥 Running API health check...\n');
  
  const health = await agent.healthCheck();
  
  const statusEmoji = {
    healthy: '✅',
    degraded: '⚠️',
    unhealthy: '❌'
  };
  
  console.log(`${statusEmoji[health.status]} API Status: ${health.status.toUpperCase()}\n`);
  
  console.log('Endpoints:');
  console.log(`  Total: ${health.endpoints.total}`);
  console.log(`  Healthy: ${health.endpoints.healthy}`);
  console.log(`  Errors: ${health.endpoints.errors}`);
  
  console.log('\nMiddleware Status:');
  console.log(`  Authentication: ${health.middleware.auth ? '✅' : '❌'}`);
  console.log(`  Validation: ${health.middleware.validation ? '✅' : '❌'}`);
  console.log(`  Error Handling: ${health.middleware.errorHandling ? '✅' : '❌'}`);
  console.log(`  Versioning: ${health.middleware.versioning ? '✅' : '❌'}`);
  
  console.log('\nDocumentation:');
  console.log(`  Generated: ${health.documentation.generated ? '✅' : '❌'}`);
  console.log(`  Coverage: ${health.documentation.coverage.toFixed(1)}%`);
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════╗
║            API Development Agent - CLI Tool            ║
╚════════════════════════════════════════════════════════╝

Usage: npm run agent:api <command> [options]

Commands:
  generate <resource>   Generate CRUD endpoints for a resource
  analyze              Analyze existing API routes
  docs [format]        Generate API documentation (openapi/postman/markdown)
  health               Run API health check
  help                 Show this help message

Examples:
  npm run agent:api generate user
  npm run agent:api generate foodEntry
  npm run agent:api analyze
  npm run agent:api docs openapi
  npm run agent:api docs markdown
  npm run agent:api health

Options:
  --auth               Add authentication (default: true)
  --validation         Add validation (default: true)
  --version <v>        API version (default: v1)

For more information, see the documentation at:
./docs/api/README.md
  `);
}

// Run the CLI
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});