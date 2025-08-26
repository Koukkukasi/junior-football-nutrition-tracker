import { Request, Response, NextFunction } from 'express';

interface Metrics {
  requests: {
    total: number;
    byMethod: Record<string, number>;
    byStatus: Record<number, number>;
    byEndpoint: Record<string, number>;
  };
  performance: {
    avgResponseTime: number;
    slowRequests: number;
    fastRequests: number;
  };
  errors: {
    total: number;
    by4xx: number;
    by5xx: number;
    byType: Record<string, number>;
  };
  uptime: number;
  startTime: Date;
}

class ApiMetrics {
  private metrics: Metrics;
  private responseTimes: number[] = [];
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // ms

  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
        byEndpoint: {}
      },
      performance: {
        avgResponseTime: 0,
        slowRequests: 0,
        fastRequests: 0
      },
      errors: {
        total: 0,
        by4xx: 0,
        by5xx: 0,
        byType: {}
      },
      uptime: 0,
      startTime: new Date()
    };
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      // Track request
      this.trackRequest(req);
      
      // Override res.end to capture response
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: BufferEncoding, cb?: (() => void)) {
        const responseTime = Date.now() - startTime;
        this.trackResponse(res, responseTime);
        this.trackEndpoint(req.path, req.method);
        
        // Call original end
        if (cb) {
          return originalEnd.call(this, chunk, encoding, cb);
        } else if (encoding) {
          return originalEnd.call(this, chunk, encoding);
        } else if (chunk) {
          return originalEnd.call(this, chunk);
        } else {
          return originalEnd.call(this);
        }
      }.bind(this);
      
      next();
    };
  }

  private trackRequest(req: Request): void {
    this.metrics.requests.total++;
    
    const method = req.method.toUpperCase();
    this.metrics.requests.byMethod[method] = 
      (this.metrics.requests.byMethod[method] || 0) + 1;
  }

  private trackResponse(res: Response, responseTime: number): void {
    const status = res.statusCode;
    
    // Track status codes
    this.metrics.requests.byStatus[status] = 
      (this.metrics.requests.byStatus[status] || 0) + 1;
    
    // Track errors
    if (status >= 400) {
      this.metrics.errors.total++;
      
      if (status >= 400 && status < 500) {
        this.metrics.errors.by4xx++;
      } else if (status >= 500) {
        this.metrics.errors.by5xx++;
      }
    }
    
    // Track performance
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift(); // Keep last 1000 response times
    }
    
    this.updatePerformanceMetrics(responseTime);
  }

  private trackEndpoint(path: string, method: string): void {
    // Normalize path (remove IDs)
    const normalizedPath = path.replace(/\/[a-f0-9-]{36}/g, '/:id');
    const endpoint = `${method} ${normalizedPath}`;
    
    this.metrics.requests.byEndpoint[endpoint] = 
      (this.metrics.requests.byEndpoint[endpoint] || 0) + 1;
  }

  private updatePerformanceMetrics(responseTime: number): void {
    if (responseTime > this.SLOW_REQUEST_THRESHOLD) {
      this.metrics.performance.slowRequests++;
    } else {
      this.metrics.performance.fastRequests++;
    }
    
    // Calculate average response time
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    this.metrics.performance.avgResponseTime = 
      Math.round(sum / this.responseTimes.length);
  }

  getMetrics(): Metrics & { uptime: string } {
    const uptimeMs = Date.now() - this.metrics.startTime.getTime();
    const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      ...this.metrics,
      uptime: `${uptimeHours}h ${uptimeMinutes}m` as string
    } as Metrics & { uptime: string };
  }

  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  } {
    const errorRate = this.metrics.errors.total / this.metrics.requests.total;
    const avgResponseTime = this.metrics.performance.avgResponseTime;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (errorRate > 0.1 || avgResponseTime > 2000) {
      status = 'unhealthy';
    } else if (errorRate > 0.05 || avgResponseTime > 1000) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }
    
    return {
      status,
      details: {
        errorRate: `${(errorRate * 100).toFixed(2)}%`,
        avgResponseTime: `${avgResponseTime}ms`,
        totalRequests: this.metrics.requests.total,
        uptime: this.getMetrics().uptime
      }
    };
  }

  reset(): void {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
        byEndpoint: {}
      },
      performance: {
        avgResponseTime: 0,
        slowRequests: 0,
        fastRequests: 0
      },
      errors: {
        total: 0,
        by4xx: 0,
        by5xx: 0,
        byType: {}
      },
      uptime: 0,
      startTime: new Date()
    };
    this.responseTimes = [];
  }
}

export const apiMetrics = new ApiMetrics();

// Metrics endpoint handler
export const metricsHandler = (_req: Request, res: Response) => {
  res.json({
    data: apiMetrics.getMetrics(),
    health: apiMetrics.getHealthStatus()
  });
};

// Health check endpoint handler  
export const healthCheckHandler = (_req: Request, res: Response) => {
  const health = apiMetrics.getHealthStatus();
  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503;
  
  res.status(statusCode).json({
    status: health.status,
    ...health.details,
    timestamp: new Date().toISOString()
  });
};

export default apiMetrics;