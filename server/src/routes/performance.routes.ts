import { Router, Response } from 'express';
import { requireAuth } from '../middleware/auth-dev'; // Use dev auth
import { AuthRequest, PerformanceMetricsRequest } from '../types/auth.types';
import { prisma } from '../db';

const router = Router();

// Interface for performance metrics request
// Interface moved to ../types/auth.types.ts


// GET /api/v1/performance - Get user's performance metrics
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { date, limit = '30', offset = '0', period = 'month' } = req.query;
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Look up the user by Clerk ID to get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found in database' });
      return;
    }

    const userId = user.id;

    let dateFilter = {};

    if (date) {
      // Specific date
      const targetDate = new Date(date as string);
      dateFilter = {
        date: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999))
        }
      };
    } else if (period) {
      // Date range based on period
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
      }

      dateFilter = {
        date: {
          gte: startDate,
          lte: now
        }
      };
    }

    const performanceMetrics = await prisma.performanceMetric.findMany({
      where: {
        userId,
        ...dateFilter
      },
      orderBy: {
        date: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: performanceMetrics,
      count: performanceMetrics.length
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch performance metrics',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// POST /api/v1/performance - Create new performance metrics
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  let userId: string | undefined;  // Declare at function scope for catch block access
  
  try {
    const { 
      date, 
      energyLevel, 
      sleepHours, 
      isTrainingDay = false, 
      trainingType, 
      matchDay = false, 
      notes 
    }: PerformanceMetricsRequest = req.body;
    console.log('=== POST /performance START ===');
    console.log('Clerk ID from auth:', req.userId);
    console.log('DB User ID from auth:', req.dbUserId);
    console.log('Request body:', req.body);

    // Use the dbUserId that was already looked up in auth middleware
    userId = req.dbUserId;
    
    if (!userId) {
      console.error('No database user ID found in request! Auth middleware should have set this.');
      console.log('Attempting fallback lookup with Clerk ID:', req.userId);
      
      // Fallback: Try to look up user if dbUserId is missing
      const clerkId = req.userId;
      if (!clerkId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      const user = await prisma.user.findUnique({
        where: { clerkId }
      });
      
      if (!user) {
        console.error('CRITICAL: User not found even in fallback lookup - clerkId:', clerkId);
        res.status(404).json({ 
          error: 'User not found in database',
          debug: process.env.NODE_ENV === 'development' ? `ClerkId: ${clerkId}` : undefined
        });
        return;
      }
      
      userId = user.id;
      console.log('Fallback lookup successful, found userId:', userId);
    }
    
    console.log('Using database user ID for performance entry:', userId);

    // Validation
    if (energyLevel === undefined || sleepHours === undefined) {
      res.status(400).json({ 
        error: 'Missing required fields',
        required: ['energyLevel', 'sleepHours']
      });
      return;
    }

    // Validate energy level (1-5 scale)
    if (energyLevel < 1 || energyLevel > 5 || !Number.isInteger(energyLevel)) {
      res.status(400).json({ 
        error: 'Energy level must be an integer between 1 and 5'
      });
      return;
    }

    // Validate sleep hours (0-24 hours)
    if (sleepHours < 0 || sleepHours > 24) {
      res.status(400).json({ 
        error: 'Sleep hours must be between 0 and 24'
      });
      return;
    }

    // Parse date or use today
    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Check if entry already exists for this date
    const existingEntry = await prisma.performanceMetric.findUnique({
      where: {
        userId_date: {
          userId,
          date: entryDate
        }
      }
    });

    let performanceMetric;
    
    if (existingEntry) {
      // Update existing entry
      performanceMetric = await prisma.performanceMetric.update({
        where: {
          userId_date: {
            userId,
            date: entryDate
          }
        },
        data: {
          energyLevel,
          sleepHours,
          isTrainingDay,
          trainingType: trainingType || null,
          matchDay,
          notes: notes || null
        }
      });
    } else {
      // Create new entry
      console.log('Creating new performance entry with userId:', userId, 'type:', typeof userId);
      performanceMetric = await prisma.performanceMetric.create({
        data: {
          userId,
          date: entryDate,
          energyLevel,
          sleepHours,
          isTrainingDay,
          trainingType: trainingType || null,
          matchDay,
          notes: notes || null
        }
      });
      console.log('Successfully created performance entry:', performanceMetric.id);
    }

    console.log('=== Performance entry created/updated successfully ===');
    console.log('Entry ID:', performanceMetric.id);
    
    res.status(existingEntry ? 200 : 201).json({
      success: true,
      data: performanceMetric,
      message: existingEntry ? 'Performance metrics updated successfully' : 'Performance metrics created successfully'
    });
  } catch (error) {
    console.error('=== ERROR creating performance metrics ===');
    console.error('Error type:', (error as any).code);
    console.error('Error message:', (error as Error).message);
    
    if ((error as any).code === 'P2003') {
      console.error('Foreign key constraint failure - userId does not exist in User table');
      console.error('Attempted userId:', userId);
    }
    
    console.error('Full error:', error);
    
    res.status(500).json({ 
      error: 'Failed to create performance metrics',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// PUT /api/v1/performance/:id - Update performance metrics
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      energyLevel, 
      sleepHours, 
      isTrainingDay, 
      trainingType, 
      matchDay, 
      notes 
    }: PerformanceMetricsRequest = req.body;
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Look up the user by Clerk ID to get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found in database' });
      return;
    }

    const userId = user.id;

    // Check if performance metric exists and belongs to user
    const existingMetric = await prisma.performanceMetric.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingMetric) {
      res.status(404).json({ error: 'Performance metric not found' });
      return;
    }

    // Validate energy level if provided
    if (energyLevel !== undefined && (energyLevel < 1 || energyLevel > 5 || !Number.isInteger(energyLevel))) {
      res.status(400).json({ 
        error: 'Energy level must be an integer between 1 and 5'
      });
      return;
    }

    // Validate sleep hours if provided
    if (sleepHours !== undefined && (sleepHours < 0 || sleepHours > 24)) {
      res.status(400).json({ 
        error: 'Sleep hours must be between 0 and 24'
      });
      return;
    }

    // Update performance metrics
    const updatedMetric = await prisma.performanceMetric.update({
      where: { id },
      data: {
        energyLevel: energyLevel !== undefined ? energyLevel : existingMetric.energyLevel,
        sleepHours: sleepHours !== undefined ? sleepHours : existingMetric.sleepHours,
        isTrainingDay: isTrainingDay !== undefined ? isTrainingDay : existingMetric.isTrainingDay,
        trainingType: trainingType !== undefined ? trainingType : existingMetric.trainingType,
        matchDay: matchDay !== undefined ? matchDay : existingMetric.matchDay,
        notes: notes !== undefined ? notes : existingMetric.notes,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedMetric,
      message: 'Performance metrics updated successfully'
    });
  } catch (error) {
    console.error('Error updating performance metrics:', error);
    res.status(500).json({ 
      error: 'Failed to update performance metrics',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// DELETE /api/v1/performance/:id - Delete performance metrics
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Look up the user by Clerk ID to get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found in database' });
      return;
    }

    const userId = user.id;

    // Check if performance metric exists and belongs to user
    const existingMetric = await prisma.performanceMetric.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingMetric) {
      res.status(404).json({ error: 'Performance metric not found' });
      return;
    }

    // Delete performance metrics
    await prisma.performanceMetric.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Performance metrics deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting performance metrics:', error);
    res.status(500).json({ 
      error: 'Failed to delete performance metrics',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// GET /api/v1/performance/trends - Get performance trends and analytics
router.get('/trends', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Look up the user by Clerk ID to get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found in database' });
      return;
    }

    const userId = user.id;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    const performanceMetrics = await prisma.performanceMetric.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: now
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    if (performanceMetrics.length === 0) {
      res.json({
        success: true,
        data: {
          period,
          trends: {
            averageEnergyLevel: 0,
            averageSleepHours: 0,
            trainingDays: 0,
            matchDays: 0,
            totalEntries: 0
          },
          dailyData: []
        }
      });
      return;
    }

    // Calculate trends
    const averageEnergyLevel = performanceMetrics.reduce((sum, metric) => sum + metric.energyLevel, 0) / performanceMetrics.length;
    const averageSleepHours = performanceMetrics.reduce((sum, metric) => sum + metric.sleepHours, 0) / performanceMetrics.length;
    const trainingDays = performanceMetrics.filter(metric => metric.isTrainingDay).length;
    const matchDays = performanceMetrics.filter(metric => metric.matchDay).length;

    // Format daily data for charts
    const dailyData = performanceMetrics.map(metric => ({
      date: metric.date.toISOString().split('T')[0],
      energyLevel: metric.energyLevel,
      sleepHours: metric.sleepHours,
      isTrainingDay: metric.isTrainingDay,
      matchDay: metric.matchDay,
      trainingType: metric.trainingType
    }));

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        trends: {
          averageEnergyLevel: Math.round(averageEnergyLevel * 10) / 10,
          averageSleepHours: Math.round(averageSleepHours * 10) / 10,
          trainingDays,
          matchDays,
          totalEntries: performanceMetrics.length
        },
        dailyData
      }
    });
  } catch (error) {
    console.error('Error fetching performance trends:', error);
    res.status(500).json({ 
      error: 'Failed to fetch performance trends',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;