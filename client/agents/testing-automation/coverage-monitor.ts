/**
 * Coverage Monitor
 * Monitors and reports test coverage metrics for the Junior Football Nutrition Tracker
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { TestConfig } from './config';

const execAsync = promisify(exec);

export interface CoverageData {
  summary: CoverageSummary;
  files: CoverageFileData[];
  uncoveredLines: UncoveredLine[];
  branches: BranchCoverage[];
  functions: FunctionCoverage[];
  timestamp: string;
  testSuite: string;
  thresholds: CoverageThresholds;
  compliance: ComplianceStatus;
}

export interface CoverageSummary {
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  lines: CoverageMetric;
  overall: number;
}

export interface CoverageMetric {
  total: number;
  covered: number;
  skipped: number;
  percentage: number;
}

export interface CoverageFileData {
  path: string;
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  lines: CoverageMetric;
  uncoveredLines: number[];
  complexity: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string[];
}

export interface UncoveredLine {
  file: string;
  line: number;
  type: 'statement' | 'branch' | 'function';
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface BranchCoverage {
  file: string;
  line: number;
  branch: string;
  taken: boolean;
  percentage: number;
}

export interface FunctionCoverage {
  file: string;
  name: string;
  line: number;
  covered: boolean;
  callCount: number;
}

export interface CoverageThresholds {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface ComplianceStatus {
  passing: boolean;
  failures: ComplianceFailure[];
  warnings: ComplianceWarning[];
  recommendations: string[];
}

export interface ComplianceFailure {
  type: 'statements' | 'branches' | 'functions' | 'lines';
  threshold: number;
  actual: number;
  files: string[];
}

export interface ComplianceWarning {
  type: 'low-coverage' | 'complexity' | 'untested-critical';
  message: string;
  files: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface CoverageReport {
  html: string;
  json: string;
  lcov: string;
  text: string;
  summary: CoverageSummary;
  insights: CoverageInsight[];
  actionItems: ActionItem[];
}

export interface CoverageInsight {
  type: 'improvement' | 'regression' | 'achievement' | 'warning';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  files?: string[];
  recommendation?: string;
}

export interface ActionItem {
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  files: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  category: 'testing' | 'refactoring' | 'documentation';
}

export class CoverageMonitor {
  constructor(private config: TestConfig) {}

  /**
   * Run coverage analysis for all test suites
   */
  async runFullCoverageAnalysis(): Promise<CoverageReport> {
    const reports: CoverageData[] = [];
    
    // Run unit test coverage
    const unitCoverage = await this.runUnitTestCoverage();
    reports.push(unitCoverage);
    
    // Run integration test coverage
    const integrationCoverage = await this.runIntegrationTestCoverage();
    reports.push(integrationCoverage);
    
    // Run E2E test coverage
    const e2eCoverage = await this.runE2ECoverage();
    reports.push(e2eCoverage);
    
    // Merge coverage reports
    const mergedCoverage = await this.mergeCoverageReports(reports);
    
    // Generate comprehensive report
    const report = await this.generateCoverageReport(mergedCoverage);
    
    // Save reports
    await this.saveCoverageReports(report);
    
    return report;
  }

  /**
   * Run unit test coverage using Vitest
   */
  async runUnitTestCoverage(): Promise<CoverageData> {
    try {
      console.log('🧪 Running unit test coverage...');
      
      const { stdout, stderr } = await execAsync(
        'npm run test:coverage -- --reporter=json',
        { cwd: this.config.paths.client }
      );

      if (stderr && !stderr.includes('warning')) {
        console.warn('Unit test coverage warnings:', stderr);
      }

      return await this.parseVitestCoverageOutput(stdout, 'unit');
    } catch (error) {
      console.error('Error running unit test coverage:', error);
      throw new Error(`Unit test coverage failed: ${error.message}`);
    }
  }

  /**
   * Run integration test coverage using Jest
   */
  async runIntegrationTestCoverage(): Promise<CoverageData> {
    try {
      console.log('🔗 Running integration test coverage...');
      
      const { stdout, stderr } = await execAsync(
        'npm run test:integration -- --coverage --coverageReporters=json',
        { cwd: this.config.paths.server }
      );

      if (stderr && !stderr.includes('warning')) {
        console.warn('Integration test coverage warnings:', stderr);
      }

      return await this.parseJestCoverageOutput(stdout, 'integration');
    } catch (error) {
      console.error('Error running integration test coverage:', error);
      throw new Error(`Integration test coverage failed: ${error.message}`);
    }
  }

  /**
   * Run E2E test coverage using Playwright
   */
  async runE2ECoverage(): Promise<CoverageData> {
    try {
      console.log('🎭 Running E2E test coverage...');
      
      // Playwright doesn't have built-in coverage, so we use NYC/Istanbul
      const { stdout, stderr } = await execAsync(
        'npx nyc --reporter=json npm run test:e2e',
        { cwd: this.config.paths.client }
      );

      if (stderr && !stderr.includes('warning')) {
        console.warn('E2E test coverage warnings:', stderr);
      }

      return await this.parseNYCCoverageOutput(stdout, 'e2e');
    } catch (error) {
      console.error('Error running E2E test coverage:', error);
      // E2E coverage is optional, return empty coverage
      return this.createEmptyCoverageData('e2e');
    }
  }

  /**
   * Parse Vitest coverage output
   */
  private async parseVitestCoverageOutput(output: string, testSuite: string): Promise<CoverageData> {
    try {
      // Look for coverage JSON file
      const coverageFile = join(this.config.paths.coverage.output, 'coverage-final.json');
      const coverageData = JSON.parse(await fs.readFile(coverageFile, 'utf-8'));
      
      return this.transformCoverageData(coverageData, testSuite);
    } catch (error) {
      console.warn('Could not parse Vitest coverage output:', error);
      return this.createEmptyCoverageData(testSuite);
    }
  }

  /**
   * Parse Jest coverage output
   */
  private async parseJestCoverageOutput(output: string, testSuite: string): Promise<CoverageData> {
    try {
      // Jest outputs coverage to coverage/coverage-final.json
      const coverageFile = join(this.config.paths.server, 'coverage', 'coverage-final.json');
      const coverageData = JSON.parse(await fs.readFile(coverageFile, 'utf-8'));
      
      return this.transformCoverageData(coverageData, testSuite);
    } catch (error) {
      console.warn('Could not parse Jest coverage output:', error);
      return this.createEmptyCoverageData(testSuite);
    }
  }

  /**
   * Parse NYC coverage output
   */
  private async parseNYCCoverageOutput(output: string, testSuite: string): Promise<CoverageData> {
    try {
      // NYC outputs to .nyc_output/coverage-final.json
      const coverageFile = join(this.config.paths.client, '.nyc_output', 'coverage-final.json');
      const coverageData = JSON.parse(await fs.readFile(coverageFile, 'utf-8'));
      
      return this.transformCoverageData(coverageData, testSuite);
    } catch (error) {
      console.warn('Could not parse NYC coverage output:', error);
      return this.createEmptyCoverageData(testSuite);
    }
  }

  /**
   * Transform raw coverage data to standardized format
   */
  private transformCoverageData(rawData: any, testSuite: string): CoverageData {
    const files: CoverageFileData[] = [];
    const uncoveredLines: UncoveredLine[] = [];
    const branches: BranchCoverage[] = [];
    const functions: FunctionCoverage[] = [];
    
    let totalStatements = 0;
    let coveredStatements = 0;
    let totalBranches = 0;
    let coveredBranches = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    let totalLines = 0;
    let coveredLines = 0;
    
    Object.entries(rawData).forEach(([filePath, data]: [string, any]) => {
      // Skip node_modules and test files
      if (filePath.includes('node_modules') || filePath.includes('.test.') || filePath.includes('.spec.')) {
        return;
      }
      
      const fileData = this.processFileData(filePath, data);
      files.push(fileData);
      
      // Accumulate totals
      totalStatements += fileData.statements.total;
      coveredStatements += fileData.statements.covered;
      totalBranches += fileData.branches.total;
      coveredBranches += fileData.branches.covered;
      totalFunctions += fileData.functions.total;
      coveredFunctions += fileData.functions.covered;
      totalLines += fileData.lines.total;
      coveredLines += fileData.lines.covered;
      
      // Collect uncovered lines
      fileData.uncoveredLines.forEach(lineNum => {
        uncoveredLines.push({
          file: filePath,
          line: lineNum,
          type: 'statement',
          description: `Uncovered statement at line ${lineNum}`,
          impact: this.assessLineImpact(filePath, lineNum)
        });
      });
    });
    
    const summary: CoverageSummary = {
      statements: {
        total: totalStatements,
        covered: coveredStatements,
        skipped: 0,
        percentage: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0
      },
      branches: {
        total: totalBranches,
        covered: coveredBranches,
        skipped: 0,
        percentage: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0
      },
      functions: {
        total: totalFunctions,
        covered: coveredFunctions,
        skipped: 0,
        percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0
      },
      lines: {
        total: totalLines,
        covered: coveredLines,
        skipped: 0,
        percentage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0
      },
      overall: (summary.statements.percentage + summary.branches.percentage + 
                summary.functions.percentage + summary.lines.percentage) / 4
    };
    
    const compliance = this.assessCompliance(summary);
    
    return {
      summary,
      files,
      uncoveredLines,
      branches,
      functions,
      timestamp: new Date().toISOString(),
      testSuite,
      thresholds: this.config.coverage.threshold,
      compliance
    };
  }

  /**
   * Process individual file coverage data
   */
  private processFileData(filePath: string, data: any): CoverageFileData {
    const statements = data.s || {};
    const branches = data.b || {};
    const functions = data.f || {};
    const statementMap = data.statementMap || {};
    
    const statementCount = Object.keys(statements).length;
    const coveredStatements = Object.values(statements).filter(Boolean).length;
    
    const branchCount = Object.keys(branches).length;
    const coveredBranches = Object.values(branches).flat().filter(Boolean).length;
    const totalBranches = Object.values(branches).flat().length;
    
    const functionCount = Object.keys(functions).length;
    const coveredFunctions = Object.values(functions).filter(Boolean).length;
    
    const lines = data.l || {};
    const lineCount = Object.keys(lines).length;
    const coveredLines = Object.values(lines).filter(Boolean).length;
    
    const uncoveredLines: number[] = [];
    Object.entries(statements).forEach(([key, covered]: [string, any]) => {
      if (!covered && statementMap[key]) {
        uncoveredLines.push(statementMap[key].start.line);
      }
    });
    
    return {
      path: filePath,
      statements: {
        total: statementCount,
        covered: coveredStatements,
        skipped: 0,
        percentage: statementCount > 0 ? (coveredStatements / statementCount) * 100 : 0
      },
      branches: {
        total: totalBranches,
        covered: coveredBranches,
        skipped: 0,
        percentage: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0
      },
      functions: {
        total: functionCount,
        covered: coveredFunctions,
        skipped: 0,
        percentage: functionCount > 0 ? (coveredFunctions / functionCount) * 100 : 0
      },
      lines: {
        total: lineCount,
        covered: coveredLines,
        skipped: 0,
        percentage: lineCount > 0 ? (coveredLines / lineCount) * 100 : 0
      },
      uncoveredLines: [...new Set(uncoveredLines)].sort((a, b) => a - b),
      complexity: this.calculateComplexity(filePath, data),
      priority: this.assessFilePriority(filePath),
      category: this.categorizeFile(filePath)
    };
  }

  /**
   * Assess line impact for prioritization
   */
  private assessLineImpact(filePath: string, lineNum: number): 'low' | 'medium' | 'high' {
    // Critical files have higher impact
    if (filePath.includes('food-analyzer') || filePath.includes('auth')) {
      return 'high';
    }
    
    if (filePath.includes('lib/') || filePath.includes('utils/')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Calculate file complexity
   */
  private calculateComplexity(filePath: string, data: any): number {
    // Simple complexity calculation based on branches and functions
    const branches = Object.keys(data.b || {}).length;
    const functions = Object.keys(data.f || {}).length;
    const statements = Object.keys(data.s || {}).length;
    
    return branches * 2 + functions + statements / 10;
  }

  /**
   * Assess file testing priority
   */
  private assessFilePriority(filePath: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalFiles = [
      'food-analyzer',
      'food-database',
      'auth',
      'supabase'
    ];
    
    if (criticalFiles.some(pattern => filePath.includes(pattern))) {
      return 'critical';
    }
    
    if (filePath.includes('lib/') || filePath.includes('utils/')) {
      return 'high';
    }
    
    if (filePath.includes('components/')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Categorize file by functionality
   */
  private categorizeFile(filePath: string): string[] {
    const categories: string[] = [];
    
    if (filePath.includes('food') || filePath.includes('nutrition')) {
      categories.push('nutrition');
    }
    
    if (filePath.includes('auth')) {
      categories.push('authentication');
    }
    
    if (filePath.includes('components/')) {
      categories.push('ui');
    }
    
    if (filePath.includes('lib/') || filePath.includes('utils/')) {
      categories.push('utility');
    }
    
    if (filePath.includes('api/') || filePath.includes('routes/')) {
      categories.push('api');
    }
    
    return categories;
  }

  /**
   * Assess compliance with coverage thresholds
   */
  private assessCompliance(summary: CoverageSummary): ComplianceStatus {
    const failures: ComplianceFailure[] = [];
    const warnings: ComplianceWarning[] = [];
    const recommendations: string[] = [];
    
    // Check threshold compliance
    if (summary.statements.percentage < this.config.coverage.threshold.statements) {
      failures.push({
        type: 'statements',
        threshold: this.config.coverage.threshold.statements,
        actual: summary.statements.percentage,
        files: [] // Would be populated with specific files
      });
    }
    
    if (summary.branches.percentage < this.config.coverage.threshold.branches) {
      failures.push({
        type: 'branches',
        threshold: this.config.coverage.threshold.branches,
        actual: summary.branches.percentage,
        files: []
      });
    }
    
    if (summary.functions.percentage < this.config.coverage.threshold.functions) {
      failures.push({
        type: 'functions',
        threshold: this.config.coverage.threshold.functions,
        actual: summary.functions.percentage,
        files: []
      });
    }
    
    if (summary.lines.percentage < this.config.coverage.threshold.lines) {
      failures.push({
        type: 'lines',
        threshold: this.config.coverage.threshold.lines,
        actual: summary.lines.percentage,
        files: []
      });
    }
    
    // Generate recommendations
    if (failures.length > 0) {
      recommendations.push('Focus on writing tests for uncovered critical functions');
      recommendations.push('Prioritize testing of food analysis and authentication modules');
      recommendations.push('Add integration tests for API endpoints');
    }
    
    if (summary.branches.percentage < summary.statements.percentage - 10) {
      recommendations.push('Improve branch coverage by testing edge cases and error conditions');
    }
    
    return {
      passing: failures.length === 0,
      failures,
      warnings,
      recommendations
    };
  }

  /**
   * Merge multiple coverage reports
   */
  private async mergeCoverageReports(reports: CoverageData[]): Promise<CoverageData> {
    if (reports.length === 0) {
      return this.createEmptyCoverageData('merged');
    }
    
    if (reports.length === 1) {
      return reports[0];
    }
    
    // Simple merge - in production, you'd want more sophisticated merging
    const merged = reports[0];
    merged.testSuite = 'merged';
    merged.timestamp = new Date().toISOString();
    
    // Combine files from all reports
    const allFiles = new Map<string, CoverageFileData>();
    reports.forEach(report => {
      report.files.forEach(file => {
        allFiles.set(file.path, file);
      });
    });
    
    merged.files = Array.from(allFiles.values());
    
    // Recalculate summary
    merged.summary = this.calculateMergedSummary(merged.files);
    merged.compliance = this.assessCompliance(merged.summary);
    
    return merged;
  }

  /**
   * Calculate summary from merged files
   */
  private calculateMergedSummary(files: CoverageFileData[]): CoverageSummary {
    let totalStatements = 0;
    let coveredStatements = 0;
    let totalBranches = 0;
    let coveredBranches = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    let totalLines = 0;
    let coveredLines = 0;
    
    files.forEach(file => {
      totalStatements += file.statements.total;
      coveredStatements += file.statements.covered;
      totalBranches += file.branches.total;
      coveredBranches += file.branches.covered;
      totalFunctions += file.functions.total;
      coveredFunctions += file.functions.covered;
      totalLines += file.lines.total;
      coveredLines += file.lines.covered;
    });
    
    const statements: CoverageMetric = {
      total: totalStatements,
      covered: coveredStatements,
      skipped: 0,
      percentage: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0
    };
    
    const branches: CoverageMetric = {
      total: totalBranches,
      covered: coveredBranches,
      skipped: 0,
      percentage: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0
    };
    
    const functions: CoverageMetric = {
      total: totalFunctions,
      covered: coveredFunctions,
      skipped: 0,
      percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0
    };
    
    const lines: CoverageMetric = {
      total: totalLines,
      covered: coveredLines,
      skipped: 0,
      percentage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0
    };
    
    return {
      statements,
      branches,
      functions,
      lines,
      overall: (statements.percentage + branches.percentage + functions.percentage + lines.percentage) / 4
    };
  }

  /**
   * Generate comprehensive coverage report
   */
  private async generateCoverageReport(coverage: CoverageData): Promise<CoverageReport> {
    const insights = this.generateInsights(coverage);
    const actionItems = this.generateActionItems(coverage);
    
    // Generate different report formats
    const htmlReport = await this.generateHTMLReport(coverage, insights, actionItems);
    const jsonReport = JSON.stringify(coverage, null, 2);
    const lcovReport = await this.generateLCOVReport(coverage);
    const textReport = await this.generateTextReport(coverage);
    
    return {
      html: htmlReport,
      json: jsonReport,
      lcov: lcovReport,
      text: textReport,
      summary: coverage.summary,
      insights,
      actionItems
    };
  }

  /**
   * Generate coverage insights
   */
  private generateInsights(coverage: CoverageData): CoverageInsight[] {
    const insights: CoverageInsight[] = [];
    
    // Overall coverage assessment
    if (coverage.summary.overall >= 90) {
      insights.push({
        type: 'achievement',
        title: 'Excellent Coverage',
        description: `Outstanding test coverage at ${coverage.summary.overall.toFixed(1)}%`,
        impact: 'high',
        recommendation: 'Maintain current testing practices and continue monitoring for regressions'
      });
    } else if (coverage.summary.overall >= 80) {
      insights.push({
        type: 'improvement',
        title: 'Good Coverage with Room for Improvement',
        description: `Solid test coverage at ${coverage.summary.overall.toFixed(1)}%, but can be enhanced`,
        impact: 'medium',
        recommendation: 'Focus on critical untested paths and edge cases'
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Coverage Below Target',
        description: `Test coverage at ${coverage.summary.overall.toFixed(1)}% is below recommended levels`,
        impact: 'high',
        recommendation: 'Prioritize writing tests for critical functionality'
      });
    }
    
    // Critical file analysis
    const criticalFiles = coverage.files.filter(f => f.priority === 'critical');
    const criticalUncovered = criticalFiles.filter(f => f.statements.percentage < 80);
    
    if (criticalUncovered.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Critical Files Undertested',
        description: `${criticalUncovered.length} critical files have less than 80% coverage`,
        impact: 'high',
        files: criticalUncovered.map(f => f.path),
        recommendation: 'Immediately add tests for critical food analysis and authentication functions'
      });
    }
    
    // Branch coverage analysis
    if (coverage.summary.branches.percentage < coverage.summary.statements.percentage - 15) {
      insights.push({
        type: 'improvement',
        title: 'Branch Coverage Lagging',
        description: 'Branch coverage is significantly lower than statement coverage',
        impact: 'medium',
        recommendation: 'Add tests for error conditions, edge cases, and alternative code paths'
      });
    }
    
    // Age-specific functionality coverage
    const ageSpecificFiles = coverage.files.filter(f => 
      f.path.includes('age') || f.categories.includes('nutrition')
    );
    const ageSpecificAverage = ageSpecificFiles.length > 0 ?
      ageSpecificFiles.reduce((sum, f) => sum + f.statements.percentage, 0) / ageSpecificFiles.length : 0;
    
    if (ageSpecificAverage < 85) {
      insights.push({
        type: 'improvement',
        title: 'Age-Specific Logic Needs More Testing',
        description: `Age-specific nutrition functions have ${ageSpecificAverage.toFixed(1)}% average coverage`,
        impact: 'high',
        files: ageSpecificFiles.map(f => f.path),
        recommendation: 'Add comprehensive tests for all age groups (U8, U10, U12, U15)'
      });
    }
    
    return insights;
  }

  /**
   * Generate actionable items
   */
  private generateActionItems(coverage: CoverageData): ActionItem[] {
    const actionItems: ActionItem[] = [];
    
    // High priority: Critical uncovered functions
    const criticalUncovered = coverage.files
      .filter(f => f.priority === 'critical' && f.statements.percentage < 70)
      .sort((a, b) => a.statements.percentage - b.statements.percentage);
    
    if (criticalUncovered.length > 0) {
      actionItems.push({
        priority: 'critical',
        title: 'Add Tests for Critical Functions',
        description: 'Write comprehensive tests for critical food analysis and authentication functions',
        files: criticalUncovered.map(f => f.path),
        estimatedEffort: 'high',
        category: 'testing'
      });
    }
    
    // Medium priority: Untested edge cases
    const lowBranchCoverage = coverage.files
      .filter(f => f.branches.percentage < 60 && f.branches.total > 0)
      .sort((a, b) => a.branches.percentage - b.branches.percentage);
    
    if (lowBranchCoverage.length > 0) {
      actionItems.push({
        priority: 'medium',
        title: 'Improve Branch Coverage',
        description: 'Add tests for error conditions, validation failures, and edge cases',
        files: lowBranchCoverage.slice(0, 5).map(f => f.path),
        estimatedEffort: 'medium',
        category: 'testing'
      });
    }
    
    // Low priority: Documentation for complex untested code
    const complexUntested = coverage.files
      .filter(f => f.complexity > 10 && f.statements.percentage < 50)
      .sort((a, b) => b.complexity - a.complexity);
    
    if (complexUntested.length > 0) {
      actionItems.push({
        priority: 'low',
        title: 'Document Complex Untested Code',
        description: 'Add documentation and consider refactoring complex untested functions',
        files: complexUntested.slice(0, 3).map(f => f.path),
        estimatedEffort: 'low',
        category: 'documentation'
      });
    }
    
    return actionItems;
  }

  /**
   * Generate HTML coverage report
   */
  private async generateHTMLReport(
    coverage: CoverageData,
    insights: CoverageInsight[],
    actionItems: ActionItem[]
  ): Promise<string> {
    const timestamp = new Date().toLocaleString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Junior Football Nutrition Tracker - Coverage Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; }
        .excellent { color: #28a745; }
        .good { color: #17a2b8; }
        .warning { color: #ffc107; }
        .critical { color: #dc3545; }
        .section { padding: 30px; border-top: 1px solid #eee; }
        .section h2 { margin-top: 0; color: #333; }
        .insights, .actions { display: grid; gap: 15px; }
        .insight, .action { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .insight.warning { border-left-color: #ffc107; }
        .insight.achievement { border-left-color: #28a745; }
        .action.critical { border-left-color: #dc3545; }
        .action.high { border-left-color: #fd7e14; }
        .files-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .files-table th, .files-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .files-table th { background: #f8f9fa; font-weight: 600; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Coverage Report</h1>
            <p>Junior Football Nutrition Tracker - Generated on ${timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value ${this.getCoverageClass(coverage.summary.overall)}">${coverage.summary.overall.toFixed(1)}%</div>
                <div class="metric-label">Overall Coverage</div>
            </div>
            <div class="metric">
                <div class="metric-value ${this.getCoverageClass(coverage.summary.statements.percentage)}">${coverage.summary.statements.percentage.toFixed(1)}%</div>
                <div class="metric-label">Statements</div>
            </div>
            <div class="metric">
                <div class="metric-value ${this.getCoverageClass(coverage.summary.branches.percentage)}">${coverage.summary.branches.percentage.toFixed(1)}%</div>
                <div class="metric-label">Branches</div>
            </div>
            <div class="metric">
                <div class="metric-value ${this.getCoverageClass(coverage.summary.functions.percentage)}">${coverage.summary.functions.percentage.toFixed(1)}%</div>
                <div class="metric-label">Functions</div>
            </div>
            <div class="metric">
                <div class="metric-value ${this.getCoverageClass(coverage.summary.lines.percentage)}">${coverage.summary.lines.percentage.toFixed(1)}%</div>
                <div class="metric-label">Lines</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Coverage Insights</h2>
            <div class="insights">
                ${insights.map(insight => `
                    <div class="insight ${insight.type}">
                        <h3>${insight.title}</h3>
                        <p>${insight.description}</p>
                        ${insight.recommendation ? `<p><strong>Recommendation:</strong> ${insight.recommendation}</p>` : ''}
                        ${insight.files ? `<p><strong>Files:</strong> ${insight.files.slice(0, 3).join(', ')}${insight.files.length > 3 ? '...' : ''}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>Action Items</h2>
            <div class="actions">
                ${actionItems.map(item => `
                    <div class="action ${item.priority}">
                        <h3>${item.title} (${item.priority.toUpperCase()} priority)</h3>
                        <p>${item.description}</p>
                        <p><strong>Estimated Effort:</strong> ${item.estimatedEffort}</p>
                        <p><strong>Files:</strong> ${item.files.slice(0, 3).join(', ')}${item.files.length > 3 ? ` and ${item.files.length - 3} more...` : ''}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>File Coverage Details</h2>
            <table class="files-table">
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Statements</th>
                        <th>Branches</th>
                        <th>Functions</th>
                        <th>Lines</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
                    ${coverage.files
                      .sort((a, b) => {
                        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.statements.percentage - b.statements.percentage;
                      })
                      .map(file => `
                        <tr>
                            <td>${file.path.split('/').pop()}</td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill ${this.getCoverageClass(file.statements.percentage)}" 
                                         style="width: ${file.statements.percentage}%; background-color: ${this.getCoverageColor(file.statements.percentage)};"></div>
                                </div>
                                ${file.statements.percentage.toFixed(1)}%
                            </td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill" 
                                         style="width: ${file.branches.percentage}%; background-color: ${this.getCoverageColor(file.branches.percentage)};"></div>
                                </div>
                                ${file.branches.percentage.toFixed(1)}%
                            </td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill" 
                                         style="width: ${file.functions.percentage}%; background-color: ${this.getCoverageColor(file.functions.percentage)};"></div>
                                </div>
                                ${file.functions.percentage.toFixed(1)}%
                            </td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill" 
                                         style="width: ${file.lines.percentage}%; background-color: ${this.getCoverageColor(file.lines.percentage)};"></div>
                                </div>
                                ${file.lines.percentage.toFixed(1)}%
                            </td>
                            <td><span class="${file.priority}">${file.priority.toUpperCase()}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate LCOV report
   */
  private async generateLCOVReport(coverage: CoverageData): Promise<string> {
    let lcov = '';
    
    coverage.files.forEach(file => {
      lcov += `SF:${file.path}\n`;
      
      // Functions
      file.functions.total > 0 && (lcov += `FNF:${file.functions.total}\n`);
      file.functions.covered > 0 && (lcov += `FNH:${file.functions.covered}\n`);
      
      // Branches
      file.branches.total > 0 && (lcov += `BRF:${file.branches.total}\n`);
      file.branches.covered > 0 && (lcov += `BRH:${file.branches.covered}\n`);
      
      // Lines
      file.lines.total > 0 && (lcov += `LF:${file.lines.total}\n`);
      file.lines.covered > 0 && (lcov += `LH:${file.lines.covered}\n`);
      
      lcov += 'end_of_record\n';
    });
    
    return lcov;
  }

  /**
   * Generate text report
   */
  private async generateTextReport(coverage: CoverageData): Promise<string> {
    const lines = [
      '# Junior Football Nutrition Tracker - Coverage Report',
      `Generated: ${new Date(coverage.timestamp).toLocaleString()}`,
      '',
      '## Summary',
      `Overall Coverage: ${coverage.summary.overall.toFixed(2)}%`,
      `Statements: ${coverage.summary.statements.percentage.toFixed(2)}% (${coverage.summary.statements.covered}/${coverage.summary.statements.total})`,
      `Branches: ${coverage.summary.branches.percentage.toFixed(2)}% (${coverage.summary.branches.covered}/${coverage.summary.branches.total})`,
      `Functions: ${coverage.summary.functions.percentage.toFixed(2)}% (${coverage.summary.functions.covered}/${coverage.summary.functions.total})`,
      `Lines: ${coverage.summary.lines.percentage.toFixed(2)}% (${coverage.summary.lines.covered}/${coverage.summary.lines.total})`,
      '',
      '## Compliance Status',
      coverage.compliance.passing ? '✅ All thresholds met' : '❌ Some thresholds not met',
      ''
    ];
    
    if (coverage.compliance.failures.length > 0) {
      lines.push('### Failures');
      coverage.compliance.failures.forEach(failure => {
        lines.push(`- ${failure.type}: ${failure.actual.toFixed(2)}% (threshold: ${failure.threshold}%)`);
      });
      lines.push('');
    }
    
    if (coverage.compliance.recommendations.length > 0) {
      lines.push('### Recommendations');
      coverage.compliance.recommendations.forEach(rec => {
        lines.push(`- ${rec}`);
      });
      lines.push('');
    }
    
    lines.push('## File Details');
    coverage.files
      .sort((a, b) => a.statements.percentage - b.statements.percentage)
      .slice(0, 10) // Top 10 files needing attention
      .forEach(file => {
        lines.push(`${file.path}: ${file.statements.percentage.toFixed(1)}% statements, ${file.priority} priority`);
      });
    
    return lines.join('\n');
  }

  /**
   * Save coverage reports to files
   */
  private async saveCoverageReports(report: CoverageReport): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = join(this.config.paths.coverage.reports, timestamp);
    
    await this.ensureDirectory(reportDir);
    
    // Save different formats
    await Promise.all([
      fs.writeFile(join(reportDir, 'coverage-report.html'), report.html),
      fs.writeFile(join(reportDir, 'coverage-data.json'), report.json),
      fs.writeFile(join(reportDir, 'coverage.lcov'), report.lcov),
      fs.writeFile(join(reportDir, 'coverage-summary.txt'), report.text)
    ]);
    
    // Save latest report
    const latestDir = join(this.config.paths.coverage.reports, 'latest');
    await this.ensureDirectory(latestDir);
    
    await Promise.all([
      fs.writeFile(join(latestDir, 'coverage-report.html'), report.html),
      fs.writeFile(join(latestDir, 'coverage-data.json'), report.json),
      fs.writeFile(join(latestDir, 'coverage.lcov'), report.lcov),
      fs.writeFile(join(latestDir, 'coverage-summary.txt'), report.text)
    ]);
    
    console.log(`📊 Coverage reports saved to: ${reportDir}`);
  }

  /**
   * Create empty coverage data
   */
  private createEmptyCoverageData(testSuite: string): CoverageData {
    return {
      summary: {
        statements: { total: 0, covered: 0, skipped: 0, percentage: 0 },
        branches: { total: 0, covered: 0, skipped: 0, percentage: 0 },
        functions: { total: 0, covered: 0, skipped: 0, percentage: 0 },
        lines: { total: 0, covered: 0, skipped: 0, percentage: 0 },
        overall: 0
      },
      files: [],
      uncoveredLines: [],
      branches: [],
      functions: [],
      timestamp: new Date().toISOString(),
      testSuite,
      thresholds: this.config.coverage.threshold,
      compliance: {
        passing: false,
        failures: [],
        warnings: [],
        recommendations: ['No coverage data available - ensure tests are running correctly']
      }
    };
  }

  /**
   * Get coverage class for styling
   */
  private getCoverageClass(percentage: number): string {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 60) return 'warning';
    return 'critical';
  }

  /**
   * Get coverage color for progress bars
   */
  private getCoverageColor(percentage: number): string {
    if (percentage >= 90) return '#28a745';
    if (percentage >= 80) return '#17a2b8';
    if (percentage >= 60) return '#ffc107';
    return '#dc3545';
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Monitor coverage continuously
   */
  async startContinuousMonitoring(intervalMs: number = 300000): Promise<void> {
    console.log('📊 Starting continuous coverage monitoring...');
    
    const runCoverage = async () => {
      try {
        await this.runFullCoverageAnalysis();
        console.log('✅ Coverage analysis completed');
      } catch (error) {
        console.error('❌ Coverage analysis failed:', error);
      }
    };
    
    // Run initial analysis
    await runCoverage();
    
    // Set up interval
    setInterval(runCoverage, intervalMs);
  }

  /**
   * Compare coverage with previous run
   */
  async compareCoverage(previousReportPath: string): Promise<{
    improved: string[];
    regressed: string[];
    unchanged: string[];
    overallChange: number;
  }> {
    try {
      const previousData = JSON.parse(await fs.readFile(previousReportPath, 'utf-8'));
      const currentData = await this.runFullCoverageAnalysis();
      
      const improved: string[] = [];
      const regressed: string[] = [];
      const unchanged: string[] = [];
      
      const previousFiles = new Map(previousData.files.map(f => [f.path, f]));
      
      currentData.files.forEach(currentFile => {
        const previousFile = previousFiles.get(currentFile.path);
        
        if (previousFile) {
          const currentCoverage = currentFile.statements.percentage;
          const previousCoverage = previousFile.statements.percentage;
          const diff = currentCoverage - previousCoverage;
          
          if (Math.abs(diff) < 0.1) {
            unchanged.push(currentFile.path);
          } else if (diff > 0) {
            improved.push(currentFile.path);
          } else {
            regressed.push(currentFile.path);
          }
        }
      });
      
      const overallChange = currentData.summary.overall - previousData.summary.overall;
      
      return { improved, regressed, unchanged, overallChange };
    } catch (error) {
      throw new Error(`Failed to compare coverage: ${error.message}`);
    }
  }
}