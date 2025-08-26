export interface SecurityConfig {
  requireAuthByDefault: boolean;
  allowedOrigins: string[];
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    max: number;
  };
  helmet: {
    enabled: boolean;
    config: any;
  };
  cors: {
    enabled: boolean;
    credentials: boolean;
  };
}

export interface ValidationConfig {
  strictMode: boolean;
  sanitizeInput: boolean;
  maxRequestSize: string;
  customValidators: Map<string, Function>;
}

export interface DocumentationConfig {
  autoGenerate: boolean;
  openApiVersion: string;
  servers: Array<{ url: string; description: string }>;
  includeExamples: boolean;
  outputFormats: string[];
}

export class ApiAgentConfig {
  public readonly agentName = 'API Development Agent';
  public readonly version = '1.0.0';
  public readonly description = 'Manages RESTful API endpoints, authentication, validation, and documentation';

  public readonly security: SecurityConfig = {
    requireAuthByDefault: true,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    helmet: {
      enabled: true,
      config: {
        contentSecurityPolicy: false
      }
    },
    cors: {
      enabled: true,
      credentials: true
    }
  };

  public readonly validation: ValidationConfig = {
    strictMode: true,
    sanitizeInput: true,
    maxRequestSize: '10mb',
    customValidators: new Map()
  };

  public readonly documentation: DocumentationConfig = {
    autoGenerate: true,
    openApiVersion: '3.0.0',
    servers: [
      { url: 'http://localhost:3001', description: 'Development server' },
      { url: 'https://api.nutrition-tracker.com', description: 'Production server' }
    ],
    includeExamples: true,
    outputFormats: ['openapi', 'postman', 'markdown']
  };

  public readonly versioning = {
    enabled: true,
    defaultVersion: 'v1',
    supportedVersions: ['v1', 'v2'],
    headerName: 'api-version',
    queryParam: 'version',
    deprecationWarning: true
  };

  public readonly errorHandling = {
    exposeStackTrace: process.env.NODE_ENV !== 'production',
    logErrors: true,
    customErrorMessages: new Map<number, string>([
      [400, 'Bad Request - Invalid input data'],
      [401, 'Unauthorized - Please authenticate'],
      [403, 'Forbidden - Insufficient permissions'],
      [404, 'Not Found - Resource does not exist'],
      [409, 'Conflict - Resource already exists'],
      [422, 'Unprocessable Entity - Validation failed'],
      [429, 'Too Many Requests - Rate limit exceeded'],
      [500, 'Internal Server Error - Something went wrong'],
      [503, 'Service Unavailable - Please try again later']
    ])
  };

  public readonly monitoring = {
    enabled: true,
    logRequests: true,
    logResponses: false,
    performanceTracking: true,
    slowRequestThreshold: 1000, // ms
    metricsEndpoint: '/api/metrics'
  };

  public readonly caching = {
    enabled: true,
    defaultTTL: 300, // 5 minutes
    strategies: {
      GET: true,
      POST: false,
      PUT: false,
      DELETE: false,
      PATCH: false
    }
  };

  public readonly pagination = {
    defaultLimit: 20,
    maxLimit: 100,
    limitParam: 'limit',
    offsetParam: 'offset',
    pageParam: 'page'
  };

  public readonly responseFormat = {
    envelope: true,
    successKey: 'data',
    errorKey: 'error',
    metaKey: 'meta',
    includeTimestamp: true,
    includeRequestId: true
  };

  public getEnvironmentConfig(): any {
    return {
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      baseUrl: process.env.BASE_URL || 'http://localhost:3001',
      debug: process.env.DEBUG === 'true'
    };
  }

  public isProductionMode(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  public getAuthProvider(): string {
    return process.env.AUTH_PROVIDER || 'supabase';
  }

  public getDatabaseUrl(): string {
    return process.env.DATABASE_URL || '';
  }
}

export default ApiAgentConfig;