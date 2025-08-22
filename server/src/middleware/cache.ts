import { Request, Response, NextFunction } from 'express';

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache middleware
export const cacheMiddleware = (duration: number = CACHE_DURATION) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and user ID
    const userId = (req as any).userId || 'anonymous';
    const cacheKey = `${userId}:${req.originalUrl}`;

    // Check if cached data exists and is still valid
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < duration) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `private, max-age=${Math.floor(duration / 1000)}`);
      return res.json(cached.data);
    }

    // Store the original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache the response
    res.json = (data: any) => {
      // Cache the successful response
      if (res.statusCode === 200) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', `private, max-age=${Math.floor(duration / 1000)}`);
      }
      
      return originalJson(data);
    };

    next();
  };
};

// Clear cache for a specific user
export const clearUserCache = (userId: string) => {
  const keysToDelete: string[] = [];
  
  cache.forEach((_, key) => {
    if (key.startsWith(`${userId}:`)) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => cache.delete(key));
};

// Clear entire cache
export const clearAllCache = () => {
  cache.clear();
};

// Periodic cache cleanup to prevent memory issues
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  cache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => cache.delete(key));
}, CACHE_DURATION); // Run cleanup every 5 minutes

export default cacheMiddleware;