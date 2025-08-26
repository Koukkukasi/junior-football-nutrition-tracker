import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiAgentConfig } from '../config/agent.config';
import { logger } from '../utils/logger';

export interface AuthConfig {
  provider: 'supabase' | 'jwt' | 'custom';
  config: any;
}

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class AuthMiddlewareManager {
  private config: ApiAgentConfig;
  private authProvider: string;
  private authConfig: any;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(config: ApiAgentConfig) {
    this.config = config;
    this.authProvider = 'supabase';
    this.authConfig = {};
  }

  async initialize(): Promise<void> {
    logger.info('🔐 Initializing authentication middleware...');
    
    // Load auth configuration
    this.authProvider = this.config.getAuthProvider();
    
    switch (this.authProvider) {
      case 'supabase':
        await this.initializeSupabase();
        break;
      case 'jwt':
        await this.initializeJWT();
        break;
      default:
        logger.warn('No authentication provider configured');
    }
    
    logger.info('✅ Authentication middleware initialized');
  }

  configure(options: AuthConfig): void {
    this.authProvider = options.provider;
    this.authConfig = options.config;
    logger.info(`Authentication configured with provider: ${this.authProvider}`);
  }

  getAuthMiddleware(): Function {
    switch (this.authProvider) {
      case 'supabase':
        return this.supabaseAuth.bind(this);
      case 'jwt':
        return this.jwtAuth.bind(this);
      case 'custom':
        return this.customAuth.bind(this);
      default:
        return this.noAuth.bind(this);
    }
  }

  createRateLimiter(options?: RateLimitOptions): Function {
    const config = {
      windowMs: options?.windowMs || this.config.security.rateLimiting.windowMs,
      max: options?.max || this.config.security.rateLimiting.max,
      message: options?.message || 'Too many requests, please try again later.',
      skipSuccessfulRequests: options?.skipSuccessfulRequests || false,
      skipFailedRequests: options?.skipFailedRequests || false
    };

    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getRateLimitKey(req);
      const now = Date.now();
      
      let record = this.rateLimitStore.get(key);
      
      if (!record || now > record.resetTime) {
        record = {
          count: 0,
          resetTime: now + config.windowMs
        };
      }
      
      record.count++;
      this.rateLimitStore.set(key, record);
      
      if (record.count > config.max) {
        res.setHeader('X-RateLimit-Limit', config.max.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
        res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000).toString());
        
        return res.status(429).json({
          error: {
            status: 429,
            message: config.message
          }
        });
      }
      
      res.setHeader('X-RateLimit-Limit', config.max.toString());
      res.setHeader('X-RateLimit-Remaining', (config.max - record.count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
      
      next();
    };
  }

  createRoleMiddleware(allowedRoles: string[]): Function {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          error: {
            status: 401,
            message: 'Authentication required'
          }
        });
      }
      
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: {
            status: 403,
            message: 'Insufficient permissions'
          }
        });
      }
      
      next();
    };
  }

  createApiKeyMiddleware(): Function {
    return (req: Request, res: Response, next: NextFunction) => {
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        return res.status(401).json({
          error: {
            status: 401,
            message: 'API key required'
          }
        });
      }
      
      // Validate API key (would check against database in production)
      if (!this.validateApiKey(apiKey)) {
        return res.status(401).json({
          error: {
            status: 401,
            message: 'Invalid API key'
          }
        });
      }
      
      next();
    };
  }

  private async supabaseAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return this.sendUnauthorized(res, 'No token provided');
      }
      
      // In production, verify with Supabase
      // For now, decode JWT locally
      const decoded = jwt.decode(token) as any;
      
      if (!decoded) {
        return this.sendUnauthorized(res, 'Invalid token');
      }
      
      (req as any).user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role || 'PLAYER'
      };
      
      next();
    } catch (error) {
      logger.error('Supabase auth error:', error);
      this.sendUnauthorized(res, 'Authentication failed');
    }
  }

  private async jwtAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return this.sendUnauthorized(res, 'No token provided');
      }
      
      const secret = process.env.JWT_SECRET || 'default-secret';
      const decoded = jwt.verify(token, secret) as any;
      
      (req as any).user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return this.sendUnauthorized(res, 'Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return this.sendUnauthorized(res, 'Invalid token');
      }
      
      logger.error('JWT auth error:', error);
      this.sendUnauthorized(res, 'Authentication failed');
    }
  }

  private async customAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Custom authentication logic
    if (this.authConfig.handler) {
      return this.authConfig.handler(req, res, next);
    }
    
    next();
  }

  private noAuth(req: Request, res: Response, next: NextFunction): void {
    // No authentication - pass through
    next();
  }

  private extractToken(req: Request): string | null {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Check cookie
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }
    
    // Check query parameter
    if (req.query.token) {
      return req.query.token as string;
    }
    
    return null;
  }

  private sendUnauthorized(res: Response, message: string): void {
    res.status(401).json({
      error: {
        status: 401,
        message: this.config.errorHandling.customErrorMessages.get(401) || message
      }
    });
  }

  private getRateLimitKey(req: Request): string {
    // Use IP address as key
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const user = (req as any).user;
    
    // If authenticated, use user ID
    if (user && user.id) {
      return `user:${user.id}`;
    }
    
    return `ip:${ip}`;
  }

  private validateApiKey(apiKey: string): boolean {
    // In production, validate against database
    // For now, check against environment variable
    const validKeys = process.env.API_KEYS?.split(',') || [];
    return validKeys.includes(apiKey);
  }

  private async initializeSupabase(): Promise<void> {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Supabase credentials not configured');
    }
    
    // Would initialize Supabase client here
    logger.info('Supabase authentication initialized');
  }

  private async initializeJWT(): Promise<void> {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      logger.warn('JWT secret not configured - using default');
    }
    
    logger.info('JWT authentication initialized');
  }

  isConfigured(): boolean {
    return this.authProvider !== 'none';
  }

  generateToken(payload: any, expiresIn: string = '24h'): string {
    const secret = process.env.JWT_SECRET || 'default-secret';
    return jwt.sign(payload, secret, { expiresIn });
  }

  async verifyToken(token: string): Promise<any> {
    const secret = process.env.JWT_SECRET || 'default-secret';
    return jwt.verify(token, secret);
  }

  createSessionMiddleware(): Function {
    return (req: Request, res: Response, next: NextFunction) => {
      // Session management logic
      const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
      
      if (sessionId) {
        // Load session from store
        (req as any).session = {
          id: sessionId,
          // Load session data
        };
      }
      
      next();
    };
  }
}

export default AuthMiddlewareManager;