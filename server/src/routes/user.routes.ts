import { Router, Response } from 'express';
import { requireAuth } from '../middleware/supabase-auth'; // Use dev auth
import { AuthRequest } from '../types/auth.types';
import { prisma } from '../db';

const router = Router();

// Save onboarding data
router.post('/onboarding', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      role,
      ageGroup, 
      position, 
      goals, 
      trainingDays, 
      teamCode,
      completedOnboarding 
    } = req.body;

    // First check if user exists, if not create them
    let user = await prisma.user.findUnique({
      where: { clerkId: req.userId }
    });

    if (!user) {
      // Create new user with data from Clerk
      const clerkUser = req.user;
      user = await prisma.user.create({
        data: {
          clerkId: req.userId!,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Player',
          age: 16, // Default age, will be updated based on ageGroup
          role: role || 'PLAYER',
          ageGroup,
          position,
          goals: goals || [],
          trainingDaysPerWeek: trainingDays,
          completedOnboarding: completedOnboarding || false,
          onboardingDate: new Date()
        }
      });
    } else {
      // Update existing user with onboarding data
      user = await prisma.user.update({
        where: { clerkId: req.userId },
        data: {
          role: role || 'PLAYER',
          ageGroup,
          position,
          goals: goals || [],
          trainingDaysPerWeek: trainingDays,
          completedOnboarding: completedOnboarding || false,
          onboardingDate: new Date()
        }
      });
    }

    // If team code provided, try to join team
    if (teamCode) {
      const team = await prisma.team.findUnique({
        where: { inviteCode: teamCode }
      });

      if (team) {
        await prisma.teamMember.create({
          data: {
            userId: user.id,
            teamId: team.id,
            role: 'PLAYER',
            joinedAt: new Date()
          }
        });
      }
    }

    res.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      user 
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save onboarding data' 
    });
  }
});

// Get user profile with onboarding status
router.get('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: req.userId },
      include: {
        teams: {
          include: {
            team: true
          }
        }
      }
    });

    if (!user) {
      // Create a new user from Clerk data
      const clerkUser = req.user;
      user = await prisma.user.create({
        data: {
          clerkId: req.userId!,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Player',
          age: 16, // Default age
          role: 'PLAYER',
          completedOnboarding: false
        },
        include: {
          teams: {
            include: {
              team: true
            }
          }
        }
      });
    }

    return res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch profile' 
    });
  }
});

// Update user preferences
router.put('/preferences', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      mealReminders, 
      dailySummary, 
      weeklyReport,
      notificationTime 
    } = req.body;

    const user = await prisma.user.update({
      where: { clerkId: req.userId },
      data: {
        preferences: {
          mealReminders: mealReminders ?? true,
          dailySummary: dailySummary ?? true,
          weeklyReport: weeklyReport ?? false,
          notificationTime: notificationTime || '12:00'
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Preferences updated',
      user 
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update preferences' 
    });
  }
});

// Get demo data for new users
router.get('/demo-data', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    // Sample meals for different times of day
    const demoMeals = [
      {
        description: 'Oatmeal with berries and honey',
        mealType: 'BREAKFAST',
        timing: 'regular',
        quality: 'excellent',
        score: 90,
        suggestions: ['Great choice for morning energy!', 'Add some nuts for extra protein']
      },
      {
        description: 'Grilled chicken salad with vegetables',
        mealType: 'LUNCH',
        timing: 'regular',
        quality: 'excellent',
        score: 95,
        suggestions: ['Perfect balanced meal!', 'Consider adding whole grain bread']
      },
      {
        description: 'Pasta with tomato sauce and lean beef',
        mealType: 'DINNER',
        timing: 'post-game',
        quality: 'good',
        score: 85,
        suggestions: ['Good recovery meal', 'Add more vegetables for vitamins']
      },
      {
        description: 'Apple slices with peanut butter',
        mealType: 'SNACK',
        timing: 'regular',
        quality: 'good',
        score: 80,
        suggestions: ['Healthy snack choice!', 'Great pre-training option']
      }
    ];

    // Sample performance metrics
    const demoPerformance = {
      energyLevel: 8,
      trainingQuality: 9,
      recoveryQuality: 7,
      hydrationLevel: 8,
      sleepHours: 8
    };

    res.json({ 
      success: true,
      demoMeals,
      demoPerformance,
      message: 'Demo data loaded - feel free to explore the app!'
    });
  } catch (error) {
    console.error('Demo data error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load demo data' 
    });
  }
});

// Get user stats for dashboard
router.get('/stats', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const clerkId = req.userId;
    
    if (!clerkId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Fetch user's data
    const [todayFoodEntries, weekPerformance, weekFoodEntries] = await Promise.all([
      // Today's meals
      prisma.foodEntry.count({
        where: {
          userId: user.id,
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      // Week's performance metrics
      prisma.performanceMetric.findMany({
        where: {
          userId: user.id,
          date: {
            gte: weekAgo,
            lte: today
          }
        }
      }),
      // Week's food entries for nutrition score
      prisma.foodEntry.findMany({
        where: {
          userId: user.id,
          date: {
            gte: weekAgo,
            lte: today
          }
        }
      })
    ]);

    // Calculate averages
    const weekAvgEnergy = weekPerformance.length > 0
      ? weekPerformance.reduce((sum, p) => sum + p.energyLevel, 0) / weekPerformance.length
      : 0;
    
    const sleepAvg = weekPerformance.length > 0
      ? weekPerformance.reduce((sum, p) => sum + p.sleepHours, 0) / weekPerformance.length
      : 0;
    
    const trainingDays = weekPerformance.filter(p => p.isTrainingDay).length;

    // Calculate nutrition score (simplified)
    const mealFrequency = weekFoodEntries.length / 7; // Average meals per day
    const nutritionScore = Math.min(100, Math.round((mealFrequency / 5) * 100)); // 5 meals target

    res.json({
      success: true,
      stats: {
        todayMeals: todayFoodEntries,
        weekAvgEnergy: Math.round(weekAvgEnergy * 10) / 10,
        sleepAvg: Math.round(sleepAvg * 10) / 10,
        trainingDays,
        nutritionScore
      }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user stats' 
    });
  }
});

export default router;