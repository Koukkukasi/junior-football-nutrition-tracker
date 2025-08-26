import { Router, Response } from 'express';
import { requireAuth } from '../middleware/supabase-auth';
import { requireAdmin } from '../middleware/roleAuth';
import { AuthRequest } from '../types/auth.types';
import { prisma } from '../db';

const router = Router();

// GET /api/v1/admin/stats - Get system-wide statistics (Admin only)
router.get('/stats', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });
    
    // Get today's active users (users who logged food today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const activeUsersToday = await prisma.foodEntry.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    });
    
    // Get total food entries
    const totalFoodEntries = await prisma.foodEntry.count();
    
    // Get food entries today
    const foodEntriesToday = await prisma.foodEntry.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    // Get this week's food entries
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const foodEntriesThisWeek = await prisma.foodEntry.count({
      where: {
        date: {
          gte: weekAgo
        }
      }
    });
    
    // Get performance metrics count
    const totalPerformanceMetrics = await prisma.performanceMetric.count();
    
    // Get teams count
    const totalTeams = await prisma.team.count();
    
    // Get recent activity (last 10 food entries)
    const recentActivity = await prisma.foodEntry.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    // Format the response
    const stats = {
      users: {
        total: totalUsers,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<string, number>),
        activeToday: activeUsersToday.length
      },
      foodEntries: {
        total: totalFoodEntries,
        today: foodEntriesToday,
        thisWeek: foodEntriesThisWeek,
        averagePerDay: foodEntriesThisWeek / 7
      },
      performance: {
        totalMetrics: totalPerformanceMetrics
      },
      teams: {
        total: totalTeams
      },
      recentActivity: recentActivity.map(entry => ({
        id: entry.id,
        userName: entry.user.name,
        userEmail: entry.user.email,
        mealType: entry.mealType,
        description: entry.description.substring(0, 50) + '...',
        date: entry.date,
        createdAt: entry.createdAt
      }))
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch admin statistics',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// GET /api/v1/admin/users - Get all users with details (Admin only)
router.get('/users', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        age: true,
        role: true,
        position: true,
        ageGroup: true,
        completedOnboarding: true,
        createdAt: true,
        _count: {
          select: {
            foodEntries: true,
            performanceMetrics: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// PUT /api/v1/admin/users/:userId/role - Update user role (Admin only)
router.put('/users/:userId/role', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Validate role
    const validRoles = ['PLAYER', 'COACH', 'ADMIN'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ 
        error: 'Invalid role',
        validRoles 
      });
      return;
    }
    
    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
    
    res.json({
      success: true,
      data: updatedUser,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ 
      error: 'Failed to update user role',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// DELETE /api/v1/admin/users/:userId - Delete user (Admin only)
router.delete('/users/:userId', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Don't allow admin to delete themselves
    if (userId === req.dbUserId) {
      res.status(400).json({ 
        error: 'Cannot delete your own account' 
      });
      return;
    }
    
    // Soft delete by setting deletedAt
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() }
    });
    
    res.json({
      success: true,
      message: `User ${deletedUser.name} has been deleted`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;