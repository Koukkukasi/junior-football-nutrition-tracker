import { Request, Response, NextFunction } from 'express';

export interface MockAuthRequest extends Request {
  dbUserId?: string;
  supabaseUserId?: string;
  userEmail?: string;
}

/**
 * Mock authentication middleware for when database is not available
 * Extracts user info from JWT but doesn't verify against database
 */
export const requireMockAuth = async (
  req: MockAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authentication token provided' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Simple JWT decode without verification (for mock purposes)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      // Extract user info from token
      req.dbUserId = payload.sub || payload.user_id || 'mock-user-' + Date.now();
      req.supabaseUserId = payload.sub;
      req.userEmail = payload.email || 'mock@example.com';
      
      next();
    } catch (error) {
      console.error('Token decode error:', error);
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }
  } catch (error) {
    console.error('Mock auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Optional mock auth - allows requests with or without auth
 */
export const optionalMockAuth = async (
  req: MockAuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        req.dbUserId = payload.sub || payload.user_id || 'mock-user-' + Date.now();
        req.supabaseUserId = payload.sub;
        req.userEmail = payload.email || 'mock@example.com';
      }
    } catch (error) {
      // Ignore decode errors for optional auth
    }
  }
  
  next();
};