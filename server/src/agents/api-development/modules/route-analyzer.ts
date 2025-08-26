import { Express } from 'express';
import { ApiAgentConfig } from '../config/agent.config';
import { ApiEndpoint } from '../index';
import { logger } from '../utils/logger';

export class RouteAnalyzer {
  private app: Express;
  private config: ApiAgentConfig;

  constructor(app: Express, config: ApiAgentConfig) {
    this.app = app;
    this.config = config;
  }

  async analyze(endpoints: Map<string, ApiEndpoint>): Promise<{
    totalEndpoints: number;
    byMethod: Record<string, number>;
    byVersion: Record<string, number>;
    securedEndpoints: number;
    publicEndpoints: number;
    validatedEndpoints: number;
    undocumentedEndpoints: number;
    recommendations: string[];
  }> {
    const analysis = {
      totalEndpoints: endpoints.size,
      byMethod: {} as Record<string, number>,
      byVersion: {} as Record<string, number>,
      securedEndpoints: 0,
      publicEndpoints: 0,
      validatedEndpoints: 0,
      undocumentedEndpoints: 0,
      recommendations: [] as string[]
    };

    for (const [key, endpoint] of endpoints) {
      // Count by method
      analysis.byMethod[endpoint.method] = (analysis.byMethod[endpoint.method] || 0) + 1;

      // Count by version
      const version = endpoint.version || 'unversioned';
      analysis.byVersion[version] = (analysis.byVersion[version] || 0) + 1;

      // Check security
      if (endpoint.middleware && endpoint.middleware.length > 0) {
        analysis.securedEndpoints++;
      } else {
        analysis.publicEndpoints++;
      }

      // Check validation
      if (endpoint.validation) {
        analysis.validatedEndpoints++;
      }

      // Check documentation
      if (!endpoint.description) {
        analysis.undocumentedEndpoints++;
      }
    }

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  extractExpressRoutes(): any[] {
    const routes: any[] = [];
    
    if (this.app._router && this.app._router.stack) {
      this.app._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          routes.push({
            path: middleware.route.path,
            method: Object.keys(middleware.route.methods)[0],
            middleware: middleware.route.stack.slice(0, -1).map((m: any) => m.name),
            description: null
          });
        } else if (middleware.name === 'router') {
          middleware.handle.stack.forEach((handler: any) => {
            if (handler.route) {
              routes.push({
                path: handler.route.path,
                method: Object.keys(handler.route.methods)[0],
                middleware: handler.route.stack.slice(0, -1).map((m: any) => m.name),
                description: null
              });
            }
          });
        }
      });
    }

    return routes;
  }

  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    if (analysis.publicEndpoints > analysis.securedEndpoints) {
      recommendations.push('Consider adding authentication to more endpoints');
    }

    // Validation recommendations
    const validationRate = (analysis.validatedEndpoints / analysis.totalEndpoints) * 100;
    if (validationRate < 50) {
      recommendations.push(`Only ${validationRate.toFixed(0)}% of endpoints have validation`);
    }

    // Documentation recommendations
    if (analysis.undocumentedEndpoints > 0) {
      recommendations.push(`${analysis.undocumentedEndpoints} endpoints lack documentation`);
    }

    // Method distribution recommendations
    if (!analysis.byMethod['GET'] || analysis.byMethod['GET'] < 2) {
      recommendations.push('Consider adding more GET endpoints for data retrieval');
    }

    // Versioning recommendations
    if (analysis.byVersion['unversioned'] > 0) {
      recommendations.push('Some endpoints are not versioned');
    }

    return recommendations;
  }

  generateReport(): string {
    const routes = this.extractExpressRoutes();
    let report = '# API Routes Report\n\n';
    report += `Total Routes: ${routes.length}\n\n`;
    
    report += '## Routes by Method\n';
    const byMethod = routes.reduce((acc: any, route) => {
      acc[route.method] = (acc[route.method] || 0) + 1;
      return acc;
    }, {});
    
    for (const [method, count] of Object.entries(byMethod)) {
      report += `- ${method}: ${count}\n`;
    }
    
    report += '\n## All Routes\n';
    for (const route of routes) {
      report += `- ${route.method.toUpperCase()} ${route.path}\n`;
    }
    
    return report;
  }
}

export default RouteAnalyzer;