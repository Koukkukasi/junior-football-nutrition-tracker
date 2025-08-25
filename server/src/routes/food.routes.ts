import { Router, Response } from 'express';
import { requireAuth } from '../middleware/auth-dev'; // Use dev auth
import { AuthRequest } from '../types/auth.types';
import { prisma } from '../db';
import { analyzeFoodQuality, getAgeGroup } from '../services/nutritionAnalyzer';

const router = Router();

// Interface for food entry request
interface FoodEntryRequest {
  mealType: 'BREAKFAST' | 'SNACK' | 'LUNCH' | 'DINNER' | 'EVENING_SNACK';
  time: string;
  location: string;
  description: string;
  notes?: string;
  date?: string;
}

// AuthRequest is imported from middleware

// GET /api/v1/food - Get user's food entries
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { date, limit = '10', offset = '0' } = req.query;
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ 
        success: false,
        error: 'User not authenticated',
        code: 'NO_AUTH'
      });
      return;
    }

    // Look up the user by Clerk ID to get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ 
        success: false,
        error: 'User not found in database',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    const userId = user.id;

    // Build date filter
    const dateFilter = date 
      ? {
          date: {
            gte: new Date(date as string),
            lt: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000)
          }
        }
      : {};

    const foodEntries = await prisma.foodEntry.findMany({
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
      data: foodEntries,
      count: foodEntries.length
    });
  } catch (error) {
    console.error('Error fetching food entries:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch food entries',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      code: 'FETCH_ERROR'
    });
  }
});

// POST /api/v1/food - Create new food entry with nutrition analysis
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { mealType, time, location, description, notes, date, mealTiming }: FoodEntryRequest & { mealTiming?: 'pre-game' | 'post-game' | 'regular' } = req.body;
    const clerkId = req.userId;
    console.log('POST /food - Received request with clerkId:', clerkId);
    console.log('Request body:', req.body);

    if (!clerkId) {
      res.status(401).json({ 
        success: false,
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    // Validation
    if (!mealType || !time || !location || !description) {
      res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        required: ['mealType', 'time', 'location', 'description'],
        code: 'MISSING_FIELDS'
      });
      return;
    }

    // Validate meal type
    const validMealTypes = ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER', 'EVENING_SNACK'];
    if (!validMealTypes.includes(mealType)) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid meal type',
        validTypes: validMealTypes,
        code: 'INVALID_MEAL_TYPE'
      });
      return;
    }

    // Parse date or use today
    const entryDate = date ? new Date(date) : new Date();

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Verify user exists in transaction
      const user = await tx.user.findUnique({
        where: { clerkId }
      });
      console.log('Found user:', user ? { id: user.id, name: user.name, age: user.age } : 'null');

      if (!user) {
        throw new Error('User not found in database');
      }
      
      // Analyze nutrition
      const ageGroup = user.age ? getAgeGroup(user.age) : undefined;
      const nutritionAnalysis = analyzeFoodQuality(
        description,
        mealTiming,
        user.age || undefined,
        ageGroup
      );
      
      console.log('Nutrition analysis:', nutritionAnalysis);
      
      // Create food entry with nutrition data
      const foodEntry = await tx.foodEntry.create({
        data: {
          userId: user.id,
          mealType,
          time,
          location,
          description,
          notes: notes || null,
          date: entryDate,
          nutritionScore: nutritionAnalysis.score,
          quality: nutritionAnalysis.quality,
          calories: nutritionAnalysis.macroEstimates.calories,
          protein: nutritionAnalysis.macroEstimates.protein,
          carbs: nutritionAnalysis.macroEstimates.carbs,
          fats: nutritionAnalysis.macroEstimates.fats
        }
      });

      return { foodEntry, nutritionAnalysis };
    });

    res.status(201).json({
      success: true,
      data: result.foodEntry,
      nutrition: result.nutritionAnalysis,
      message: 'Food entry created successfully'
    });
  } catch (error: any) {
    console.error('Error creating food entry:', error);
    
    // Proper error responses
    if (error.message === 'User not found in database') {
      res.status(404).json({ 
        success: false,
        error: 'User not found in database',
        code: 'USER_NOT_FOUND'
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Failed to create food entry',
        code: 'DATABASE_ERROR',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// PUT /api/v1/food/:id - Update food entry
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { mealType, time, location, description, notes }: FoodEntryRequest = req.body;
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ 
        success: false,
        error: 'User not authenticated',
        code: 'NO_AUTH'
      });
      return;
    }

    // Look up the user by Clerk ID to get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ 
        success: false,
        error: 'User not found in database',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    const userId = user.id;

    // Check if food entry exists and belongs to user
    const existingEntry = await prisma.foodEntry.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingEntry) {
      res.status(404).json({ error: 'Food entry not found' });
      return;
    }

    // Update food entry
    const updatedEntry = await prisma.foodEntry.update({
      where: { id },
      data: {
        mealType: mealType || existingEntry.mealType,
        time: time || existingEntry.time,
        location: location || existingEntry.location,
        description: description || existingEntry.description,
        notes: notes !== undefined ? notes : existingEntry.notes,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedEntry,
      message: 'Food entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating food entry:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update food entry',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      code: 'UPDATE_ERROR'
    });
  }
});

// DELETE /api/v1/food/:id - Delete food entry
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ 
        success: false,
        error: 'User not authenticated',
        code: 'NO_AUTH'
      });
      return;
    }

    // Look up the user by Clerk ID to get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ 
        success: false,
        error: 'User not found in database',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    const userId = user.id;

    // Check if food entry exists and belongs to user
    const existingEntry = await prisma.foodEntry.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingEntry) {
      res.status(404).json({ error: 'Food entry not found' });
      return;
    }

    // Delete food entry
    await prisma.foodEntry.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Food entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting food entry:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete food entry',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      code: 'DELETE_ERROR'
    });
  }
});

// GET /api/v1/food/summary - Get nutrition summary
router.get('/summary', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { date, period = 'day' } = req.query;
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ 
        success: false,
        error: 'User not authenticated',
        code: 'NO_AUTH'
      });
      return;
    }

    // Look up the user by Clerk ID to get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ 
        success: false,
        error: 'User not found in database',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    const userId = user.id;

    const targetDate = date ? new Date(date as string) : new Date();
    let startDate: Date;
    let endDate: Date;

    // Calculate date range based on period
    if (period === 'week') {
      startDate = new Date(targetDate);
      startDate.setDate(targetDate.getDate() - targetDate.getDay()); // Start of week
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
    } else {
      // Default to day
      startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const foodEntries = await prisma.foodEntry.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Group by meal type
    const mealTypeCount = foodEntries.reduce((acc, entry) => {
      acc[entry.mealType] = (acc[entry.mealType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate basic completion metrics
    const totalMeals = foodEntries.length;
    const uniqueDays = [...new Set(foodEntries.map(entry => entry.date.toDateString()))].length;
    const avgMealsPerDay = uniqueDays > 0 ? totalMeals / uniqueDays : 0;

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate,
        totalEntries: totalMeals,
        uniqueDays,
        avgMealsPerDay: Math.round(avgMealsPerDay * 10) / 10,
        mealTypeBreakdown: mealTypeCount,
        entries: foodEntries
      }
    });
  } catch (error) {
    console.error('Error fetching food summary:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch food summary',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      code: 'SUMMARY_ERROR'
    });
  }
});

export default router;