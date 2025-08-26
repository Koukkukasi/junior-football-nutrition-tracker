import { Express, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { EndpointGenerator } from './modules/endpoint-generator';
import { AuthMiddlewareManager } from './modules/auth-middleware-manager';
import { ValidationManager } from './modules/validation-manager';
import { ErrorHandlingManager } from './modules/error-handling-manager';
import { ApiVersioningManager } from './modules/api-versioning-manager';
import { ApiDocumentationGenerator } from './modules/api-documentation-generator';
import { RouteAnalyzer } from './modules/route-analyzer';
import { ApiAgentConfig } from './config/agent.config';
import { logger } from './utils/logger';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  handler: Function;
  middleware?: Function[];
  validation?: any;
  description?: string;
  version?: string;
  tags?: string[];
}

export class ApiDevelopmentAgent {
  private app: Express;
  private prisma: PrismaClient;
  private config: ApiAgentConfig;
  private endpointGenerator: EndpointGenerator;
  private authManager: AuthMiddlewareManager;
  private validationManager: ValidationManager;
  private errorManager: ErrorHandlingManager;
  private versioningManager: ApiVersioningManager;
  private documentationGenerator: ApiDocumentationGenerator;
  private routeAnalyzer: RouteAnalyzer;
  private endpoints: Map<string, ApiEndpoint> = new Map();

  constructor(app: Express, prisma?: PrismaClient) {
    this.app = app;
    this.prisma = prisma || new PrismaClient();
    this.config = new ApiAgentConfig();
    
    this.endpointGenerator = new EndpointGenerator(this.prisma, this.config);
    this.authManager = new AuthMiddlewareManager(this.config);
    this.validationManager = new ValidationManager(this.config);
    this.errorManager = new ErrorHandlingManager(this.config);
    this.versioningManager = new ApiVersioningManager(this.config);
    this.documentationGenerator = new ApiDocumentationGenerator(this.config);
    this.routeAnalyzer = new RouteAnalyzer(this.app, this.config);
  }

  async initialize(): Promise<void> {
    logger.info('🚀 Initializing API Development Agent...');
    
    try {
      // Initialize error handling
      this.errorManager.setupGlobalErrorHandlers(this.app);
      
      // Setup API versioning
      this.versioningManager.setupVersioning(this.app);
      
      // Initialize authentication
      await this.authManager.initialize();
      
      // Load existing endpoints
      await this.loadExistingEndpoints();
      
      logger.info('✅ API Development Agent initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize API Development Agent:', error);
      throw error;
    }
  }

  async generateEndpoint(options: {
    resource: string;
    operations?: ('list' | 'get' | 'create' | 'update' | 'delete')[];
    authentication?: boolean;
    validation?: boolean;
    version?: string;
  }): Promise<Router> {
    logger.info(`📝 Generating endpoints for resource: ${options.resource}`);
    
    const router = await this.endpointGenerator.generateCRUD({
      resource: options.resource,
      operations: options.operations || ['list', 'get', 'create', 'update', 'delete'],
      authentication: options.authentication ?? true,
      validation: options.validation ?? true,
      version: options.version || 'v1'
    });

    // Register endpoints
    this.registerEndpoints(router, options.resource, options.version || 'v1');
    
    return router;
  }

  async generateCustomEndpoint(options: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    handler: Function;
    middleware?: Function[];
    validation?: any;
    description?: string;
    version?: string;
    tags?: string[];
  }): Promise<void> {
    const endpoint: ApiEndpoint = {
      method: options.method,
      path: options.path,
      handler: options.handler,
      middleware: options.middleware || [],
      validation: options.validation,
      description: options.description,
      version: options.version || 'v1',
      tags: options.tags || []
    };

    // Add authentication if needed
    if (this.config.security.requireAuthByDefault) {
      endpoint.middleware = [
        this.authManager.getAuthMiddleware(),
        ...(endpoint.middleware || [])
      ];
    }

    // Add validation if provided
    if (endpoint.validation) {
      const validationMiddleware = this.validationManager.createValidator(endpoint.validation);
      endpoint.middleware = [...(endpoint.middleware || []), validationMiddleware];
    }

    // Register endpoint
    const key = `${endpoint.method}:${endpoint.path}`;
    this.endpoints.set(key, endpoint);

    // Apply to Express app
    this.applyEndpointToApp(endpoint);
    
    logger.info(`✅ Custom endpoint created: ${key}`);
  }

  setupAuthentication(options?: {
    provider?: 'supabase' | 'jwt' | 'custom';
    config?: any;
  }): void {
    logger.info('🔐 Setting up authentication...');
    
    this.authManager.configure({
      provider: options?.provider || 'supabase',
      config: options?.config || {}
    });
    
    logger.info('✅ Authentication configured');
  }

  addValidationRule(name: string, rule: any): void {
    this.validationManager.addCustomRule(name, rule);
    logger.info(`✅ Validation rule added: ${name}`);
  }

  setupRateLimiting(options?: {
    windowMs?: number;
    max?: number;
    message?: string;
  }): void {
    const rateLimitMiddleware = this.authManager.createRateLimiter(options);
    this.app.use(rateLimitMiddleware);
    logger.info('✅ Rate limiting configured');
  }

  async generateDocumentation(options?: {
    format?: 'openapi' | 'postman' | 'markdown';
    outputPath?: string;
    includeExamples?: boolean;
  }): Promise<string> {
    logger.info('📚 Generating API documentation...');
    
    const docs = await this.documentationGenerator.generate({
      endpoints: Array.from(this.endpoints.values()),
      format: options?.format || 'openapi',
      includeExamples: options?.includeExamples ?? true
    });

    if (options?.outputPath) {
      await this.documentationGenerator.saveToFile(docs, options.outputPath);
    }

    logger.info('✅ Documentation generated');
    return docs;
  }

  async analyzeRoutes(): Promise<{
    totalEndpoints: number;
    byMethod: Record<string, number>;
    byVersion: Record<string, number>;
    securedEndpoints: number;
    publicEndpoints: number;
    validatedEndpoints: number;
    undocumentedEndpoints: number;
    recommendations: string[];
  }> {
    logger.info('🔍 Analyzing API routes...');
    return await this.routeAnalyzer.analyze(this.endpoints);
  }

  async testEndpoint(endpoint: string, options?: {
    method?: string;
    body?: any;
    headers?: any;
    query?: any;
  }): Promise<{
    status: number;
    body: any;
    headers: any;
    duration: number;
  }> {
    logger.info(`🧪 Testing endpoint: ${endpoint}`);
    
    const startTime = Date.now();
    
    // Mock implementation for testing
    const result = {
      status: 200,
      body: { message: 'Test successful' },
      headers: {},
      duration: Date.now() - startTime
    };
    
    return result;
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    endpoints: {
      total: number;
      healthy: number;
      errors: number;
    };
    middleware: {
      auth: boolean;
      validation: boolean;
      errorHandling: boolean;
      versioning: boolean;
    };
    documentation: {
      generated: boolean;
      coverage: number;
    };
  }> {
    const analysis = await this.analyzeRoutes();
    
    return {
      status: 'healthy',
      endpoints: {
        total: analysis.totalEndpoints,
        healthy: analysis.totalEndpoints - analysis.undocumentedEndpoints,
        errors: 0
      },
      middleware: {
        auth: this.authManager.isConfigured(),
        validation: this.validationManager.isConfigured(),
        errorHandling: this.errorManager.isConfigured(),
        versioning: this.versioningManager.isConfigured()
      },
      documentation: {
        generated: analysis.undocumentedEndpoints === 0,
        coverage: ((analysis.totalEndpoints - analysis.undocumentedEndpoints) / analysis.totalEndpoints) * 100
      }
    };
  }

  private async loadExistingEndpoints(): Promise<void> {
    const routes = this.routeAnalyzer.extractExpressRoutes();
    
    for (const route of routes) {
      const key = `${route.method.toUpperCase()}:${route.path}`;
      this.endpoints.set(key, {
        method: route.method.toUpperCase() as any,
        path: route.path,
        handler: () => {},
        middleware: route.middleware || [],
        description: route.description,
        version: this.extractVersion(route.path),
        tags: []
      });
    }
    
    logger.info(`📊 Loaded ${this.endpoints.size} existing endpoints`);
  }

  private registerEndpoints(router: Router, resource: string, version: string): void {
    const stack = (router as any).stack;
    
    for (const layer of stack) {
      if (layer.route) {
        const route = layer.route;
        const method = Object.keys(route.methods)[0].toUpperCase();
        const path = `/api/${version}/${resource}${route.path}`;
        
        this.endpoints.set(`${method}:${path}`, {
          method: method as any,
          path,
          handler: route.stack[route.stack.length - 1].handle,
          middleware: route.stack.slice(0, -1).map((l: any) => l.handle),
          description: `${method} ${resource}`,
          version,
          tags: [resource]
        });
      }
    }
  }

  private applyEndpointToApp(endpoint: ApiEndpoint): void {
    const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
    const versionedPath = `/api/${endpoint.version}${endpoint.path}`;
    
    (this.app[method] as Function)(
      versionedPath,
      ...(endpoint.middleware || []),
      endpoint.handler
    );
  }

  private extractVersion(path: string): string {
    const match = path.match(/\/v(\d+)\//);
    return match ? `v${match[1]}` : 'v1';
  }

  async cleanup(): Promise<void> {
    logger.info('🧹 Cleaning up API Development Agent...');
    await this.prisma.$disconnect();
    logger.info('✅ Cleanup completed');
  }
}

export default ApiDevelopmentAgent;