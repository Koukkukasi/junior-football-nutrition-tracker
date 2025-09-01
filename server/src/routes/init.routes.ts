import { Router, Response, Request } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/v1/init/fc-inter-team - Initialize FC Inter P13 2012 team
router.get('/fc-inter-team', async (_req: Request, res: Response) => {
  try {
    console.log('Initializing FC Inter P13 2012 team...');
    
    // Check if team already exists
    const existingTeam = await prisma.team.findUnique({
      where: { inviteCode: 'INTER2012' }
    });

    if (existingTeam) {
      // Get member count
      const memberCount = await prisma.teamMember.count({
        where: { teamId: existingTeam.id }
      });
      
      res.json({
        success: true,
        message: 'Team already exists',
        data: {
          ...existingTeam,
          memberCount
        }
      });
      return;
    }

    // Create the team if it doesn't exist
    const team = await prisma.team.create({
      data: {
        name: 'FC Inter P13 2012',
        description: 'U13 competitive team focusing on nutrition and performance',
        inviteCode: 'INTER2012'
      }
    });

    res.json({
      success: true,
      message: 'Team created successfully',
      data: {
        ...team,
        memberCount: 0
      }
    });
  } catch (error) {
    console.error('Error initializing FC Inter team:', error);
    res.status(500).json({ 
      error: 'Failed to initialize team',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// GET /api/v1/init/status - Check initialization status
router.get('/status', async (_req: Request, res: Response) => {
  try {
    // Check if FC Inter team exists
    const fcInterTeam = await prisma.team.findUnique({
      where: { inviteCode: 'INTER2012' },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    res.json({
      success: true,
      data: {
        fcInterTeamExists: !!fcInterTeam,
        fcInterTeam: fcInterTeam ? {
          id: fcInterTeam.id,
          name: fcInterTeam.name,
          inviteCode: fcInterTeam.inviteCode,
          memberCount: fcInterTeam._count.members
        } : null
      }
    });
  } catch (error) {
    console.error('Error checking initialization status:', error);
    res.status(500).json({ 
      error: 'Failed to check status',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;