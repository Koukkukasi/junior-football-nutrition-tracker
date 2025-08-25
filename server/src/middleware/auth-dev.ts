import { Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../types/auth.types';
import jwt from 'jsonwebtoken';

// Development auth middleware that works with Supabase or test tokens
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('=== DEV AUTH MIDDLEWARE START ===');
    console.log('Request path:', req.path, 'Method:', req.method);
    
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No authorization token provided');
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    // For development, we'll accept Supabase tokens or test tokens
    let userId: string | null = null;
    let userEmail: string | null = null;

    // Check if it's a test token
    if (token === 'test_token') {
      userId = 'test_user_123';
      userEmail = 'test@example.com';
    } else {
      try {
        // Try to decode as a Supabase JWT (without verification for dev)
        const decoded = jwt.decode(token) as any;
        if (decoded?.sub) {
          userId = decoded.sub;
          userEmail = decoded.email || `user_${decoded.sub}@example.com`;
        }
      } catch (e) {
        console.log('Failed to decode token:', e);
      }
    }

    // Also check for custom header (for testing)
    const customUserId = req.headers['x-user-id'] as string;
    if (customUserId) {
      userId = customUserId;
      userEmail = req.headers['x-user-email'] as string || `${customUserId}@example.com`;
    }

    if (!userId) {
      console.log('Could not extract user ID from token');
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    console.log('Authenticated user ID:', userId);
    req.userId = userId;

    // Create or get user from database
    try {
      const dbUser = await prisma.user.upsert({
        where: { 
          clerkId: userId // Using clerkId field for compatibility
        },
        update: {
          updatedAt: new Date()
        },
        create: {
          clerkId: userId,
          email: userEmail || `${userId}@example.com`,
          name: 'Test User',
          age: 16,
          role: 'PLAYER',
          ageGroup: '16-18',
          dataConsent: false,
          completedOnboarding: false
        }
      });

      console.log('User synchronized with database ID:', dbUser.id);
      req.dbUserId = String(dbUser.id);
      req.user = dbUser as any;

    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      res.status(503).json({ 
        error: 'User synchronization failed',
        message: 'Please try again'
      });
      return;
    }

    console.log('=== DEV AUTH MIDDLEWARE COMPLETE ===');
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
      let userId: string | null = null;

      if (token === 'test_token') {
        userId = 'test_user_123';
      } else {
        try {
          const decoded = jwt.decode(token) as any;
          if (decoded?.sub) {
            userId = decoded.sub;
          }
        } catch (e) {
          console.log('Failed to decode token:', e);
        }
      }

      const customUserId = req.headers['x-user-id'] as string;
      if (customUserId) {
        userId = customUserId;
      }

      if (userId) {
        req.userId = userId;
        
        try {
          const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
          });
          
          if (dbUser) {
            req.dbUserId = String(dbUser.id);
            req.user = dbUser as any;
          }
        } catch (dbError) {
          console.error('Database lookup error:', dbError);
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};