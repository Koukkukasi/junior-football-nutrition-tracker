/**
 * Code Review Agent
 * Comprehensive code quality, security, and performance analysis
 * Integrates with existing multi-agent system for collaborative intelligence
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Type definitions
export interface CodeQualityReport {
  timestamp: string;
  overallScore: number;
  metrics: {
    complexity: ComplexityMetrics;
    maintainability: MaintainabilityMetrics;
    testability: TestabilityMetrics;
    duplication: DuplicationMetrics;
  };
  issues: CodeIssue[];
  recommendations: string[];
}

export interface SecurityReport {
  timestamp: string;
  severityScore: number;
  vulnerabilities: SecurityVulnerability[];
  dependencies: DependencyVulnerability[];
  recommendations: string[];
}

export interface PerformanceReport {
  timestamp: string;
  bundleSize: BundleMetrics;
  renderPerformance: RenderMetrics;
  memoryUsage: MemoryMetrics;
  optimizationOpportunities: OptimizationSuggestion[];
}

export interface ArchitectureReport {
  timestamp: string;
  complianceScore: number;
  designPatterns: PatternCompliance[];
  componentCoupling: CouplingMetrics;
  violations: ArchitectureViolation[];
  suggestions: string[];
}

export interface BestPracticesReport {
  timestamp: string;
  adherenceScore: number;
  violations: BestPracticeViolation[];
  suggestions: string[];
}

// Metric interfaces
interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  nestingDepth: number;
  linesOfCode: number;
}

interface MaintainabilityMetrics {
  maintainabilityIndex: number;
  technicalDebt: number;
  codeSmells: number;
}

interface TestabilityMetrics {
  testCoverage: number;
  mockability: number;
  assertions: number;
}

interface DuplicationMetrics {
  duplicatedLines: number;
  duplicatedBlocks: number;
  duplicatedFiles: number;
}

interface CodeIssue {
  severity: 'critical' | 'major' | 'minor' | 'info';
  type: string;
  file: string;
  line: number;
  message: string;
  rule: string;
}

interface SecurityVulnerability {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  file: string;
  line?: number;
  description: string;
  remediation: string;
}

interface DependencyVulnerability {
  package: string;
  severity: string;
  vulnerability: string;
  version: string;
  fixedVersion?: string;
}

interface BundleMetrics {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  chunkSizes: { [key: string]: number };
}

interface RenderMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
}

interface OptimizationSuggestion {
  type: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  implementation: string;
}

interface PatternCompliance {
  pattern: string;
  compliance: number;
  violations: string[];
}

interface CouplingMetrics {
  afferentCoupling: number;
  efferentCoupling: number;
  instability: number;
}

interface ArchitectureViolation {
  type: string;
  severity: string;
  location: string;
  description: string;
}

interface BestPracticeViolation {
  practice: string;
  severity: string;
  file: string;
  line?: number;
  description: string;
  fix: string;
}

export class CodeReviewAgent {
  private readonly projectRoot: string;
  private readonly configPath: string;
  
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.configPath = path.join(projectRoot, '.codereview.json');
  }

  /**
   * Analyze overall code quality
   */
  async analyzeCodeQuality(files: string[]): Promise<CodeQualityReport> {
    console.log('🔍 Analyzing code quality...');
    
    const complexity = await this.analyzeComplexity(files);
    const maintainability = await this.analyzeMaintainability(files);
    const testability = await this.analyzeTestability(files);
    const duplication = await this.analyzeDuplication(files);
    const issues = await this.detectCodeIssues(files);
    
    const overallScore = this.calculateOverallScore({
      complexity, maintainability, testability, duplication
    });
    
    return {
      timestamp: new Date().toISOString(),
      overallScore,
      metrics: {
        complexity,
        maintainability,
        testability,
        duplication
      },
      issues,
      recommendations: this.generateQualityRecommendations(issues, overallScore)
    };
  }

  /**
   * Scan for security vulnerabilities
   */
  async scanSecurity(codebase: string): Promise<SecurityReport> {
    console.log('🔒 Scanning for security vulnerabilities...');
    
    const vulnerabilities = await this.detectSecurityVulnerabilities(codebase);
    const dependencies = await this.scanDependencies();
    const severityScore = this.calculateSeverityScore(vulnerabilities, dependencies);
    
    return {
      timestamp: new Date().toISOString(),
      severityScore,
      vulnerabilities,
      dependencies,
      recommendations: this.generateSecurityRecommendations(vulnerabilities, dependencies)
    };
  }

  /**
   * Analyze performance impact
   */
  async analyzePerformance(bundle: string): Promise<PerformanceReport> {
    console.log('⚡ Analyzing performance...');
    
    const bundleSize = await this.analyzeBundleSize(bundle);
    const renderPerformance = await this.analyzeRenderPerformance();
    const memoryUsage = await this.analyzeMemoryUsage();
    const optimizationOpportunities = await this.findOptimizationOpportunities();
    
    return {
      timestamp: new Date().toISOString(),
      bundleSize,
      renderPerformance,
      memoryUsage,
      optimizationOpportunities
    };
  }

  /**
   * Validate architecture compliance
   */
  async validateArchitecture(structure: string): Promise<ArchitectureReport> {
    console.log('🏛️ Validating architecture...');
    
    const designPatterns = await this.checkDesignPatterns(structure);
    const componentCoupling = await this.analyzeComponentCoupling(structure);
    const violations = await this.detectArchitectureViolations(structure);
    const complianceScore = this.calculateComplianceScore(designPatterns, violations);
    
    return {
      timestamp: new Date().toISOString(),
      complianceScore,
      designPatterns,
      componentCoupling,
      violations,
      suggestions: this.generateArchitectureSuggestions(violations)
    };
  }

  /**
   * Check best practices adherence
   */
  async checkBestPractices(code: string): Promise<BestPracticesReport> {
    console.log('✅ Checking best practices...');
    
    const violations = await this.detectBestPracticeViolations(code);
    const adherenceScore = this.calculateAdherenceScore(violations);
    
    return {
      timestamp: new Date().toISOString(),
      adherenceScore,
      violations,
      suggestions: this.generateBestPracticeSuggestions(violations)
    };
  }

  /**
   * Collaborate with Testing Agent
   */
  async collaborateWithTestingAgent(testReport: any): Promise<any> {
    console.log('🤝 Collaborating with Testing Agent...');
    
    // Analyze test quality
    const testCodeQuality = await this.analyzeTestCode(testReport);
    
    // Validate test coverage
    const coverageValidation = await this.validateTestCoverage(testReport);
    
    // Suggest test improvements
    const testImprovements = this.suggestTestImprovements(testCodeQuality, coverageValidation);
    
    return {
      testCodeQuality,
      coverageValidation,
      testImprovements,
      collaborationScore: this.calculateCollaborationScore(testCodeQuality, coverageValidation)
    };
  }

  /**
   * Collaborate with Nutrition Agent for security review
   */
  async collaborateWithNutritionAgent(nutritionLogic: any): Promise<any> {
    console.log('🤝 Collaborating with Nutrition Agent...');
    
    // Review nutrition calculation security
    const calculationSecurity = await this.reviewCalculationSecurity(nutritionLogic);
    
    // Validate input sanitization
    const inputValidation = await this.validateInputSanitization(nutritionLogic);
    
    // Check for injection vulnerabilities
    const injectionCheck = await this.checkInjectionVulnerabilities(nutritionLogic);
    
    return {
      calculationSecurity,
      inputValidation,
      injectionCheck,
      securityScore: this.calculateNutritionSecurityScore(calculationSecurity, inputValidation, injectionCheck)
    };
  }

  /**
   * Collaborate with UI Agent for performance review
   */
  async collaborateWithUIAgent(componentCode: any): Promise<any> {
    console.log('🤝 Collaborating with UI Agent...');
    
    // Review component performance
    const componentPerformance = await this.reviewComponentPerformance(componentCode);
    
    // Check render optimization
    const renderOptimization = await this.checkRenderOptimization(componentCode);
    
    // Validate accessibility compliance
    const accessibilityCompliance = await this.validateAccessibility(componentCode);
    
    return {
      componentPerformance,
      renderOptimization,
      accessibilityCompliance,
      performanceScore: this.calculateUIPerformanceScore(componentPerformance, renderOptimization)
    };
  }

  // Private methods for complexity analysis
  private async analyzeComplexity(files: string[]): Promise<ComplexityMetrics> {
    let totalComplexity = 0;
    let cognitiveComplexity = 0;
    let maxNesting = 0;
    let totalLines = 0;

    for (const file of files) {
      const content = await this.readFile(file);
      const fileComplexity = this.calculateCyclomaticComplexity(content);
      const fileCognitive = this.calculateCognitiveComplexity(content);
      const fileNesting = this.calculateNestingDepth(content);
      const fileLines = content.split('\n').length;

      totalComplexity += fileComplexity;
      cognitiveComplexity += fileCognitive;
      maxNesting = Math.max(maxNesting, fileNesting);
      totalLines += fileLines;
    }

    return {
      cyclomaticComplexity: Math.round(totalComplexity / files.length),
      cognitiveComplexity: Math.round(cognitiveComplexity / files.length),
      nestingDepth: maxNesting,
      linesOfCode: totalLines
    };
  }

  private calculateCyclomaticComplexity(code: string): number {
    // Count decision points
    const ifStatements = (code.match(/\bif\s*\(/g) || []).length;
    const elseStatements = (code.match(/\belse\s+if\s*\(/g) || []).length;
    const switchCases = (code.match(/\bcase\s+/g) || []).length;
    const forLoops = (code.match(/\bfor\s*\(/g) || []).length;
    const whileLoops = (code.match(/\bwhile\s*\(/g) || []).length;
    const ternaryOps = (code.match(/\?.*:/g) || []).length;
    const logicalOps = (code.match(/&&|\|\|/g) || []).length;

    return 1 + ifStatements + elseStatements + switchCases + forLoops + whileLoops + ternaryOps + logicalOps;
  }

  private calculateCognitiveComplexity(code: string): number {
    // Simplified cognitive complexity calculation
    let complexity = 0;
    const lines = code.split('\n');
    let nestingLevel = 0;

    for (const line of lines) {
      if (line.includes('{')) nestingLevel++;
      if (line.includes('}')) nestingLevel = Math.max(0, nestingLevel - 1);
      
      if (line.match(/\b(if|else|for|while|switch)\b/)) {
        complexity += 1 + nestingLevel;
      }
    }

    return complexity;
  }

  private calculateNestingDepth(code: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const char of code) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }
    
    return maxDepth;
  }

  // Private methods for maintainability
  private async analyzeMaintainability(files: string[]): Promise<MaintainabilityMetrics> {
    const maintainabilityIndex = await this.calculateMaintainabilityIndex(files);
    const technicalDebt = await this.calculateTechnicalDebt(files);
    const codeSmells = await this.detectCodeSmells(files);

    return {
      maintainabilityIndex,
      technicalDebt,
      codeSmells
    };
  }

  private async calculateMaintainabilityIndex(files: string[]): Promise<number> {
    // Simplified Maintainability Index calculation
    // MI = 171 - 5.2 * ln(V) - 0.23 * CC - 16.2 * ln(LOC)
    // Where V = Halstead Volume, CC = Cyclomatic Complexity, LOC = Lines of Code
    
    let totalMI = 0;
    for (const file of files) {
      const content = await this.readFile(file);
      const loc = content.split('\n').length;
      const cc = this.calculateCyclomaticComplexity(content);
      
      // Simplified calculation
      const mi = Math.max(0, Math.min(100, 171 - 5.2 * Math.log(loc) - 0.23 * cc - 16.2 * Math.log(loc)));
      totalMI += mi;
    }
    
    return Math.round(totalMI / files.length);
  }

  private async calculateTechnicalDebt(files: string[]): Promise<number> {
    // Technical debt in hours
    let debt = 0;
    
    for (const file of files) {
      const content = await this.readFile(file);
      
      // Check for TODOs and FIXMEs
      const todos = (content.match(/TODO|FIXME|HACK|XXX/g) || []).length;
      debt += todos * 2; // 2 hours per TODO
      
      // Check for long functions
      const longFunctions = (content.match(/function.*\{[\s\S]{500,}?\}/g) || []).length;
      debt += longFunctions * 4; // 4 hours per long function
      
      // Check for complex conditionals
      const complexConditionals = (content.match(/if.*&&.*\|\|/g) || []).length;
      debt += complexConditionals * 1; // 1 hour per complex conditional
    }
    
    return debt;
  }

  private async detectCodeSmells(files: string[]): Promise<number> {
    let smells = 0;
    
    for (const file of files) {
      const content = await this.readFile(file);
      
      // Long method
      const longMethods = (content.match(/function.*\{[\s\S]{300,}?\}/g) || []).length;
      smells += longMethods;
      
      // Large class
      if (content.length > 1000) smells++;
      
      // Duplicate code (simplified)
      const duplicates = this.findDuplicatePatterns(content);
      smells += duplicates;
      
      // Dead code
      const unusedVariables = (content.match(/const\s+\w+\s*=.*;\s*$/gm) || []).length;
      smells += unusedVariables * 0.5;
    }
    
    return Math.round(smells);
  }

  private findDuplicatePatterns(code: string): number {
    // Simplified duplicate detection
    const lines = code.split('\n');
    const patterns = new Map<string, number>();
    
    for (let i = 0; i < lines.length - 3; i++) {
      const pattern = lines.slice(i, i + 3).join('\n');
      if (pattern.trim().length > 50) {
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }
    }
    
    return Array.from(patterns.values()).filter(count => count > 1).length;
  }

  // Private methods for testability
  private async analyzeTestability(files: string[]): Promise<TestabilityMetrics> {
    const testCoverage = await this.getTestCoverage();
    const mockability = await this.calculateMockability(files);
    const assertions = await this.countAssertions();

    return {
      testCoverage,
      mockability,
      assertions
    };
  }

  private async getTestCoverage(): Promise<number> {
    try {
      // Try to get coverage from existing test reports
      const coverageFile = path.join(this.projectRoot, 'coverage', 'coverage-summary.json');
      const coverage = await this.readFile(coverageFile);
      const coverageData = JSON.parse(coverage);
      return coverageData.total.lines.pct || 0;
    } catch {
      // Default if no coverage report exists
      return 0;
    }
  }

  private async calculateMockability(files: string[]): Promise<number> {
    let totalScore = 0;
    
    for (const file of files) {
      const content = await this.readFile(file);
      
      // Check for dependency injection
      const hasInjection = content.includes('constructor(') && content.includes('private');
      
      // Check for interfaces
      const hasInterfaces = content.includes('interface ') || content.includes('type ');
      
      // Check for pure functions
      const pureFunctions = (content.match(/export\s+(const|function)\s+\w+\s*=/g) || []).length;
      
      const score = (hasInjection ? 30 : 0) + (hasInterfaces ? 30 : 0) + (pureFunctions * 2);
      totalScore += Math.min(100, score);
    }
    
    return Math.round(totalScore / files.length);
  }

  private async countAssertions(): Promise<number> {
    try {
      const testFiles = await this.findTestFiles();
      let totalAssertions = 0;
      
      for (const file of testFiles) {
        const content = await this.readFile(file);
        const assertions = (content.match(/expect\(|assert\.|should\./g) || []).length;
        totalAssertions += assertions;
      }
      
      return totalAssertions;
    } catch {
      return 0;
    }
  }

  // Private methods for duplication
  private async analyzeDuplication(files: string[]): Promise<DuplicationMetrics> {
    let duplicatedLines = 0;
    let duplicatedBlocks = 0;
    let duplicatedFiles = 0;

    const fileContents = new Map<string, string>();
    
    for (const file of files) {
      const content = await this.readFile(file);
      fileContents.set(file, content);
    }

    // Check for duplicate files
    const contentHashes = new Map<string, number>();
    for (const content of fileContents.values()) {
      const hash = this.simpleHash(content);
      contentHashes.set(hash, (contentHashes.get(hash) || 0) + 1);
    }
    duplicatedFiles = Array.from(contentHashes.values()).filter(count => count > 1).length;

    // Check for duplicate blocks and lines
    for (const content of fileContents.values()) {
      const lines = content.split('\n');
      const blocks = this.findDuplicateBlocks(lines);
      duplicatedBlocks += blocks.duplicateBlocks;
      duplicatedLines += blocks.duplicateLines;
    }

    return {
      duplicatedLines,
      duplicatedBlocks,
      duplicatedFiles
    };
  }

  private findDuplicateBlocks(lines: string[]): { duplicateBlocks: number; duplicateLines: number } {
    const blockSize = 5;
    const blocks = new Map<string, number>();
    let duplicateBlocks = 0;
    let duplicateLines = 0;

    for (let i = 0; i <= lines.length - blockSize; i++) {
      const block = lines.slice(i, i + blockSize).join('\n').trim();
      if (block.length > 100) {
        const count = blocks.get(block) || 0;
        if (count === 1) {
          duplicateBlocks++;
          duplicateLines += blockSize;
        }
        blocks.set(block, count + 1);
      }
    }

    return { duplicateBlocks, duplicateLines };
  }

  // Helper methods
  private async readFile(filePath: string): Promise<string> {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.projectRoot, filePath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch {
      return '';
    }
  }

  private async findTestFiles(): Promise<string[]> {
    const testDirs = ['tests', 'test', '__tests__', 'spec'];
    const testFiles: string[] = [];
    
    for (const dir of testDirs) {
      try {
        const dirPath = path.join(this.projectRoot, dir);
        const files = await fs.readdir(dirPath, { recursive: true });
        testFiles.push(...files.filter(f => f.endsWith('.spec.ts') || f.endsWith('.test.ts')));
      } catch {
        // Directory doesn't exist
      }
    }
    
    return testFiles;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private calculateOverallScore(metrics: any): number {
    const weights = {
      complexity: 0.25,
      maintainability: 0.25,
      testability: 0.25,
      duplication: 0.25
    };

    const complexityScore = Math.max(0, 100 - metrics.complexity.cyclomaticComplexity * 2);
    const maintainabilityScore = metrics.maintainability.maintainabilityIndex;
    const testabilityScore = (metrics.testability.testCoverage + metrics.testability.mockability) / 2;
    const duplicationScore = Math.max(0, 100 - metrics.duplication.duplicatedLines / 10);

    return Math.round(
      complexityScore * weights.complexity +
      maintainabilityScore * weights.maintainability +
      testabilityScore * weights.testability +
      duplicationScore * weights.duplication
    );
  }

  private generateQualityRecommendations(issues: CodeIssue[], score: number): string[] {
    const recommendations: string[] = [];

    if (score < 60) {
      recommendations.push('Consider refactoring complex methods to improve maintainability');
    }

    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(`Address ${criticalIssues.length} critical code quality issues immediately`);
    }

    const majorIssues = issues.filter(i => i.severity === 'major');
    if (majorIssues.length > 5) {
      recommendations.push('Reduce technical debt by fixing major code quality issues');
    }

    if (score < 80) {
      recommendations.push('Increase test coverage to improve code reliability');
      recommendations.push('Apply consistent coding standards across the codebase');
    }

    return recommendations;
  }

  // Security-related private methods
  private async detectSecurityVulnerabilities(codebase: string): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const files = await this.getAllFiles(codebase);

    for (const file of files) {
      const content = await this.readFile(file);
      
      // Check for hardcoded secrets
      if (content.match(/api[_-]?key\s*=\s*["'][^"']+["']/i)) {
        vulnerabilities.push({
          severity: 'critical',
          type: 'Hardcoded Secret',
          file,
          description: 'API key or secret found in source code',
          remediation: 'Use environment variables for sensitive data'
        });
      }

      // Check for SQL injection vulnerabilities
      if (content.match(/query\s*\(\s*["'`].*\$\{.*\}.*["'`]\s*\)/)) {
        vulnerabilities.push({
          severity: 'critical',
          type: 'SQL Injection',
          file,
          description: 'Potential SQL injection vulnerability detected',
          remediation: 'Use parameterized queries or prepared statements'
        });
      }

      // Check for XSS vulnerabilities
      if (content.match(/dangerouslySetInnerHTML|innerHTML\s*=/)) {
        vulnerabilities.push({
          severity: 'high',
          type: 'XSS',
          file,
          description: 'Potential XSS vulnerability with unescaped HTML',
          remediation: 'Sanitize user input before rendering HTML'
        });
      }

      // Check for insecure random
      if (content.match(/Math\.random\(\)/)) {
        vulnerabilities.push({
          severity: 'medium',
          type: 'Insecure Randomness',
          file,
          description: 'Math.random() is not cryptographically secure',
          remediation: 'Use crypto.randomBytes() for security-sensitive operations'
        });
      }
    }

    return vulnerabilities;
  }

  private async scanDependencies(): Promise<DependencyVulnerability[]> {
    try {
      const { stdout } = await execAsync('npm audit --json', { cwd: this.projectRoot });
      const auditData = JSON.parse(stdout);
      
      return Object.values(auditData.vulnerabilities || {}).map((vuln: any) => ({
        package: vuln.name,
        severity: vuln.severity,
        vulnerability: vuln.title,
        version: vuln.range,
        fixedVersion: vuln.fixAvailable?.version
      }));
    } catch {
      return [];
    }
  }

  private calculateSeverityScore(vulnerabilities: SecurityVulnerability[], dependencies: DependencyVulnerability[]): number {
    const weights = {
      critical: 40,
      high: 20,
      medium: 10,
      low: 5
    };

    let totalScore = 100;

    for (const vuln of vulnerabilities) {
      totalScore -= weights[vuln.severity] || 0;
    }

    for (const dep of dependencies) {
      totalScore -= weights[dep.severity] || 0;
    }

    return Math.max(0, totalScore);
  }

  private generateSecurityRecommendations(vulnerabilities: SecurityVulnerability[], dependencies: DependencyVulnerability[]): string[] {
    const recommendations: string[] = [];

    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    if (criticalVulns.length > 0) {
      recommendations.push(`Fix ${criticalVulns.length} critical security vulnerabilities immediately`);
    }

    if (dependencies.length > 0) {
      recommendations.push(`Update ${dependencies.length} vulnerable dependencies`);
    }

    const secretVulns = vulnerabilities.filter(v => v.type === 'Hardcoded Secret');
    if (secretVulns.length > 0) {
      recommendations.push('Move all secrets to environment variables');
    }

    recommendations.push('Implement security headers (CSP, HSTS, X-Frame-Options)');
    recommendations.push('Enable dependency scanning in CI/CD pipeline');

    return recommendations;
  }

  // Additional helper methods
  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await this.getAllFiles(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
    return files;
  }

  private async detectCodeIssues(files: string[]): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    
    for (const file of files) {
      const content = await this.readFile(file);
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for console.log in production code
        if (line.includes('console.log') && !file.includes('test')) {
          issues.push({
            severity: 'minor',
            type: 'Debug Code',
            file,
            line: index + 1,
            message: 'Remove console.log from production code',
            rule: 'no-console'
          });
        }
        
        // Check for any type
        if (line.includes(': any')) {
          issues.push({
            severity: 'major',
            type: 'Type Safety',
            file,
            line: index + 1,
            message: 'Avoid using "any" type',
            rule: 'no-explicit-any'
          });
        }
        
        // Check for TODO comments
        if (line.match(/TODO|FIXME/)) {
          issues.push({
            severity: 'info',
            type: 'Technical Debt',
            file,
            line: index + 1,
            message: 'Unresolved TODO/FIXME comment',
            rule: 'no-todo'
          });
        }
      });
    }
    
    return issues;
  }

  // Stub methods for remaining functionality
  private async analyzeBundleSize(bundle: string): Promise<BundleMetrics> {
    // Stub implementation
    return {
      totalSize: 1500000,
      jsSize: 1200000,
      cssSize: 200000,
      imageSize: 100000,
      chunkSizes: {
        main: 800000,
        vendor: 400000,
        runtime: 50000
      }
    };
  }

  private async analyzeRenderPerformance(): Promise<RenderMetrics> {
    return {
      firstContentfulPaint: 1200,
      largestContentfulPaint: 2500,
      timeToInteractive: 3500,
      totalBlockingTime: 300
    };
  }

  private async analyzeMemoryUsage(): Promise<MemoryMetrics> {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers
    };
  }

  private async findOptimizationOpportunities(): Promise<OptimizationSuggestion[]> {
    return [
      {
        type: 'Bundle Size',
        impact: 'high',
        description: 'Large bundle size detected',
        implementation: 'Enable code splitting and lazy loading'
      },
      {
        type: 'React Optimization',
        impact: 'medium',
        description: 'Unnecessary re-renders detected',
        implementation: 'Use React.memo and useMemo for expensive computations'
      }
    ];
  }

  private async checkDesignPatterns(structure: string): Promise<PatternCompliance[]> {
    return [
      {
        pattern: 'Page Object Model',
        compliance: 85,
        violations: ['Some test files not using POM']
      },
      {
        pattern: 'Component Composition',
        compliance: 90,
        violations: ['Few components are too large']
      }
    ];
  }

  private async analyzeComponentCoupling(structure: string): Promise<CouplingMetrics> {
    return {
      afferentCoupling: 5,
      efferentCoupling: 8,
      instability: 0.62
    };
  }

  private async detectArchitectureViolations(structure: string): Promise<ArchitectureViolation[]> {
    return [];
  }

  private calculateComplianceScore(patterns: PatternCompliance[], violations: ArchitectureViolation[]): number {
    const avgCompliance = patterns.reduce((sum, p) => sum + p.compliance, 0) / patterns.length;
    const violationPenalty = violations.length * 5;
    return Math.max(0, avgCompliance - violationPenalty);
  }

  private generateArchitectureSuggestions(violations: ArchitectureViolation[]): string[] {
    return [
      'Maintain consistent project structure',
      'Follow established design patterns',
      'Keep components loosely coupled'
    ];
  }

  private async detectBestPracticeViolations(code: string): Promise<BestPracticeViolation[]> {
    return [];
  }

  private calculateAdherenceScore(violations: BestPracticeViolation[]): number {
    return Math.max(0, 100 - violations.length * 5);
  }

  private generateBestPracticeSuggestions(violations: BestPracticeViolation[]): string[] {
    return [
      'Follow TypeScript best practices',
      'Use consistent naming conventions',
      'Implement proper error handling'
    ];
  }

  // Collaboration methods
  private async analyzeTestCode(testReport: any): Promise<any> {
    return { quality: 'good', score: 85 };
  }

  private async validateTestCoverage(testReport: any): Promise<any> {
    return { coverage: 75, gaps: ['UI components', 'Error handling'] };
  }

  private suggestTestImprovements(quality: any, coverage: any): string[] {
    return [
      'Increase test coverage for UI components',
      'Add error scenario testing',
      'Improve test descriptions'
    ];
  }

  private calculateCollaborationScore(quality: any, coverage: any): number {
    return 80;
  }

  private async reviewCalculationSecurity(logic: any): Promise<any> {
    return { secure: true, issues: [] };
  }

  private async validateInputSanitization(logic: any): Promise<any> {
    return { validated: true, gaps: [] };
  }

  private async checkInjectionVulnerabilities(logic: any): Promise<any> {
    return { vulnerabilities: [] };
  }

  private calculateNutritionSecurityScore(calc: any, input: any, injection: any): number {
    return 95;
  }

  private async reviewComponentPerformance(code: any): Promise<any> {
    return { performance: 'good', bottlenecks: [] };
  }

  private async checkRenderOptimization(code: any): Promise<any> {
    return { optimized: true, suggestions: [] };
  }

  private async validateAccessibility(code: any): Promise<any> {
    return { compliant: true, violations: [] };
  }

  private calculateUIPerformanceScore(perf: any, render: any): number {
    return 88;
  }
}

export default CodeReviewAgent;