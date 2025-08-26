import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/supabase-auth';
import { requireAdmin } from '../middleware/roleAuth';
import { AuthRequest } from '../types/auth.types';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

const router = Router();


// Ensure feedback directory exists
const FEEDBACK_DIR = path.join(process.cwd(), 'feedback');

async function ensureFeedbackDir() {
  try {
    await fs.access(FEEDBACK_DIR);
  } catch {
    await fs.mkdir(FEEDBACK_DIR, { recursive: true });
  }
}

// Submit feedback
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { type, message, rating, userAgent, url } = req.body;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId }
    });

    const feedbackData = {
      userId: user?.id || req.userId,
      userEmail: user?.email || 'unknown',
      userName: user?.name || 'Anonymous',
      type,
      message,
      rating,
      userAgent,
      url,
      timestamp: new Date().toISOString()
    };

    // Save to file system for easy access during development
    await ensureFeedbackDir();
    const filename = `feedback_${Date.now()}_${type}.json`;
    const filepath = path.join(FEEDBACK_DIR, filename);
    
    await fs.writeFile(
      filepath,
      JSON.stringify(feedbackData, null, 2),
      'utf-8'
    );

    // Log feedback for monitoring
    logger.info('📝 New Feedback Received', {
      type,
      user: `${user?.name} (${user?.email})`,
      rating: rating || 'No rating',
      message,
      url
    });

    res.json({ 
      success: true, 
      message: 'Feedback received successfully',
      id: filename 
    });
  } catch (error) {
    logger.error('Feedback submission error', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit feedback' 
    });
  }
});

// Get all feedback (admin only)
router.get('/all', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Check if user is admin/coach
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId }
    });

    if (user?.role !== 'COACH' && user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    await ensureFeedbackDir();
    const files = await fs.readdir(FEEDBACK_DIR);
    const feedback = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(
          path.join(FEEDBACK_DIR, file),
          'utf-8'
        );
        feedback.push(JSON.parse(content));
      }
    }

    // Sort by timestamp (newest first)
    feedback.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    res.json({ 
      success: true, 
      feedback,
      count: feedback.length 
    });
  } catch (error) {
    logger.error('Feedback fetch error', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch feedback' 
    });
  }
});

// Get feedback statistics
router.get('/stats', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    await ensureFeedbackDir();
    const files = await fs.readdir(FEEDBACK_DIR);
    
    const stats = {
      total: 0,
      byType: {
        bug: 0,
        feature: 0,
        general: 0,
        praise: 0
      },
      averageRating: 0,
      totalRatings: 0
    };

    let totalRating = 0;
    let ratingCount = 0;

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(
          path.join(FEEDBACK_DIR, file),
          'utf-8'
        );
        const feedback = JSON.parse(content);
        
        stats.total++;
        stats.byType[feedback.type as keyof typeof stats.byType]++;
        
        if (feedback.rating) {
          totalRating += feedback.rating;
          ratingCount++;
        }
      }
    }

    if (ratingCount > 0) {
      stats.averageRating = totalRating / ratingCount;
      stats.totalRatings = ratingCount;
    }

    res.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    logger.error('Feedback stats error', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch feedback statistics' 
    });
  }
});

export default router;