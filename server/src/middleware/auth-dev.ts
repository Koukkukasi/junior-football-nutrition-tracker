import { Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../types/auth.types';
import jwt from 'jsonwebtoken';

// Production-ready auth middleware for Supabase tokens
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('=== AUTH MIDDLEWARE START ===');
    console.log('Request path:', req.path, 'Method:', req.method);
    
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No authorization token provided');
      res.status(401).json({ 
        success: false,
        error: 'No authorization token provided',
        code: 'NO_TOKEN'
      });
      return;
    }

    let userId: string | null = null;
    let userEmail: string | null = null;

    // Check if it's a test token (development only)
    if (process.env.NODE_ENV === 'development' && token === 'test_token') {
      userId = 'test_user_123';
      userEmail = 'test@example.com';
    } else {
      try {
        // Decode Supabase JWT token
        const decoded = jwt.decode(token) as any;
        
        if (!decoded || !decoded.sub) {
          console.log('Invalid token structure - missing sub claim');
          res.status(401).json({ 
            success: false,
            error: 'Invalid authentication token',
            code: 'INVALID_TOKEN'
          });
          return;
        }
        
        userId = decoded.sub;
        userEmail = decoded.email || `user_${decoded.sub}@example.com`;
        
        // Log token details for debugging
        console.log('Token decoded successfully:', {
          sub: decoded.sub,
          email: decoded.email,
          exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'no expiry'
        });
      } catch (e) {
        console.error('Failed to decode token:', e);
        res.status(401).json({ 
          success: false,
          error: 'Invalid authentication token',
          code: 'TOKEN_DECODE_ERROR'
        });
        return;
      }
    }

    // Development only: Allow custom headers for testing
    if (process.env.NODE_ENV === 'development') {
      const customUserId = req.headers['x-user-id'] as string;
      if (customUserId) {
        userId = customUserId;
        userEmail = req.headers['x-user-email'] as string || `${customUserId}@example.com`;
      }
    }

    if (!userId) {
      console.log('Could not extract user ID from token');
      res.status(401).json({ 
        success: false,
        error: 'Invalid authentication token',
        code: 'NO_USER_ID'
      });
      return;
    }

    console.log('Authenticated Supabase user ID:', userId);
    req.userId = userId;

    // CRITICAL: Ensure user exists in database and get database ID
    try {
      console.log('Attempting to sync user with Supabase ID:', userId, 'Email:', userEmail);
      
      let dbUser = null;
      
      // Strategy 1: Find by supabaseId (new field)
      if (!dbUser) {
        dbUser = await prisma.user.findUnique({
          where: { supabaseId: userId }
        });
        if (dbUser) {
          console.log('Found user by supabaseId');
        }
      }
      
      // Strategy 2: Find by email and update supabaseId
      if (!dbUser && userEmail) {
        dbUser = await prisma.user.findUnique({
          where: { email: userEmail }
        });
        
        if (dbUser) {
          console.log('Found existing user by email, updating supabaseId');
          // Update the supabaseId for this user
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              supabaseId: userId,
              updatedAt: new Date()
            }
          });
        }
      }
      
      // Strategy 3: Legacy - find by clerkId (for backwards compatibility)
      if (!dbUser) {
        dbUser = await prisma.user.findUnique({
          where: { clerkId: userId }
        });
        
        if (dbUser) {
          console.log('Found user by legacy clerkId, migrating to supabaseId');
          // Migrate from clerkId to supabaseId
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              supabaseId: userId,
              updatedAt: new Date()
            }
          });
        }
      }
      
      // Strategy 4: Create new user
      if (!dbUser) {
        console.log('Creating new user with supabaseId:', userId);
        
        // Generate a unique clerkId for legacy compatibility
        const legacyClerkId = `supabase_${userId}_${Date.now()}`;
        
        dbUser = await prisma.user.create({
          data: {
            clerkId: legacyClerkId, // Legacy field with unique value
            supabaseId: userId,     // New Supabase ID field
            email: userEmail || `${userId}@example.com`,
            name: userEmail?.split('@')[0] || 'Player',
            age: 16,
            role: 'PLAYER',
            ageGroup: '16-18',
            dataConsent: false,
            completedOnboarding: false
          }
        });
        console.log('New user created successfully');
      }

      // CRITICAL: Always set dbUserId - this prevents foreign key failures
      req.dbUserId = String(dbUser.id);
      req.user = dbUser as any;
      
      console.log('User synchronized successfully:', {
        supabaseId: userId,
        dbUserId: dbUser.id,
        email: dbUser.email
      });

    } catch (dbError: any) {
      console.error('Database operation failed:', dbError);
      console.error('Error code:', dbError.code);
      console.error('Error message:', dbError.message);
      
      // Check for specific database errors
      if (dbError.code === 'P2002') {
        // Unique constraint violation - try to find existing user
        console.log('Handling unique constraint violation, attempting to find existing user');
        try {
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { clerkId: userId },
                { email: userEmail || '' }
              ]
            }
          });
          
          if (existingUser) {
            req.dbUserId = String(existingUser.id);
            req.user = existingUser as any;
            console.log('Found existing user on retry:', existingUser.id);
            console.log('=== AUTH MIDDLEWARE COMPLETE ===');
            next();
            return;
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      } else if (dbError.code === 'P2025') {
        console.error('Record not found for update - will try to create new user');
        // Try to create a new user
        try {
          const newUser = await prisma.user.create({
            data: {
              clerkId: userId,
              email: userEmail || `${userId}@example.com`,
              name: userEmail?.split('@')[0] || 'Player',
              age: 16,
              role: 'PLAYER',
              ageGroup: '16-18',
              dataConsent: false,
              completedOnboarding: false
            }
          });
          
          req.dbUserId = String(newUser.id);
          req.user = newUser as any;
          console.log('Created new user after P2025 error:', newUser.id);
          console.log('=== AUTH MIDDLEWARE COMPLETE ===');
          next();
          return;
        } catch (createError) {
          console.error('Failed to create new user:', createError);
        }
      }
      
      // Return detailed error in development, generic in production
      const errorResponse = {
        success: false,
        error: 'User synchronization failed',
        message: 'Database connection issue. Please try again.',
        code: 'DB_SYNC_ERROR',
        ...(process.env.NODE_ENV === 'development' ? {
          details: {
            errorCode: dbError.code,
            errorMessage: dbError.message,
            userId: userId,
            email: userEmail
          }
        } : {})
      };
      
      res.status(503).json(errorResponse);
      return;
    }

    console.log('=== AUTH MIDDLEWARE COMPLETE ===');
    console.log('Final state - userId:', req.userId, 'dbUserId:', req.dbUserId);
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      error: 'Authentication failed',
      message: error.message || 'An unexpected error occurred',
      code: 'AUTH_ERROR'
    });
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
      let userEmail: string | null = null;

      // Test token support for development
      if (process.env.NODE_ENV === 'development' && token === 'test_token') {
        userId = 'test_user_123';
        userEmail = 'test@example.com';
      } else {
        try {
          const decoded = jwt.decode(token) as any;
          if (decoded?.sub) {
            userId = decoded.sub;
            userEmail = decoded.email;
          }
        } catch (e) {
          console.log('Failed to decode token in optional auth:', e);
        }
      }

      // Development only: custom headers
      if (process.env.NODE_ENV === 'development') {
        const customUserId = req.headers['x-user-id'] as string;
        if (customUserId) {
          userId = customUserId;
          userEmail = req.headers['x-user-email'] as string;
        }
      }

      if (userId) {
        req.userId = userId;
        
        try {
          // Try to find existing user by supabaseId first
          let dbUser = await prisma.user.findUnique({
            where: { supabaseId: userId }
          });
          
          // If not found, try by email
          if (!dbUser && userEmail) {
            dbUser = await prisma.user.findUnique({
              where: { email: userEmail }
            });
            
            // Update supabaseId if found by email
            if (dbUser) {
              dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { supabaseId: userId }
              });
            }
          }
          
          // Try legacy clerkId
          if (!dbUser) {
            dbUser = await prisma.user.findUnique({
              where: { clerkId: userId }
            });
            
            // Migrate to supabaseId if found
            if (dbUser) {
              dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { supabaseId: userId }
              });
            }
          }
          
          // Create user if doesn't exist (for optional auth routes)
          if (!dbUser && userEmail) {
            const legacyClerkId = `supabase_${userId}_${Date.now()}`;
            dbUser = await prisma.user.create({
              data: {
                clerkId: legacyClerkId,
                supabaseId: userId,
                email: userEmail,
                name: userEmail.split('@')[0] || 'Player',
                age: 16,
                role: 'PLAYER',
                ageGroup: '16-18',
                dataConsent: false,
                completedOnboarding: false
              }
            });
          }
          
          if (dbUser) {
            req.dbUserId = String(dbUser.id);
            req.user = dbUser as any;
            console.log('Optional auth: User found/created with ID:', dbUser.id);
          }
        } catch (dbError) {
          console.error('Optional auth database error:', dbError);
          // Don't fail the request for optional auth
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    // Don't fail the request for optional auth
    next();
  }
};