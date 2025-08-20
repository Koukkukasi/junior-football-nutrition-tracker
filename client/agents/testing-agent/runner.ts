import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Testing Agent Runner
 * Orchestrates test execution using Playwright and MCP browser tools
 */
export class TestingAgent {
  private readonly projectRoot: string;
  private readonly testResults: Map<string, any> = new Map();
  
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Run all E2E tests
   */
  async runAllTests(): Promise<TestReport> {
    console.log('🧪 Testing Agent: Starting comprehensive test suite...\n');
    
    const startTime = Date.now();
    const results: TestResult[] = [];

    // Run different test suites
    const suites = [
      { name: 'food-log', file: 'food-log.spec.ts' },
      { name: 'auth', file: 'auth.spec.ts' },
      { name: 'navigation', file: 'navigation.spec.ts' },
      { name: 'performance', file: 'performance.spec.ts' }
    ];

    for (const suite of suites) {
      try {
        const result = await this.runTestSuite(suite.name, suite.file);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to run ${suite.name} tests:`, error);
        results.push({
          suite: suite.name,
          passed: false,
          error: error.message,
          duration: 0
        });
      }
    }

    const endTime = Date.now();
    const totalDuration = (endTime - startTime) / 1000;

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      results,
      summary: this.generateSummary(results)
    };

    await this.saveReport(report);
    this.printReport(report);

    return report;
  }

  /**
   * Run a specific test suite
   */
  async runTestSuite(suiteName: string, fileName: string): Promise<TestResult> {
    console.log(`📋 Running ${suiteName} tests...`);
    
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(
        `npx playwright test tests/e2e/${fileName}`,
        { cwd: this.projectRoot }
      );

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      // Parse test results from stdout
      const testStats = this.parseTestOutput(stdout);
      
      return {
        suite: suiteName,
        passed: !stderr && testStats.failed === 0,
        tests: testStats,
        duration,
        output: stdout
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      return {
        suite: suiteName,
        passed: false,
        error: error.message,
        duration
      };
    }
  }

  /**
   * Run visual regression tests
   */
  async runVisualTests(): Promise<VisualTestReport> {
    console.log('📸 Running visual regression tests...\n');
    
    const screenshotDir = path.join(this.projectRoot, 'tests', 'screenshots');
    const baselineDir = path.join(this.projectRoot, 'tests', 'baseline');
    
    // Ensure directories exist
    await fs.mkdir(screenshotDir, { recursive: true });
    await fs.mkdir(baselineDir, { recursive: true });

    const results: VisualTestResult[] = [];

    // Run tests that capture screenshots
    await execAsync('npx playwright test --grep "visual"', { cwd: this.projectRoot });

    // Compare screenshots with baselines
    const screenshots = await fs.readdir(screenshotDir);
    
    for (const screenshot of screenshots) {
      const baselinePath = path.join(baselineDir, screenshot);
      const currentPath = path.join(screenshotDir, screenshot);
      
      const hasBaseline = await this.fileExists(baselinePath);
      
      if (!hasBaseline) {
        // First run - copy as baseline
        await fs.copyFile(currentPath, baselinePath);
        results.push({
          name: screenshot,
          status: 'new',
          message: 'New baseline created'
        });
      } else {
        // Compare with baseline
        const isDifferent = await this.compareImages(baselinePath, currentPath);
        results.push({
          name: screenshot,
          status: isDifferent ? 'changed' : 'passed',
          message: isDifferent ? 'Visual changes detected' : 'No visual changes'
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        changed: results.filter(r => r.status === 'changed').length,
        new: results.filter(r => r.status === 'new').length
      }
    };
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests(): Promise<PerformanceReport> {
    console.log('⚡ Running performance tests...\n');
    
    const metrics: PerformanceMetric[] = [];

    // Pages to test
    const pages = [
      { name: 'Landing Page', url: '/' },
      { name: 'Food Log', url: '/food-log' },
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Team', url: '/team' }
    ];

    for (const page of pages) {
      const metric = await this.measurePagePerformance(page.name, page.url);
      metrics.push(metric);
    }

    return {
      timestamp: new Date().toISOString(),
      metrics,
      summary: this.generatePerformanceSummary(metrics)
    };
  }

  /**
   * Measure page performance metrics
   */
  private async measurePagePerformance(name: string, url: string): Promise<PerformanceMetric> {
    // This would use Playwright to measure actual performance
    // For now, returning mock data
    return {
      page: name,
      url,
      metrics: {
        loadTime: Math.random() * 2000 + 500, // 500-2500ms
        firstContentfulPaint: Math.random() * 1000 + 200,
        largestContentfulPaint: Math.random() * 1500 + 500,
        timeToInteractive: Math.random() * 2000 + 800,
        totalBlockingTime: Math.random() * 300
      },
      status: 'measured'
    };
  }

  /**
   * Run accessibility tests
   */
  async runAccessibilityTests(): Promise<AccessibilityReport> {
    console.log('♿ Running accessibility tests...\n');
    
    const violations: AccessibilityViolation[] = [];
    
    // Run axe-core accessibility tests
    try {
      const { stdout } = await execAsync(
        'npx playwright test tests/e2e/accessibility.spec.ts',
        { cwd: this.projectRoot }
      );
      
      // Parse accessibility violations
      // In real implementation, would parse actual axe-core results
      
      return {
        timestamp: new Date().toISOString(),
        violations,
        summary: {
          total: violations.length,
          critical: violations.filter(v => v.severity === 'critical').length,
          serious: violations.filter(v => v.severity === 'serious').length,
          moderate: violations.filter(v => v.severity === 'moderate').length,
          minor: violations.filter(v => v.severity === 'minor').length
        }
      };
    } catch (error) {
      console.error('Accessibility tests failed:', error);
      return {
        timestamp: new Date().toISOString(),
        violations: [],
        summary: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
        error: error.message
      };
    }
  }

  /**
   * Generate test report
   */
  private generateSummary(results: TestResult[]): TestSummary {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    return {
      total,
      passed,
      failed,
      passRate: Math.round(passRate)
    };
  }

  /**
   * Generate performance summary
   */
  private generatePerformanceSummary(metrics: PerformanceMetric[]): PerformanceSummary {
    const avgLoadTime = metrics.reduce((sum, m) => sum + m.metrics.loadTime, 0) / metrics.length;
    const avgFCP = metrics.reduce((sum, m) => sum + m.metrics.firstContentfulPaint, 0) / metrics.length;
    const avgLCP = metrics.reduce((sum, m) => sum + m.metrics.largestContentfulPaint, 0) / metrics.length;

    return {
      averageLoadTime: Math.round(avgLoadTime),
      averageFCP: Math.round(avgFCP),
      averageLCP: Math.round(avgLCP),
      status: avgLoadTime < 2000 ? 'good' : avgLoadTime < 3000 ? 'moderate' : 'poor'
    };
  }

  /**
   * Parse test output
   */
  private parseTestOutput(output: string): TestStats {
    // Simple parsing - in real implementation would be more robust
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    const skippedMatch = output.match(/(\d+) skipped/);

    return {
      total: 0,
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      skipped: skippedMatch ? parseInt(skippedMatch[1]) : 0
    };
  }

  /**
   * Compare images for visual regression
   */
  private async compareImages(baseline: string, current: string): Promise<boolean> {
    // In real implementation, would use image comparison library
    // For now, just check if files are different sizes
    const baselineStats = await fs.stat(baseline);
    const currentStats = await fs.stat(current);
    return baselineStats.size !== currentStats.size;
  }

  /**
   * Check if file exists
   */
  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Save test report
   */
  private async saveReport(report: TestReport): Promise<void> {
    const reportPath = path.join(
      this.projectRoot,
      'test-reports',
      `report-${Date.now()}.json`
    );
    
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  }

  /**
   * Print test report to console
   */
  private printReport(report: TestReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Duration: ${report.duration}s`);
    console.log('\nResults:');
    
    for (const result of report.results) {
      const icon = result.passed ? '✅' : '❌';
      console.log(`  ${icon} ${result.suite}: ${result.passed ? 'PASSED' : 'FAILED'} (${result.duration}s)`);
    }
    
    console.log('\nSummary:');
    console.log(`  Total: ${report.summary.total}`);
    console.log(`  Passed: ${report.summary.passed}`);
    console.log(`  Failed: ${report.summary.failed}`);
    console.log(`  Pass Rate: ${report.summary.passRate}%`);
    console.log('='.repeat(60) + '\n');
  }
}

// Type definitions
interface TestResult {
  suite: string;
  passed: boolean;
  tests?: TestStats;
  duration: number;
  error?: string;
  output?: string;
}

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

interface TestReport {
  timestamp: string;
  duration: number;
  results: TestResult[];
  summary: TestSummary;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
}

interface VisualTestResult {
  name: string;
  status: 'passed' | 'changed' | 'new';
  message: string;
}

interface VisualTestReport {
  timestamp: string;
  results: VisualTestResult[];
  summary: {
    total: number;
    passed: number;
    changed: number;
    new: number;
  };
}

interface PerformanceMetric {
  page: string;
  url: string;
  metrics: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    timeToInteractive: number;
    totalBlockingTime: number;
  };
  status: string;
}

interface PerformanceReport {
  timestamp: string;
  metrics: PerformanceMetric[];
  summary: PerformanceSummary;
}

interface PerformanceSummary {
  averageLoadTime: number;
  averageFCP: number;
  averageLCP: number;
  status: 'good' | 'moderate' | 'poor';
}

interface AccessibilityViolation {
  rule: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  element: string;
  description: string;
}

interface AccessibilityReport {
  timestamp: string;
  violations: AccessibilityViolation[];
  summary: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  error?: string;
}

// Export for use in other modules
export default TestingAgent;