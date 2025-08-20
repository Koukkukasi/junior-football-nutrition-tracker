import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const session = await clerkClient.sessions.verifySession(
      '',
      sessionToken
    );

    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    req.userId = session.userId;
    
    const user = await clerkClient.users.getUser(session.userId);
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (sessionToken) {
      const session = await clerkClient.sessions.verifySession(
        '',
        sessionToken
      );
      
      if (session) {
        req.userId = session.userId;
        const user = await clerkClient.users.getUser(session.userId);
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};