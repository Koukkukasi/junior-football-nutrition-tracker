import { Router, Response } from 'express';
import { requireAuth } from '../middleware/auth-dev'; // Use dev auth
import { requireCoachOrAdmin } from '../middleware/roleAuth';
import { AuthRequest } from '../types/auth.types';
import { prisma } from '../db';
import crypto from 'crypto';

const router = Router();

// POST /api/v1/teams/create - Create a new team (Coach/Admin only)
router.post('/create', requireAuth, requireCoachOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Team name is required' });
      return;
    }

    // Generate unique invite code
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        description: description || null,
        inviteCode,
        coachId: req.dbUserId
      }
    });

    // Add creator as team member with COACH role
    await prisma.teamMember.create({
      data: {
        userId: req.dbUserId!,
        teamId: team.id,
        role: 'COACH'
      }
    });

    res.status(201).json({
      success: true,
      data: team,
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ 
      error: 'Failed to create team',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// POST /api/v1/teams/join - Join a team using invite code
router.post('/join', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { inviteCode } = req.body;
    
    if (!inviteCode) {
      res.status(400).json({ error: 'Invite code is required' });
      return;
    }

    // Find team by invite code
    const team = await prisma.team.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() }
    });

    if (!team) {
      res.status(404).json({ error: 'Invalid invite code' });
      return;
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.dbUserId!,
          teamId: team.id
        }
      }
    });

    if (existingMember) {
      res.status(400).json({ error: 'You are already a member of this team' });
      return;
    }

    // Add user to team
    const teamMember = await prisma.teamMember.create({
      data: {
        userId: req.dbUserId!,
        teamId: team.id,
        role: 'PLAYER'
      }
    });

    res.json({
      success: true,
      data: { team, membership: teamMember },
      message: `Successfully joined team: ${team.name}`
    });
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({ 
      error: 'Failed to join team',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// GET /api/v1/teams/my-teams - Get user's teams
router.get('/my-teams', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const teams = await prisma.teamMember.findMany({
      where: { userId: req.dbUserId },
      include: {
        team: {
          include: {
            _count: {
              select: { members: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: teams.map(tm => ({
        ...tm.team,
        memberRole: tm.role,
        joinedAt: tm.joinedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ 
      error: 'Failed to fetch teams',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// GET /api/v1/teams/:teamId - Get team details
router.get('/:teamId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;

    // Check if user is a member of the team
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.dbUserId!,
          teamId
        }
      }
    });

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this team' });
      return;
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                age: true,
                position: true,
                ageGroup: true
              }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        ...team,
        userRole: membership.role
      }
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ 
      error: 'Failed to fetch team details',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// GET /api/v1/teams/:teamId/stats - Get team statistics (Coach/Admin only)
router.get('/:teamId/stats', requireAuth, requireCoachOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { period = '7d' } = req.query;

    // Verify user is coach of this team or admin
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.dbUserId!,
          teamId
        }
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: req.dbUserId },
      select: { role: true }
    });

    if (!membership?.role.includes('COACH') && user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only coaches and admins can view team statistics' });
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
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get team members
    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          include: {
            foodEntries: {
              where: {
                date: {
                  gte: startDate,
                  lte: now
                }
              }
            },
            performanceMetrics: {
              where: {
                date: {
                  gte: startDate,
                  lte: now
                }
              }
            }
          }
        }
      }
    });

    // Calculate team statistics
    const stats = {
      totalMembers: teamMembers.length,
      averageMealsPerDay: 0,
      averageEnergyLevel: 0,
      averageSleepHours: 0,
      memberStats: [] as any[]
    };

    let totalMeals = 0;
    let totalEnergy = 0;
    let totalSleep = 0;
    let energyCount = 0;
    let sleepCount = 0;

    teamMembers.forEach(member => {
      const memberMeals = member.user.foodEntries.length;
      totalMeals += memberMeals;

      const memberPerformance = member.user.performanceMetrics;
      memberPerformance.forEach(metric => {
        if (metric.energyLevel) {
          totalEnergy += metric.energyLevel;
          energyCount++;
        }
        if (metric.sleepHours) {
          totalSleep += metric.sleepHours;
          sleepCount++;
        }
      });

      stats.memberStats.push({
        userId: member.user.id,
        name: member.user.name,
        role: member.role,
        mealsLogged: memberMeals,
        avgEnergyLevel: memberPerformance.length > 0 
          ? memberPerformance.reduce((sum, m) => sum + (m.energyLevel || 0), 0) / memberPerformance.length
          : 0,
        avgSleepHours: memberPerformance.length > 0
          ? memberPerformance.reduce((sum, m) => sum + (m.sleepHours || 0), 0) / memberPerformance.length
          : 0
      });
    });

    const days = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    stats.averageMealsPerDay = teamMembers.length > 0 ? totalMeals / (teamMembers.length * days) : 0;
    stats.averageEnergyLevel = energyCount > 0 ? totalEnergy / energyCount : 0;
    stats.averageSleepHours = sleepCount > 0 ? totalSleep / sleepCount : 0;

    res.json({
      success: true,
      data: {
        teamId,
        period,
        startDate,
        endDate: now,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch team statistics',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// PUT /api/v1/teams/:teamId/member/:userId/role - Update member role (Coach/Admin only)
router.put('/:teamId/member/:userId/role', requireAuth, requireCoachOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['PLAYER', 'COACH', 'ASSISTANT'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ 
        error: 'Invalid role',
        validRoles 
      });
      return;
    }

    // Verify user is coach of this team or admin
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.dbUserId!,
          teamId
        }
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: req.dbUserId },
      select: { role: true }
    });

    if (!membership?.role.includes('COACH') && user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only coaches and admins can update member roles' });
      return;
    }

    // Update member role
    const updatedMember = await prisma.teamMember.update({
      where: {
        userId_teamId: {
          userId,
          teamId
        }
      },
      data: { role }
    });

    res.json({
      success: true,
      data: updatedMember,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ 
      error: 'Failed to update member role',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// GET /api/v1/teams/:teamId/compare - Compare team with others (Coach/Admin only)
router.get('/:teamId/compare', requireAuth, requireCoachOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { compareWith, period = '30d' } = req.query;

    // Verify user is coach of this team or admin
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.dbUserId!,
          teamId
        }
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: req.dbUserId },
      select: { role: true }
    });

    if (!membership?.role.includes('COACH') && user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only coaches and admins can compare teams' });
      return;
    }

    // Calculate date range
    const now = new Date();
    const days = parseInt(period as string) || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get team statistics
    const getTeamStats = async (teamId: string) => {
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId },
        include: {
          user: {
            include: {
              foodEntries: {
                where: {
                  date: { gte: startDate, lte: now }
                },
                select: {
                  nutritionScore: true,
                  quality: true,
                  calories: true
                }
              },
              performanceMetrics: {
                where: {
                  date: { gte: startDate, lte: now }
                },
                select: {
                  energyLevel: true,
                  sleepHours: true,
                  isTrainingDay: true
                }
              }
            }
          },
          team: {
            select: {
              name: true,
              description: true
            }
          }
        }
      });

      const members = teamMembers.length;
      let totalNutritionScore = 0;
      let totalCalories = 0;
      let totalEnergy = 0;
      let totalSleep = 0;
      let nutritionCount = 0;
      let energyCount = 0;

      teamMembers.forEach(member => {
        member.user.foodEntries.forEach(entry => {
          if (entry.nutritionScore) {
            totalNutritionScore += entry.nutritionScore;
            nutritionCount++;
          }
          if (entry.calories) {
            totalCalories += entry.calories;
          }
        });

        member.user.performanceMetrics.forEach(metric => {
          if (metric.energyLevel) {
            totalEnergy += metric.energyLevel;
            energyCount++;
          }
          if (metric.sleepHours) {
            totalSleep += metric.sleepHours;
          }
        });
      });

      return {
        teamId,
        teamName: teamMembers[0]?.team.name || 'Unknown',
        members,
        avgNutritionScore: nutritionCount > 0 ? Math.round(totalNutritionScore / nutritionCount) : 0,
        avgCaloriesPerMember: members > 0 ? Math.round(totalCalories / members) : 0,
        avgEnergyLevel: energyCount > 0 ? Math.round((totalEnergy / energyCount) * 10) / 10 : 0,
        avgSleepHours: energyCount > 0 ? Math.round((totalSleep / energyCount) * 10) / 10 : 0,
        completionRate: members > 0 ? Math.round((nutritionCount / (members * days)) * 100) : 0
      };
    };

    // Get current team stats
    const currentTeamStats = await getTeamStats(teamId);

    // Get comparison teams stats
    let comparisonStats: any[] = [];
    if (compareWith === 'all') {
      // Compare with all teams (limit to 5 for performance)
      const allTeams = await prisma.team.findMany({
        where: { id: { not: teamId } },
        take: 5,
        select: { id: true }
      });
      
      comparisonStats = await Promise.all(
        allTeams.map(team => getTeamStats(team.id))
      );
    } else if (compareWith) {
      // Compare with specific team
      comparisonStats = [await getTeamStats(compareWith as string)];
    }

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        currentTeam: currentTeamStats,
        comparisonTeams: comparisonStats,
        rankings: {
          nutritionScore: [...comparisonStats, currentTeamStats]
            .sort((a, b) => b.avgNutritionScore - a.avgNutritionScore)
            .map((t, i) => ({ ...t, rank: i + 1 })),
          energyLevel: [...comparisonStats, currentTeamStats]
            .sort((a, b) => b.avgEnergyLevel - a.avgEnergyLevel)
            .map((t, i) => ({ ...t, rank: i + 1 }))
        }
      }
    });
  } catch (error) {
    console.error('Error comparing teams:', error);
    res.status(500).json({ 
      error: 'Failed to compare teams',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// DELETE /api/v1/teams/:teamId/leave - Leave a team
router.delete('/:teamId/leave', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;

    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.dbUserId!,
          teamId
        }
      }
    });

    if (!membership) {
      res.status(404).json({ error: 'You are not a member of this team' });
      return;
    }

    // Check if user is the only coach
    if (membership.role === 'COACH') {
      const otherCoaches = await prisma.teamMember.count({
        where: {
          teamId,
          role: 'COACH',
          userId: { not: req.dbUserId }
        }
      });

      if (otherCoaches === 0) {
        res.status(400).json({ 
          error: 'Cannot leave team as the only coach. Assign another coach first.' 
        });
        return;
      }
    }

    // Remove member from team
    await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          userId: req.dbUserId!,
          teamId
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully left the team'
    });
  } catch (error) {
    console.error('Error leaving team:', error);
    res.status(500).json({ 
      error: 'Failed to leave team',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;