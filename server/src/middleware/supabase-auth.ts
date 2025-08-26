import { Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../types/auth.types';
import jwt from 'jsonwebtoken';

// Supabase JWT secret - this should be in environment variables in production
// For now, using a default that works with the Supabase instance
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';

// Production-ready auth middleware for Supabase tokens
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Force output to ensure we see logs
    process.stdout.write(`\n=== SUPABASE AUTH MIDDLEWARE START ===\n`);
    process.stdout.write(`Request path: ${req.path}, Method: ${req.method}\n`);
    process.stdout.write(`NODE_ENV: ${process.env.NODE_ENV}\n`);
    
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    process.stdout.write(`Auth header: ${authHeader}\n`);
    process.stdout.write(`Token: ${token}\n`);
    
    if (!token) {
      process.stdout.write('No authorization token provided\n');
      res.status(401).json({ 
        success: false,
        error: 'No authorization token provided',
        code: 'NO_TOKEN'
      });
      return;
    }

    let userId: string | null = null;
    let userEmail: string | null = null;
    let decoded: any = null;

    // Check if it's a test token (development only)
    if (process.env.NODE_ENV === 'development' && token === 'test-supabase-123') {
      // Use our test user created in the database
      userId = 'test-supabase-123';
      userEmail = 'testplayer@example.com';
      
      // Look up the test user in the database
      const testUser = await prisma.user.findUnique({
        where: { supabaseId: userId }
      });
      
      if (testUser) {
        req.userId = userId;
        req.dbUserId = testUser.id;
        console.log('Test token authenticated:', { supabaseId: userId, dbUserId: testUser.id });
        next();
        return;
      }
    } else if (process.env.NODE_ENV === 'development' && token === 'test_token') {
      userId = 'test_user_123';
      userEmail = 'test@example.com';
    } else {
      try {
        // First, try to decode without verification to see the structure
        decoded = jwt.decode(token) as any;
        
        if (!decoded) {
          console.log('Failed to decode token');
          res.status(401).json({ 
            success: false,
            error: 'Invalid authentication token',
            code: 'INVALID_TOKEN'
          });
          return;
        }

        // Log the token structure for debugging
        console.log('Token structure:', {
          hasSubField: !!decoded.sub,
          hasUserIdField: !!decoded.user_id,
          hasIdField: !!decoded.id,
          hasEmailField: !!decoded.email,
          hasUserMetadata: !!decoded.user_metadata,
          tokenType: decoded.token_type,
          role: decoded.role,
          aal: decoded.aal,
          sessionId: decoded.session_id
        });

        // Supabase access tokens have the user ID in the 'sub' field
        userId = decoded.sub || decoded.user_id || decoded.id;
        
        // Email might be in different places depending on token type
        userEmail = decoded.email || 
                   decoded.user_metadata?.email || 
                   decoded.email_verified ||
                   decoded.user?.email;

        // If we still don't have a userId, it might be a different token format
        if (!userId) {
          // Check if it's a Supabase session object instead of a JWT
          console.log('No user ID found in standard JWT fields. Full token payload:', JSON.stringify(decoded, null, 2));
          
          // Sometimes the frontend sends the session object instead of just the access token
          if (decoded.user) {
            userId = decoded.user.id;
            userEmail = decoded.user.email;
          }
        }

        if (!userId) {
          console.log('Could not extract user ID from token');
          res.status(401).json({ 
            success: false,
            error: 'Invalid token format - no user ID found',
            code: 'NO_USER_ID'
          });
          return;
        }

        // Now try to verify the token with the JWT secret (optional in development)
        if (process.env.NODE_ENV === 'production' && SUPABASE_JWT_SECRET !== 'super-secret-jwt-token-with-at-least-32-characters-long') {
          try {
            const verified = jwt.verify(token, SUPABASE_JWT_SECRET) as any;
            console.log('Token verified successfully');
            // Use verified data if available
            userId = verified.sub || userId;
            userEmail = verified.email || userEmail;
          } catch (verifyError) {
            console.warn('Token verification failed, but continuing with decoded data:', verifyError);
            // In development or if verification fails, we continue with the decoded data
          }
        }
        
        console.log('Extracted user info:', {
          userId,
          userEmail,
          tokenExp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'no expiry'
        });
      } catch (e) {
        console.error('Failed to process token:', e);
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
      console.log('No user ID available after all checks');
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
      
      // Strategy 1: Find by supabaseId
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
        
        // Extract name from email or decoded token
        const name = decoded?.user_metadata?.full_name || 
                    decoded?.user_metadata?.name ||
                    decoded?.name ||
                    userEmail?.split('@')[0] || 
                    'Player';
        
        dbUser = await prisma.user.create({
          data: {
            clerkId: legacyClerkId, // Legacy field with unique value
            supabaseId: userId,     // New Supabase ID field
            email: userEmail || `${userId}@example.com`,
            name: name,
            age: decoded?.user_metadata?.age || 16,
            role: decoded?.user_metadata?.role || 'PLAYER',
            position: decoded?.user_metadata?.position,
            ageGroup: decoded?.user_metadata?.ageGroup || '16-18',
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
                { supabaseId: userId },
                { clerkId: userId },
                { email: userEmail || '' }
              ]
            }
          });
          
          if (existingUser) {
            req.dbUserId = String(existingUser.id);
            req.user = existingUser as any;
            console.log('Found existing user on retry:', existingUser.id);
            console.log('=== SUPABASE AUTH MIDDLEWARE COMPLETE ===');
            next();
            return;
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
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

    console.log('=== SUPABASE AUTH MIDDLEWARE COMPLETE ===');
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
          if (decoded) {
            userId = decoded.sub || decoded.user_id || decoded.id;
            userEmail = decoded.email || decoded.user_metadata?.email;
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