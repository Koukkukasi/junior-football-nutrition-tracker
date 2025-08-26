import { Express, Request, Response, NextFunction } from 'express';
import { ApiAgentConfig } from '../config/agent.config';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export class ErrorHandlingManager {
  private config: ApiAgentConfig;
  private errorHandlers: Map<string, Function> = new Map();

  constructor(config: ApiAgentConfig) {
    this.config = config;
    this.initializeDefaultHandlers();
  }

  setupGlobalErrorHandlers(app: Express): void {
    // Handle 404 - Not Found
    app.use((req: Request, res: Response, next: NextFunction) => {
      const error: ApiError = new Error('Resource not found');
      error.status = 404;
      next(error);
    });

    // Global error handler
    app.use((error: ApiError, req: Request, res: Response, next: NextFunction) => {
      this.handleError(error, req, res);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      this.logError(error);
      
      // In production, restart the process
      if (this.config.isProductionMode()) {
        process.exit(1);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.logError(new Error(reason));
    });

    logger.info('✅ Global error handlers configured');
  }

  handleError(error: ApiError, req: Request, res: Response): void {
    // Log the error
    if (this.config.errorHandling.logErrors) {
      this.logError(error, req);
    }

    // Determine status code
    const status = error.status || 500;
    
    // Get custom error message
    const message = this.config.errorHandling.customErrorMessages.get(status) || error.message;

    // Build error response
    const response: any = {
      error: {
        status,
        message,
        code: error.code,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
      }
    };

    // Add stack trace in development
    if (this.config.errorHandling.exposeStackTrace && !this.config.isProductionMode()) {
      response.error.stack = error.stack;
    }

    // Add details if available
    if (error.details) {
      response.error.details = error.details;
    }

    // Add request ID if configured
    if (this.config.responseFormat.includeRequestId) {
      response.error.requestId = (req as any).id || this.generateRequestId();
    }

    // Send response
    res.status(status).json(response);
  }

  createError(status: number, message?: string, code?: string, details?: any): ApiError {
    const error: ApiError = new Error(
      message || this.config.errorHandling.customErrorMessages.get(status) || 'An error occurred'
    );
    error.status = status;
    error.code = code;
    error.details = details;
    error.isOperational = true;
    return error;
  }

  wrapAsync(fn: Function): Function {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  addErrorHandler(code: string, handler: Function): void {
    this.errorHandlers.set(code, handler);
    logger.info(`Custom error handler added for code: ${code}`);
  }

  private initializeDefaultHandlers(): void {
    // Validation error handler
    this.errorHandlers.set('VALIDATION_ERROR', (error: ApiError) => {
      error.status = 422;
      return error;
    });

    // Database error handler
    this.errorHandlers.set('DATABASE_ERROR', (error: ApiError) => {
      error.status = 500;
      error.message = 'Database operation failed';
      return error;
    });

    // Authentication error handler
    this.errorHandlers.set('AUTH_ERROR', (error: ApiError) => {
      error.status = 401;
      return error;
    });

    // Permission error handler
    this.errorHandlers.set('PERMISSION_ERROR', (error: ApiError) => {
      error.status = 403;
      return error;
    });

    // Not found error handler
    this.errorHandlers.set('NOT_FOUND', (error: ApiError) => {
      error.status = 404;
      return error;
    });

    // Conflict error handler
    this.errorHandlers.set('CONFLICT', (error: ApiError) => {
      error.status = 409;
      return error;
    });

    // Rate limit error handler
    this.errorHandlers.set('RATE_LIMIT', (error: ApiError) => {
      error.status = 429;
      return error;
    });
  }

  private logError(error: Error, req?: Request): void {
    const errorInfo: any = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    if (req) {
      errorInfo.request = {
        method: req.method,
        path: req.path,
        query: req.query,
        body: this.sanitizeBody(req.body),
        headers: this.sanitizeHeaders(req.headers),
        ip: req.ip,
        user: (req as any).user?.id
      };
    }

    logger.error('API Error:', errorInfo);
  }

  private sanitizeBody(body: any): any {
    if (!body) return {};
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie'];
    
    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  createValidationErrorHandler(): Function {
    return (error: any, req: Request, res: Response, next: NextFunction) => {
      if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
          error: {
            status: 400,
            message: 'Invalid JSON in request body',
            code: 'INVALID_JSON'
          }
        });
      }
      
      if (error.type === 'entity.too.large') {
        return res.status(413).json({
          error: {
            status: 413,
            message: `Request body too large. Maximum size: ${this.config.validation.maxRequestSize}`,
            code: 'PAYLOAD_TOO_LARGE'
          }
        });
      }
      
      next(error);
    };
  }

  handlePrismaError(error: any): ApiError {
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return this.createError(409, 'Resource already exists', 'DUPLICATE_ENTRY', {
        field: error.meta?.target
      });
    }
    
    if (error.code === 'P2025') {
      return this.createError(404, 'Resource not found', 'NOT_FOUND');
    }
    
    if (error.code === 'P2003') {
      return this.createError(400, 'Invalid reference', 'INVALID_REFERENCE', {
        field: error.meta?.field_name
      });
    }
    
    // Default database error
    return this.createError(500, 'Database operation failed', 'DATABASE_ERROR');
  }

  isConfigured(): boolean {
    return true;
  }

  getErrorStats(): {
    total: number;
    byStatus: Record<number, number>;
    byCode: Record<string, number>;
  } {
    // In production, this would track actual error statistics
    return {
      total: 0,
      byStatus: {},
      byCode: {}
    };
  }
}

export default ErrorHandlingManager;