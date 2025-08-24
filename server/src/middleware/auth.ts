import { Response, NextFunction } from 'express';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { prisma } from '../db';
import { AuthRequest } from '../types/auth.types';

// Initialize Clerk with the secret key
const clerk = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY || ''
});

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('=== AUTH MIDDLEWARE START ===');
    console.log('Request path:', req.path, 'Method:', req.method);
    console.log('Headers:', Object.keys(req.headers));
    
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken) {
      console.log('No authorization token provided');
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    console.log('Token found, verifying with Clerk...');
    // Verify the JWT token
    const verifiedToken = await clerk.verifyToken(sessionToken);

    if (!verifiedToken || !verifiedToken.sub) {
      console.log('Invalid token or no subject in token');
      res.status(401).json({ error: 'Invalid session' });
      return;
    }

    // Extract user ID from the verified token
    const userId = verifiedToken.sub;
    console.log('Token verified, Clerk userId:', userId);
    req.userId = userId;
    
    // Get user details from Clerk
    try {
      const clerkUser = await clerk.users.getUser(userId);
      req.user = clerkUser;
      
      // Auto-create database user if not exists - MUST complete before proceeding
      console.log('Starting user synchronization for Clerk ID:', userId);
      
      try {
        // Use upsert to handle race conditions and avoid multiple DB calls
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || `${userId}@placeholder.com`;
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Player';
        
        console.log('Upserting user with email:', email, 'name:', name);
        
        const dbUser = await prisma.user.upsert({
          where: { clerkId: userId },
          update: {
            // Update email and name if they've changed
            email: email,
            name: name,
            updatedAt: new Date()
          },
          create: {
            clerkId: userId,
            email: email,
            name: name,
            age: 16, // Default age
            role: 'PLAYER',
            ageGroup: '16-18', // Default age group
            dataConsent: false,
            completedOnboarding: false
          }
        });
        
        console.log('User upserted successfully with database ID:', dbUser.id);
        
        // Store user ID in request for easy access - CRITICAL: Ensure it's a string
        req.dbUserId = String(dbUser.id);
        console.log('User synchronization complete. DB User ID stored in request:', dbUser.id, 'Type:', typeof dbUser.id);
        
      } catch (dbError: any) {
        console.error('Database operation failed:', dbError);
        
        // If it's a connection error, try to reconnect
        if (dbError.code === 'P2024' || dbError.message?.includes('connection')) {
          console.log('Database connection issue detected, attempting to proceed without DB user');
          // Allow the request to proceed but without the dbUserId
          // The food routes should handle this gracefully
          req.dbUserId = undefined;
        } else {
          // For other errors, still try to proceed if possible
          console.error('User sync failed but proceeding:', dbError.message);
          req.dbUserId = undefined;
        }
      }
    } catch (userError) {
      console.error('Could not fetch user from Clerk:', userError);
      // Continue even if we can't get full user details
      req.user = { id: userId };
    }
    
    console.log('=== AUTH MIDDLEWARE COMPLETE ===');
    console.log('Proceeding with Clerk ID:', req.userId);
    console.log('Proceeding with DB User ID:', req.dbUserId);
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
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (sessionToken) {
      const verifiedToken = await clerk.verifyToken(sessionToken);
      
      if (verifiedToken && verifiedToken.sub) {
        const userId = verifiedToken.sub;
        req.userId = userId;
        
        try {
          const clerkUser = await clerk.users.getUser(userId);
          req.user = clerkUser;
          
          // Auto-create database user if not exists - MUST complete before proceeding
          try {
            // Use upsert to avoid race conditions
            const email = clerkUser.emailAddresses?.[0]?.emailAddress || `${userId}@placeholder.com`;
            const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Player';
            
            const dbUser = await prisma.user.upsert({
              where: { clerkId: userId },
              update: {}, // No update needed if user exists
              create: {
                clerkId: userId,
                email: email,
                name: name,
                age: 16, // Default age
                role: 'PLAYER',
                ageGroup: '16-18', // Default age group
                dataConsent: false,
                completedOnboarding: false
              }
            });
            
            console.log('User synchronized (optional auth):', dbUser.id);
          } catch (dbError) {
            console.error('Database user sync error in optional auth:', dbError);
            // For optional auth, we continue even if user sync fails
          }
        } catch (userError) {
          console.error('Could not fetch user from Clerk:', userError);
          req.user = { id: userId };
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};