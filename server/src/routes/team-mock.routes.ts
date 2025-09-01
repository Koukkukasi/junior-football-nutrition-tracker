import { Router, Response } from 'express';
import { requireMockAuth, MockAuthRequest } from '../middleware/mock-auth';

const router = Router();

// Mock data for FC Inter team
const MOCK_TEAMS = new Map();
const MOCK_TEAM_MEMBERS = new Map();

// Initialize FC Inter P13 2012 team
const FC_INTER_TEAM = {
  id: 'fc-inter-2012',
  name: 'FC Inter P13 2012',
  description: 'U13 competitive team focusing on nutrition and performance',
  inviteCode: 'INTER2012',
  coachId: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

MOCK_TEAMS.set('INTER2012', FC_INTER_TEAM);
MOCK_TEAMS.set(FC_INTER_TEAM.id, FC_INTER_TEAM);

// POST /api/v1/teams/join - Join a team using invite code (MOCK)
router.post('/join', requireMockAuth, async (req: MockAuthRequest, res: Response) => {
  try {
    const { inviteCode } = req.body;
    
    if (!inviteCode) {
      res.status(400).json({ error: 'Invite code is required' });
      return;
    }

    // Check if team exists in mock data
    const team = MOCK_TEAMS.get(inviteCode.toUpperCase());

    if (!team) {
      res.status(404).json({ error: 'Invalid invite code' });
      return;
    }

    // Check if user is already a member (mock)
    const memberKey = `${req.dbUserId}-${team.id}`;
    if (MOCK_TEAM_MEMBERS.has(memberKey)) {
      res.status(400).json({ error: 'You are already a member of this team' });
      return;
    }

    // Add user to team (mock)
    const teamMember = {
      userId: req.dbUserId,
      teamId: team.id,
      role: 'PLAYER',
      joinedAt: new Date()
    };
    
    MOCK_TEAM_MEMBERS.set(memberKey, teamMember);

    res.json({
      success: true,
      data: { team, membership: teamMember },
      message: `Successfully joined team: ${team.name}`
    });
  } catch (error) {
    console.error('Error joining team (mock):', error);
    res.status(500).json({ 
      error: 'Failed to join team',
      message: 'Mock mode active - database not available'
    });
  }
});

// GET /api/v1/teams/my-teams - Get user's teams (MOCK)
router.get('/my-teams', requireMockAuth, async (req: MockAuthRequest, res: Response) => {
  try {
    // Find all teams user is member of
    const userTeams: any[] = [];
    
    MOCK_TEAM_MEMBERS.forEach((member, key) => {
      if (key.startsWith(`${req.dbUserId}-`)) {
        const team = MOCK_TEAMS.get(member.teamId);
        if (team) {
          // Count members for this team
          let memberCount = 0;
          MOCK_TEAM_MEMBERS.forEach((m) => {
            if (m.teamId === team.id) memberCount++;
          });
          
          userTeams.push({
            ...team,
            memberRole: member.role,
            joinedAt: member.joinedAt,
            _count: { members: memberCount }
          });
        }
      }
    });

    res.json({
      success: true,
      data: userTeams
    });
  } catch (error) {
    console.error('Error fetching teams (mock):', error);
    res.status(500).json({ 
      error: 'Failed to fetch teams',
      message: 'Mock mode active - database not available'
    });
  }
});

// GET /api/v1/teams/:teamId - Get team details (MOCK)
router.get('/:teamId', requireMockAuth, async (req: MockAuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;

    // Check if user is a member of the team
    const memberKey = `${req.dbUserId}-${teamId}`;
    const membership = MOCK_TEAM_MEMBERS.get(memberKey);

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this team' });
      return;
    }

    const team = MOCK_TEAMS.get(teamId);
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    // Get all members
    const members: any[] = [];
    MOCK_TEAM_MEMBERS.forEach((member) => {
      if (member.teamId === teamId) {
        members.push({
          user: {
            id: member.userId,
            name: `User ${member.userId?.slice(0, 8)}`,
            email: `user${member.userId?.slice(0, 8)}@example.com`,
            age: 15,
            position: 'MIDFIELDER',
            ageGroup: '13-15'
          },
          role: member.role,
          joinedAt: member.joinedAt
        });
      }
    });

    res.json({
      success: true,
      data: {
        ...team,
        members,
        _count: { members: members.length },
        userRole: membership.role
      }
    });
  } catch (error) {
    console.error('Error fetching team (mock):', error);
    res.status(500).json({ 
      error: 'Failed to fetch team details',
      message: 'Mock mode active - database not available'
    });
  }
});

// DELETE /api/v1/teams/:teamId/leave - Leave a team (MOCK)
router.delete('/:teamId/leave', requireMockAuth, async (req: MockAuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;

    const memberKey = `${req.dbUserId}-${teamId}`;
    const membership = MOCK_TEAM_MEMBERS.get(memberKey);

    if (!membership) {
      res.status(404).json({ error: 'You are not a member of this team' });
      return;
    }

    // Remove member from team
    MOCK_TEAM_MEMBERS.delete(memberKey);

    res.json({
      success: true,
      message: 'Successfully left the team'
    });
  } catch (error) {
    console.error('Error leaving team (mock):', error);
    res.status(500).json({ 
      error: 'Failed to leave team',
      message: 'Mock mode active - database not available'
    });
  }
});

// POST /api/v1/teams/create - Create a new team (MOCK)
router.post('/create', requireMockAuth, async (req: MockAuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Team name is required' });
      return;
    }

    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create team
    const team = {
      id: `team-${Date.now()}`,
      name,
      description: description || null,
      inviteCode,
      coachId: req.dbUserId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    MOCK_TEAMS.set(inviteCode, team);
    MOCK_TEAMS.set(team.id, team);

    // Add creator as team member with COACH role
    const memberKey = `${req.dbUserId}-${team.id}`;
    MOCK_TEAM_MEMBERS.set(memberKey, {
      userId: req.dbUserId,
      teamId: team.id,
      role: 'COACH',
      joinedAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: team,
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Error creating team (mock):', error);
    res.status(500).json({ 
      error: 'Failed to create team',
      message: 'Mock mode active - database not available'
    });
  }
});

export default router;