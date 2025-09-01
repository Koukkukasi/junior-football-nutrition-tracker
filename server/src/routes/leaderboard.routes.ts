import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Get individual leaderboard
router.get('/individual', async (req: Request, res: Response) => {
  try {
    const { period = 'week' } = req.query;
    
    // For now, return mock data until database is properly migrated
    const mockData = [
      {
        id: '1',
        rank: 1,
        name: 'Emma Virtanen',
        team: 'FC Inter P13',
        totalXP: 2850,
        nutritionScore: 92,
        streak: 15,
        mealsLogged: 75,
        weeklyXP: 450,
        position: 'Forward'
      },
      {
        id: '2',
        rank: 2,
        name: 'Mikko Järvinen',
        team: 'FC Inter P13',
        totalXP: 2720,
        nutritionScore: 88,
        streak: 12,
        mealsLogged: 71,
        weeklyXP: 420,
        position: 'Midfielder'
      },
      {
        id: '3',
        rank: 3,
        name: 'Sofia Hakkarainen',
        team: 'HJK Juniors',
        totalXP: 2650,
        nutritionScore: 90,
        streak: 8,
        mealsLogged: 68,
        weeklyXP: 380,
        position: 'Defender'
      }
    ];

    // Adjust data based on period
    let data = [...mockData];
    if (period === 'week') {
      data = data.map(entry => ({
        ...entry,
        totalXP: entry.weeklyXP || entry.totalXP / 6
      }));
    } else if (period === 'month') {
      data = data.map(entry => ({
        ...entry,
        totalXP: (entry.weeklyXP || 0) * 4
      }));
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching individual leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

// Get team leaderboard
router.get('/teams', async (req: Request, res: Response) => {
  try {
    const { period = 'week' } = req.query;
    console.log('Team leaderboard period:', period); // Use the variable
    
    // Mock data for teams
    const mockData = [
      {
        id: '1',
        rank: 1,
        teamName: 'FC Inter P13',
        memberCount: 18,
        avgNutritionScore: 86,
        totalXP: 42500,
        topPerformer: 'Emma Virtanen',
        weeklyProgress: 12
      },
      {
        id: '2',
        rank: 2,
        teamName: 'HJK Juniors',
        memberCount: 22,
        avgNutritionScore: 84,
        totalXP: 41200,
        topPerformer: 'Sofia Hakkarainen',
        weeklyProgress: 8
      },
      {
        id: '3',
        rank: 3,
        teamName: 'KuPS Academy',
        memberCount: 20,
        avgNutritionScore: 82,
        totalXP: 39800,
        topPerformer: 'Aino Korhonen',
        weeklyProgress: 15
      }
    ];

    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('Error fetching team leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team leaderboard'
    });
  }
});

// Get user's rank
router.get('/user-rank/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { period = 'week' } = req.query;
    
    // Mock user rank
    const rank = Math.floor(Math.random() * 10) + 1;
    
    res.json({
      success: true,
      data: {
        userId,
        rank,
        period,
        totalPlayers: 100
      }
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user rank'
    });
  }
});

// Update user XP (called when user logs meals, completes tasks, etc.)
router.post('/update-xp', async (req: Request, res: Response) => {
  try {
    const { userId, xpEarned, reason } = req.body;
    
    // In production, this would update the user's XP in the database
    // For now, just return success
    res.json({
      success: true,
      data: {
        userId,
        xpEarned,
        newTotal: 1850 + xpEarned,
        reason
      }
    });
  } catch (error) {
    console.error('Error updating XP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update XP'
    });
  }
});

export default router;