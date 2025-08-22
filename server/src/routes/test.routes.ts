import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth.types';

const router = Router();


// Test endpoint to verify user lookup and food creation
router.post('/test-food', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const clerkId = req.userId;
    
    console.log('TEST: Clerk ID from auth:', clerkId);
    
    // Look up user
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    console.log('TEST: Found user:', user ? user.id : 'NOT FOUND');
    
    if (!user) {
      res.status(404).json({ 
        error: 'User not found',
        clerkId,
        message: 'User lookup failed'
      });
      return;
    }
    
    // Try to create a test food entry
    const foodEntry = await prisma.foodEntry.create({
      data: {
        userId: user.id,
        mealType: 'BREAKFAST',
        time: '09:00',
        location: 'Test',
        description: 'Test meal from test endpoint',
        notes: 'Testing',
        date: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Test food entry created successfully',
      userId: user.id,
      foodEntryId: foodEntry.id
    });
    
  } catch (error) {
    console.error('TEST ERROR:', error);
    res.status(500).json({
      error: 'Test failed',
      details: (error as Error).message
    });
  }
});

export default router;