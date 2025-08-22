import { Router, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth.types';
import { prisma } from '../db';

const router = Router();

// GET /api/v1/analytics/nutrition-trends - Get nutrition trends over time
router.get('/nutrition-trends', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { period = '30d' } = req.query;
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // First get the user to get the database ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get food entries for the period
    const foodEntries = await prisma.foodEntry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: now
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Group entries by day and calculate nutrition scores
    const trendData = foodEntries.reduce((acc, entry) => {
      const dateKey = entry.date.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          meals: [],
          mealCount: 0,
          qualityScore: 0
        };
      }
      
      acc[dateKey].meals.push(entry);
      acc[dateKey].mealCount++;
      
      // Simple quality score based on description keywords
      const qualityKeywords = {
        excellent: ['protein shake', 'salad', 'grilled', 'vegetables', 'fruits', 'whole grain'],
        good: ['chicken', 'fish', 'rice', 'pasta', 'milk', 'yogurt'],
        fair: ['sandwich', 'cereal', 'juice', 'bread'],
        poor: ['candy', 'chips', 'soda', 'pizza', 'burger', 'fries']
      };
      
      let score = 50; // Base score
      const description = entry.description.toLowerCase();
      
      qualityKeywords.excellent.forEach(keyword => {
        if (description.includes(keyword)) score += 10;
      });
      qualityKeywords.good.forEach(keyword => {
        if (description.includes(keyword)) score += 5;
      });
      qualityKeywords.poor.forEach(keyword => {
        if (description.includes(keyword)) score -= 10;
      });
      
      acc[dateKey].qualityScore = Math.max(0, Math.min(100, 
        (acc[dateKey].qualityScore * (acc[dateKey].mealCount - 1) + score) / acc[dateKey].mealCount
      ));
      
      return acc;
    }, {} as Record<string, any>);

    const trends = Object.values(trendData).map((day: any) => ({
      date: day.date,
      mealCount: day.mealCount,
      qualityScore: Math.round(day.qualityScore),
      mealCompletion: Math.min(100, (day.mealCount / 5) * 100) // 5 meals per day target
    }));

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        trends,
        summary: {
          averageMealsPerDay: trends.reduce((sum, t) => sum + t.mealCount, 0) / trends.length,
          averageQuality: trends.reduce((sum, t) => sum + t.qualityScore, 0) / trends.length,
          totalDays: trends.length,
          totalMeals: foodEntries.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching nutrition trends:', error);
    res.status(500).json({ 
      error: 'Failed to fetch nutrition trends',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// GET /api/v1/analytics/performance-correlations - Get correlations between nutrition and performance
router.get('/performance-correlations', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { period = '30d' } = req.query;
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // First get the user to get the database ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const now = new Date();
    const periodDays = parseInt(period as string) || 30;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Get both food entries and performance metrics
    const [foodEntries, performanceMetrics] = await Promise.all([
      prisma.foodEntry.findMany({
        where: {
          userId: user.id,
          date: { gte: startDate, lte: now }
        },
        orderBy: { date: 'asc' }
      }),
      prisma.performanceMetric.findMany({
        where: {
          userId: user.id,
          date: { gte: startDate, lte: now }
        },
        orderBy: { date: 'asc' }
      })
    ]);

    // Create daily aggregates
    const dailyData: Record<string, any> = {};

    // Process food entries
    foodEntries.forEach(entry => {
      const dateKey = entry.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          mealCount: 0,
          nutritionScore: 50,
          energyLevel: null,
          sleepHours: null,
          isTrainingDay: false
        };
      }
      dailyData[dateKey].mealCount++;
    });

    // Process performance metrics
    performanceMetrics.forEach(metric => {
      const dateKey = metric.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          mealCount: 0,
          nutritionScore: 50,
          energyLevel: metric.energyLevel,
          sleepHours: metric.sleepHours,
          isTrainingDay: metric.isTrainingDay
        };
      } else {
        dailyData[dateKey].energyLevel = metric.energyLevel;
        dailyData[dateKey].sleepHours = metric.sleepHours;
        dailyData[dateKey].isTrainingDay = metric.isTrainingDay;
      }
    });

    // Calculate correlations
    const correlationData = Object.values(dailyData).filter(d => 
      d.energyLevel !== null && d.mealCount > 0
    );

    // Simple correlation calculation
    const correlations = {
      mealsVsEnergy: calculateCorrelation(
        correlationData.map(d => d.mealCount),
        correlationData.map(d => d.energyLevel)
      ),
      sleepVsEnergy: calculateCorrelation(
        correlationData.map(d => d.sleepHours).filter(s => s !== null),
        correlationData.map(d => d.energyLevel).filter((_, i) => 
          correlationData[i].sleepHours !== null
        )
      ),
      trainingDayPerformance: {
        trainingDays: correlationData.filter(d => d.isTrainingDay).length,
        avgEnergyOnTraining: correlationData
          .filter(d => d.isTrainingDay)
          .reduce((sum, d) => sum + d.energyLevel, 0) / 
          (correlationData.filter(d => d.isTrainingDay).length || 1),
        avgEnergyOnRest: correlationData
          .filter(d => !d.isTrainingDay)
          .reduce((sum, d) => sum + d.energyLevel, 0) / 
          (correlationData.filter(d => !d.isTrainingDay).length || 1)
      }
    };

    res.json({
      success: true,
      data: {
        period,
        correlations,
        dailyData: Object.values(dailyData),
        insights: generateInsights(correlations)
      }
    });
  } catch (error) {
    console.error('Error fetching performance correlations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch performance correlations',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// GET /api/v1/analytics/recommendations - Get personalized recommendations
router.get('/recommendations', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // First get the user to get the database ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get user's recent data (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [recentFoodEntries, recentPerformance] = await Promise.all([
      prisma.foodEntry.findMany({
        where: {
          userId: user.id,
          date: { gte: weekAgo }
        }
      }),
      prisma.performanceMetric.findMany({
        where: {
          userId: user.id,
          date: { gte: weekAgo }
        }
      })
    ]);

    // Calculate metrics
    const avgMealsPerDay = recentFoodEntries.length / 7;
    const avgEnergy = recentPerformance.reduce((sum, p) => sum + p.energyLevel, 0) / 
      (recentPerformance.length || 1);
    const avgSleep = recentPerformance.reduce((sum, p) => sum + p.sleepHours, 0) / 
      (recentPerformance.length || 1);

    // Generate recommendations based on data
    const recommendations = [];

    // Meal frequency recommendations
    if (avgMealsPerDay < 4) {
      recommendations.push({
        type: 'nutrition',
        priority: 'high',
        title: 'Increase Meal Frequency',
        description: `You're averaging ${avgMealsPerDay.toFixed(1)} meals per day. Try to eat 5 balanced meals daily for optimal energy.`,
        action: 'Set meal reminders for breakfast, snack, lunch, dinner, and evening snack.'
      });
    }

    // Sleep recommendations
    if (avgSleep < 7) {
      recommendations.push({
        type: 'recovery',
        priority: 'high',
        title: 'Improve Sleep Duration',
        description: `You're averaging ${avgSleep.toFixed(1)} hours of sleep. Aim for 8-9 hours for better recovery.`,
        action: 'Set a consistent bedtime routine and avoid screens 1 hour before sleep.'
      });
    }

    // Energy level recommendations
    if (avgEnergy < 3) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Boost Energy Levels',
        description: 'Your energy levels have been below optimal. This might be related to nutrition or sleep.',
        action: 'Focus on eating protein-rich breakfasts and staying hydrated throughout the day.'
      });
    }

    // Age-specific recommendations
    const age = user?.age || 16;
    const ageGroup = age <= 12 ? '10-12' : age <= 15 ? '13-15' : age <= 18 ? '16-18' : '19-25';
    if (ageGroup === '10-12' || ageGroup === '13-15') {
      recommendations.push({
        type: 'growth',
        priority: 'medium',
        title: 'Support Growth & Development',
        description: 'During growth spurts, your nutritional needs increase significantly.',
        action: 'Include calcium-rich foods (milk, yogurt) and lean proteins in every meal.'
      });
    }

    // Training day recommendations
    const trainingDays = recentPerformance.filter(p => p.isTrainingDay).length;
    if (trainingDays > 5) {
      recommendations.push({
        type: 'recovery',
        priority: 'high',
        title: 'Schedule Rest Days',
        description: 'You\'ve had many training days recently. Recovery is crucial for performance.',
        action: 'Plan at least 2 rest days per week to allow your body to recover and adapt.'
      });
    }

    res.json({
      success: true,
      data: {
        recommendations,
        metrics: {
          avgMealsPerDay: Math.round(avgMealsPerDay * 10) / 10,
          avgEnergyLevel: Math.round(avgEnergy * 10) / 10,
          avgSleepHours: Math.round(avgSleep * 10) / 10,
          trainingDaysPerWeek: trainingDays
        },
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// GET /api/v1/analytics/goals - Get user goals and progress
router.get('/goals', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // For now, return sample goals (in production, these would be stored in DB)
    const goals = [
      {
        id: '1',
        type: 'nutrition',
        title: 'Eat 5 meals daily',
        target: 5,
        current: 4.2,
        unit: 'meals',
        progress: 84,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        type: 'sleep',
        title: 'Sleep 8+ hours nightly',
        target: 8,
        current: 7.3,
        unit: 'hours',
        progress: 91,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        type: 'energy',
        title: 'Maintain energy level 4+',
        target: 4,
        current: 3.5,
        unit: 'level',
        progress: 87,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      }
    ];

    res.json({
      success: true,
      data: {
        goals,
        achievements: {
          streaks: {
            currentMealStreak: 3,
            longestMealStreak: 7,
            currentSleepStreak: 5,
            longestSleepStreak: 12
          },
          milestones: [
            { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), title: '7-day meal tracking streak' },
            { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), title: 'First perfect nutrition day' }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ 
      error: 'Failed to fetch goals',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Helper function to calculate correlation coefficient
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
  const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);
  
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return isNaN(correlation) ? 0 : Math.round(correlation * 100) / 100;
}

// Helper function to generate insights from correlations
function generateInsights(correlations: any): string[] {
  const insights = [];
  
  if (correlations.mealsVsEnergy > 0.5) {
    insights.push('Strong positive correlation between meal frequency and energy levels');
  } else if (correlations.mealsVsEnergy < -0.3) {
    insights.push('Eating more frequently may not be improving your energy - focus on meal quality');
  }
  
  if (correlations.sleepVsEnergy > 0.6) {
    insights.push('Your energy levels are strongly influenced by sleep quality');
  }
  
  if (correlations.trainingDayPerformance.avgEnergyOnTraining < 
      correlations.trainingDayPerformance.avgEnergyOnRest) {
    insights.push('Your energy is lower on training days - consider pre-workout nutrition');
  }
  
  return insights;
}

export default router;