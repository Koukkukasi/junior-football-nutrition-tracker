import { Express, Request, Response, NextFunction } from 'express';
import { ApiAgentConfig } from '../config/agent.config';
import { logger } from '../utils/logger';

export class ApiVersioningManager {
  private config: ApiAgentConfig;
  private versionMap: Map<string, Map<string, Function>> = new Map();
  private deprecatedVersions: Set<string> = new Set();

  constructor(config: ApiAgentConfig) {
    this.config = config;
  }

  setupVersioning(app: Express): void {
    if (!this.config.versioning.enabled) {
      logger.info('API versioning is disabled');
      return;
    }

    // Add version extraction middleware
    app.use(this.versionExtractorMiddleware.bind(this));

    // Add deprecation warning middleware
    if (this.config.versioning.deprecationWarning) {
      app.use(this.deprecationWarningMiddleware.bind(this));
    }

    logger.info('✅ API versioning configured');
  }

  private versionExtractorMiddleware(req: Request, res: Response, next: NextFunction): void {
    let version = this.config.versioning.defaultVersion;

    // Check header
    if (req.headers[this.config.versioning.headerName]) {
      version = req.headers[this.config.versioning.headerName] as string;
    }

    // Check query parameter
    if (req.query[this.config.versioning.queryParam]) {
      version = req.query[this.config.versioning.queryParam] as string;
    }

    // Check URL path
    const pathMatch = req.path.match(/\/v(\d+)\//);
    if (pathMatch) {
      version = `v${pathMatch[1]}`;
    }

    // Validate version
    if (!this.config.versioning.supportedVersions.includes(version)) {
      version = this.config.versioning.defaultVersion;
    }

    (req as any).apiVersion = version;
    res.setHeader('X-API-Version', version);
    
    next();
  }

  private deprecationWarningMiddleware(req: Request, res: Response, next: NextFunction): void {
    const version = (req as any).apiVersion;
    
    if (this.deprecatedVersions.has(version)) {
      res.setHeader('X-API-Deprecation', 'true');
      res.setHeader('X-API-Deprecation-Date', '2025-01-01');
      res.setHeader('X-API-Sunset', '2025-06-01');
      res.setHeader('Link', `</api/${this.config.versioning.defaultVersion}>; rel="successor-version"`);
    }
    
    next();
  }

  registerVersionedEndpoint(version: string, path: string, handler: Function): void {
    if (!this.versionMap.has(version)) {
      this.versionMap.set(version, new Map());
    }
    
    this.versionMap.get(version)!.set(path, handler);
    logger.info(`Registered endpoint: ${version} ${path}`);
  }

  markAsDeprecated(version: string, sunset?: Date): void {
    this.deprecatedVersions.add(version);
    logger.warn(`API version ${version} marked as deprecated. Sunset: ${sunset || 'TBD'}`);
  }

  getVersionedHandler(version: string, path: string): Function | undefined {
    return this.versionMap.get(version)?.get(path);
  }

  getAllVersions(): string[] {
    return this.config.versioning.supportedVersions;
  }

  isVersionSupported(version: string): boolean {
    return this.config.versioning.supportedVersions.includes(version);
  }

  isConfigured(): boolean {
    return this.config.versioning.enabled;
  }

  getVersionInfo(): {
    current: string;
    supported: string[];
    deprecated: string[];
  } {
    return {
      current: this.config.versioning.defaultVersion,
      supported: this.config.versioning.supportedVersions,
      deprecated: Array.from(this.deprecatedVersions)
    };
  }

  createVersionRouter(version: string): any {
    return {
      use: (path: string, handler: Function) => {
        this.registerVersionedEndpoint(version, path, handler);
      },
      get: (path: string, handler: Function) => {
        this.registerVersionedEndpoint(version, `GET:${path}`, handler);
      },
      post: (path: string, handler: Function) => {
        this.registerVersionedEndpoint(version, `POST:${path}`, handler);
      },
      put: (path: string, handler: Function) => {
        this.registerVersionedEndpoint(version, `PUT:${path}`, handler);
      },
      patch: (path: string, handler: Function) => {
        this.registerVersionedEndpoint(version, `PATCH:${path}`, handler);
      },
      delete: (path: string, handler: Function) => {
        this.registerVersionedEndpoint(version, `DELETE:${path}`, handler);
      }
    };
  }
}

export default ApiVersioningManager;