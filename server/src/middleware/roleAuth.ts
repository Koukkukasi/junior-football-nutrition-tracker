import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { prisma } from '../db';

/**
 * Middleware to check if user has ADMIN role
 * Must be used AFTER requireAuth middleware
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Ensure user is authenticated first
    if (!req.userId || !req.dbUserId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: req.dbUserId },
      select: { role: true, name: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'ADMIN') {
      console.log(`Access denied: User ${user.name} (role: ${user.role}) attempted to access admin route`);
      res.status(403).json({ 
        error: 'Access denied', 
        message: 'Admin privileges required' 
      });
      return;
    }

    console.log(`Admin access granted for user: ${user.name}`);
    next();
  } catch (error) {
    console.error('Role auth middleware error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Middleware to check if user has COACH or ADMIN role
 * Must be used AFTER requireAuth middleware
 */
export const requireCoachOrAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Ensure user is authenticated first
    if (!req.userId || !req.dbUserId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: req.dbUserId },
      select: { role: true, name: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'COACH' && user.role !== 'ADMIN') {
      console.log(`Access denied: User ${user.name} (role: ${user.role}) attempted to access coach route`);
      res.status(403).json({ 
        error: 'Access denied', 
        message: 'Coach or admin privileges required' 
      });
      return;
    }

    console.log(`Coach/Admin access granted for user: ${user.name} (role: ${user.role})`);
    next();
  } catch (error) {
    console.error('Role auth middleware error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Middleware to check if user is accessing their own resource or is an admin
 * Must be used AFTER requireAuth middleware
 */
export const requireOwnerOrAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Ensure user is authenticated first
    if (!req.userId || !req.dbUserId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get the resource owner ID from params (e.g., /users/:userId)
    const resourceUserId = req.params.userId || req.params.id;

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: req.dbUserId },
      select: { role: true, name: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user is admin or accessing their own resource
    const isAdmin = user.role === 'ADMIN';
    const isOwner = req.dbUserId === resourceUserId;

    if (!isAdmin && !isOwner) {
      console.log(`Access denied: User ${user.name} attempted to access resource belonging to ${resourceUserId}`);
      res.status(403).json({ 
        error: 'Access denied', 
        message: 'You can only access your own resources' 
      });
      return;
    }

    console.log(`Access granted: ${isAdmin ? 'Admin' : 'Owner'} access for user ${user.name}`);
    next();
  } catch (error) {
    console.error('Owner auth middleware error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};