import { Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../types/auth.types';
import jwt from 'jsonwebtoken';

// EMERGENCY SIMPLIFIED AUTH - Replace auth-dev.ts with this
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        error: 'No authorization token provided',
        code: 'NO_TOKEN'
      });
      return;
    }

    // Decode Supabase JWT
    const decoded = jwt.decode(token) as any;
    
    if (!decoded || !decoded.sub) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
      return;
    }
    
    const supabaseId = decoded.sub;
    const email = decoded.email || `${supabaseId}@user.app`;
    
    console.log('Auth attempt for Supabase ID:', supabaseId, 'Email:', email);
    
    // Simple approach: Just get or create the user, no complex logic
    let dbUser;
    
    try {
      // First, try to find by Supabase ID (stored in clerkId field)
      dbUser = await prisma.user.findUnique({
        where: { clerkId: supabaseId }
      });
      
      if (!dbUser) {
        console.log('User not found by Supabase ID, checking email...');
        // Try to find by email
        dbUser = await prisma.user.findUnique({
          where: { email: email }
        });
        
        if (dbUser) {
          console.log('Found user by email, updating Supabase ID...');
          // Update the Supabase ID
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: { clerkId: supabaseId }
          });
        }
      }
      
      if (!dbUser) {
        console.log('Creating new user...');
        // Create new user with a unique email
        const timestamp = Date.now();
        const uniqueEmail = email.includes('@') ? email : `${supabaseId}_${timestamp}@user.app`;
        
        dbUser = await prisma.user.create({
          data: {
            clerkId: supabaseId,
            email: uniqueEmail,
            name: decoded.email?.split('@')[0] || `User${timestamp}`,
            age: 16,
            role: 'PLAYER',
            ageGroup: '16-18',
            dataConsent: false,
            completedOnboarding: false
          }
        });
        console.log('New user created with ID:', dbUser.id);
      }
    } catch (error: any) {
      console.error('Database error:', error);
      
      // If it's a unique constraint error, try to find the user differently
      if (error.code === 'P2002') {
        console.log('Unique constraint error, attempting recovery...');
        
        // Find any user that might match
        dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { clerkId: supabaseId },
              { email: email }
            ]
          }
        });
        
        if (!dbUser) {
          // Create with a definitely unique email
          const uniqueEmail = `${supabaseId}_${Date.now()}_${Math.random().toString(36).substring(7)}@user.app`;
          dbUser = await prisma.user.create({
            data: {
              clerkId: `${supabaseId}_${Date.now()}`, // Make clerkId unique too
              email: uniqueEmail,
              name: `User_${Date.now()}`,
              age: 16,
              role: 'PLAYER',
              ageGroup: '16-18',
              dataConsent: false,
              completedOnboarding: false
            }
          });
        }
      } else {
        throw error;
      }
    }
    
    if (!dbUser) {
      console.error('Failed to get or create user');
      res.status(503).json({ 
        success: false,
        error: 'User synchronization failed',
        message: 'Unable to create user account. Please try again.',
        code: 'USER_SYNC_FAILED'
      });
      return;
    }
    
    // Set request properties
    req.userId = supabaseId;
    req.dbUserId = String(dbUser.id);
    req.user = dbUser as any;
    
    console.log('Auth successful - Supabase ID:', supabaseId, 'DB User ID:', dbUser.id);
    next();
  } catch (error: any) {
    console.error('Auth middleware critical error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Authentication system failure',
      message: 'The authentication system encountered an error. Please try again.',
      code: 'AUTH_SYSTEM_ERROR'
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.decode(token) as any;
      
      if (decoded?.sub) {
        req.userId = decoded.sub;
        
        try {
          const dbUser = await prisma.user.findUnique({
            where: { clerkId: decoded.sub }
          });
          
          if (dbUser) {
            req.dbUserId = String(dbUser.id);
            req.user = dbUser as any;
          }
        } catch (error) {
          console.error('Optional auth error:', error);
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};