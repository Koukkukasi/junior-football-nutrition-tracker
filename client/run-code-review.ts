/**
 * Code Review Agent Execution Script
 * Runs comprehensive analysis on Junior Football Nutrition Tracker
 */

import CodeReviewAgent from './agents/code-review-agent/reviewer';
import CodeReviewReporter from './agents/code-review-agent/reporter';
import MCPValidator from './agents/code-review-agent/mcp-validator';
import * as path from 'path';
import * as fs from 'fs/promises';

async function runComprehensiveCodeReview() {
  console.log('🚀 Starting Comprehensive Code Review Analysis');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  const projectRoot = path.resolve(__dirname, '..');
  
  // Initialize agents
  const reviewer = new CodeReviewAgent(projectRoot);
  const reporter = new CodeReviewReporter(path.join(projectRoot, 'code-review-reports'));
  const mcpValidator = new MCPValidator('http://localhost:5173');
  
  try {
    console.log('\n📂 Analyzing Project Structure...');
    const sourceFiles = await getSourceFiles(projectRoot);
    console.log(`  Found ${sourceFiles.length} source files to analyze`);
    
    // 1. CODE QUALITY ANALYSIS
    console.log('\n🔍 Phase 1: Code Quality Analysis');
    console.log('-'.repeat(40));
    const codeQualityReport = await reviewer.analyzeCodeQuality(sourceFiles);
    console.log(`  ✅ Overall Score: ${codeQualityReport.overallScore}/100`);
    console.log(`  📊 Complexity: ${codeQualityReport.metrics.complexity.cyclomaticComplexity}`);
    console.log(`  🏗️ Maintainability: ${codeQualityReport.metrics.maintainability.maintainabilityIndex}`);
    console.log(`  🧪 Test Coverage: ${codeQualityReport.metrics.testability.testCoverage}%`);
    console.log(`  📋 Issues Found: ${codeQualityReport.issues.length}`);
    
    // 2. SECURITY SCANNING
    console.log('\n🔒 Phase 2: Security Analysis');
    console.log('-'.repeat(40));
    const securityReport = await reviewer.scanSecurity(projectRoot);
    console.log(`  ✅ Security Score: ${securityReport.severityScore}/100`);
    console.log(`  🚨 Vulnerabilities: ${securityReport.vulnerabilities.length}`);
    console.log(`  📦 Vulnerable Dependencies: ${securityReport.dependencies.length}`);
    
    // 3. PERFORMANCE ANALYSIS
    console.log('\n⚡ Phase 3: Performance Analysis');
    console.log('-'.repeat(40));
    const performanceReport = await reviewer.analyzePerformance('dist');
    console.log(`  📦 Bundle Size: ${(performanceReport.bundleSize.totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  🎨 FCP: ${performanceReport.renderPerformance.firstContentfulPaint}ms`);
    console.log(`  📐 LCP: ${performanceReport.renderPerformance.largestContentfulPaint}ms`);
    console.log(`  ⏱️ TTI: ${performanceReport.renderPerformance.timeToInteractive}ms`);
    
    // 4. ARCHITECTURE VALIDATION
    console.log('\n🏛️ Phase 4: Architecture Analysis');
    console.log('-'.repeat(40));
    const architectureReport = await reviewer.validateArchitecture(projectRoot);
    console.log(`  ✅ Compliance Score: ${architectureReport.complianceScore}/100`);
    console.log(`  🎯 Design Patterns: ${architectureReport.designPatterns.length} implemented`);
    console.log(`  ⚠️ Violations: ${architectureReport.violations.length}`);
    
    // 5. BEST PRACTICES CHECK
    console.log('\n✅ Phase 5: Best Practices Analysis');
    console.log('-'.repeat(40));
    const bestPracticesReport = await reviewer.checkBestPractices(projectRoot);
    console.log(`  ✅ Adherence Score: ${bestPracticesReport.adherenceScore}/100`);
    console.log(`  📝 Violations: ${bestPracticesReport.violations.length}`);
    
    // 6. MCP BROWSER VALIDATION (if server is running)
    console.log('\n🌐 Phase 6: MCP Browser Validation');
    console.log('-'.repeat(40));
    let mcpValidationReport = null;
    try {
      console.log('  Checking if development server is running...');
      const response = await fetch('http://localhost:5173');
      if (response.ok) {
        console.log('  ✅ Server is running, performing browser validation...');
        mcpValidationReport = await mcpValidator.validateCodeChanges(sourceFiles.slice(0, 10));
        console.log(`  ⚡ Load Time: ${mcpValidationReport.performance.loadTime}ms`);
        console.log(`  🎨 FCP: ${mcpValidationReport.performance.firstContentfulPaint}ms`);
        console.log(`  📐 LCP: ${mcpValidationReport.performance.largestContentfulPaint}ms`);
        console.log(`  🚨 Runtime Errors: ${mcpValidationReport.errors.length}`);
        console.log(`  🌐 Network Requests: ${mcpValidationReport.networkAnalysis.totalRequests}`);
        console.log(`  💾 Memory Usage: ${(mcpValidationReport.memoryProfile.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      } else {
        console.log('  ⚠️ Server not running, skipping browser validation');
        console.log('  💡 Run "npm run dev" to enable browser validation');
      }
    } catch (error) {
      console.log('  ⚠️ Could not connect to dev server, skipping browser validation');
    }
    
    // 7. MULTI-AGENT COLLABORATION
    console.log('\n🤝 Phase 7: Multi-Agent Collaboration Analysis');
    console.log('-'.repeat(40));
    
    // Collaborate with Testing Agent
    const testingCollaboration = await reviewer.collaborateWithTestingAgent({
      testFiles: sourceFiles.filter(f => f.includes('.spec.') || f.includes('.test.')),
      coverage: codeQualityReport.metrics.testability.testCoverage
    });
    console.log(`  🧪 Testing Agent Collaboration Score: ${testingCollaboration.collaborationScore}%`);
    
    // Collaborate with Nutrition Agent
    const nutritionFiles = sourceFiles.filter(f => f.includes('food') || f.includes('nutrition'));
    const nutritionCollaboration = await reviewer.collaborateWithNutritionAgent({
      files: nutritionFiles,
      algorithms: ['analyzeFoodQuality', 'getFoodRecommendations']
    });
    console.log(`  🥗 Nutrition Agent Security Score: ${nutritionCollaboration.securityScore}%`);
    
    // Collaborate with UI Agent
    const uiFiles = sourceFiles.filter(f => f.includes('components') || f.includes('pages'));
    const uiCollaboration = await reviewer.collaborateWithUIAgent({
      componentFiles: uiFiles,
      stylesheets: sourceFiles.filter(f => f.endsWith('.css'))
    });
    console.log(`  🎨 UI Agent Performance Score: ${uiCollaboration.performanceScore}%`);
    
    // 8. GENERATE COMPREHENSIVE REPORT
    console.log('\n📊 Phase 8: Generating Reports');
    console.log('-'.repeat(40));
    
    const comprehensiveReport = await reporter.generateReport(
      codeQualityReport,
      securityReport,
      performanceReport,
      architectureReport,
      {
        testingCollaboration,
        nutritionCollaboration,
        uiCollaboration
      }
    );
    
    console.log('  ✅ JSON report generated');
    console.log('  ✅ HTML report generated');
    console.log('  ✅ Markdown report generated');
    
    // Calculate execution time
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('📈 COMPREHENSIVE CODE REVIEW COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n🏆 Overall Project Health: ${comprehensiveReport.executive.overallHealth}/100`);
    console.log(`⚠️ Critical Issues: ${comprehensiveReport.executive.criticalIssues}`);
    console.log(`📊 Risk Level: ${comprehensiveReport.executive.riskLevel.toUpperCase()}`);
    console.log(`⏱️ Analysis Time: ${executionTime} seconds`);
    console.log(`📁 Reports saved to: ${path.join(projectRoot, 'code-review-reports')}`);
    
    // Key Recommendations
    console.log('\n🎯 TOP RECOMMENDATIONS:');
    comprehensiveReport.recommendations.immediate.slice(0, 3).forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      console.log(`   ${rec.description}`);
    });
    
    // Multi-Agent Insights
    console.log('\n🤖 MULTI-AGENT INSIGHTS:');
    console.log(`• Agent Synergy Score: ${comprehensiveReport.agentCollaboration.agentSynergy}%`);
    console.log(`• Consensus Items: ${comprehensiveReport.agentCollaboration.consensusItems.length}`);
    console.log(`• Cross-Validations: ${comprehensiveReport.agentCollaboration.crossValidation.length}`);
    
    // Save summary to file
    const summaryPath = path.join(projectRoot, 'code-review-reports', 'EXECUTIVE_SUMMARY.md');
    await fs.writeFile(summaryPath, generateExecutiveSummary(comprehensiveReport, executionTime));
    console.log(`\n📄 Executive summary saved to: ${summaryPath}`);
    
    return comprehensiveReport;
    
  } catch (error) {
    console.error('\n❌ Error during code review:', error);
    throw error;
  }
}

async function getSourceFiles(projectRoot: string): Promise<string[]> {
  const files: string[] = [];
  const clientSrc = path.join(projectRoot, 'client', 'src');
  const serverSrc = path.join(projectRoot, 'server', 'src');
  const clientAgents = path.join(projectRoot, 'client', 'agents');
  
  // Get all TypeScript and JavaScript files
  const dirs = [clientSrc, serverSrc, clientAgents];
  
  for (const dir of dirs) {
    try {
      const dirFiles = await getAllFiles(dir);
      files.push(...dirFiles.filter(f => 
        (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx')) &&
        !f.includes('node_modules') &&
        !f.includes('.test.') &&
        !f.includes('.spec.')
      ));
    } catch (error) {
      console.log(`  ⚠️ Could not read directory: ${dir}`);
    }
  }
  
  return files;
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        files.push(...await getAllFiles(fullPath));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return files;
}

function generateExecutiveSummary(report: any, executionTime: string): string {
  const timestamp = new Date().toISOString();
  
  return `# Code Review Executive Summary

## Junior Football Nutrition Tracker
**Analysis Date:** ${timestamp}  
**Execution Time:** ${executionTime} seconds  
**Report ID:** ${report.metadata.reportId}

## Overall Health Score: ${report.executive.overallHealth}/100

### Risk Assessment
- **Risk Level:** ${report.executive.riskLevel.toUpperCase()}
- **Critical Issues:** ${report.executive.criticalIssues}
- **Total Improvements Suggested:** ${report.executive.improvements}

## Key Metrics

| Metric | Score | Status | Trend |
|--------|-------|--------|-------|
${report.executive.keyMetrics.map((m: any) => 
  `| ${m.name} | ${m.value} | ${m.status} | ${m.trend} |`
).join('\n')}

## Quality Breakdown

### Code Quality (${report.codeQuality.score}/100)
- **Cyclomatic Complexity:** ${report.codeQuality.complexity.cyclomaticComplexity}
- **Maintainability Index:** ${report.codeQuality.maintainability.maintainabilityIndex}
- **Technical Debt:** ${report.codeQuality.maintainability.technicalDebt} hours
- **Code Smells:** ${report.codeQuality.maintainability.codeSmells}
- **Test Coverage:** ${report.codeQuality.testCoverage.overall}%

### Security (${report.security.score}/100)
- **Vulnerabilities Found:** ${report.security.vulnerabilities.total}
  - Critical: ${report.security.vulnerabilities.bySeverity.critical}
  - High: ${report.security.vulnerabilities.bySeverity.high}
  - Medium: ${report.security.vulnerabilities.bySeverity.medium}
  - Low: ${report.security.vulnerabilities.bySeverity.low}
- **Vulnerable Dependencies:** ${report.security.dependencies.vulnerable}

### Performance
- **Bundle Size:** ${(report.performance.bundleAnalysis.totalSize / 1024 / 1024).toFixed(2)}MB
- **Load Time:** ${report.performance.metrics.loadTime}ms
- **First Contentful Paint:** ${report.performance.metrics.fcp}ms
- **Largest Contentful Paint:** ${report.performance.metrics.lcp}ms
- **Time to Interactive:** ${report.performance.metrics.tti}ms

### Architecture (${report.architecture.complianceScore}/100)
- **Design Patterns Implemented:** ${report.architecture.patterns.implemented.length}
- **Architecture Violations:** ${report.architecture.violations.length}
- **Component Coupling Score:** ${report.architecture.coupling.score}

## Multi-Agent Collaboration

**Agent Synergy Score:** ${report.agentCollaboration.agentSynergy}%

### Cross-Agent Validation
${report.agentCollaboration.crossValidation.map((v: any) => 
  `- ${v.agent1} × ${v.agent2}: ${v.result} - ${v.details}`
).join('\n')}

### Consensus Items
${report.agentCollaboration.consensusItems.map((item: any) => 
  `- **${item.issue}** (Priority: ${item.priority}, Confidence: ${item.confidence}%)`
).join('\n')}

## Top Recommendations

### Immediate Actions
${report.recommendations.immediate.map((rec: any, i: number) => 
  `${i + 1}. **[${rec.priority.toUpperCase()}] ${rec.title}**
   - ${rec.description}
   - Impact: ${rec.impact}
   - Effort: ${rec.effort}`
).join('\n\n')}

### Short-term Improvements
${report.recommendations.shortTerm.slice(0, 3).map((rec: any, i: number) => 
  `${i + 1}. **${rec.title}** - ${rec.description}`
).join('\n')}

## Automation Opportunities
${report.recommendations.automation.map((auto: any) => 
  `- **${auto.type}**: ${auto.description} (ROI: ${auto.roi})`
).join('\n')}

## Historical Trends
${report.trends.historical.map((trend: any) => 
  `- **${trend.metric}**: ${trend.trend} trend`
).join('\n')}

## Next Steps

1. Address critical security vulnerabilities immediately
2. Review and fix high-priority code quality issues
3. Implement recommended performance optimizations
4. Set up automated code review in CI/CD pipeline
5. Schedule follow-up review in 2 weeks

---

*Generated by Enhanced Multi-Agent Code Review System*
*Powered by Code Review Agent v1.0.0*
`;
}

// Run the analysis if this file is executed directly
if (require.main === module) {
  runComprehensiveCodeReview()
    .then(() => {
      console.log('\n✅ Code review completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Code review failed:', error);
      process.exit(1);
    });
}

export default runComprehensiveCodeReview;