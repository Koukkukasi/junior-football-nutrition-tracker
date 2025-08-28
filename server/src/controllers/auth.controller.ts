import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { PlayerPosition } from '@prisma/client';
import prisma from '../db';

// Convert position string to enum value
const convertPositionToEnum = (positionString: string | null | undefined): PlayerPosition | null => {
  if (!positionString) return null;
  
  const positionMap: Record<string, PlayerPosition> = {
    'Goalkeeper': PlayerPosition.GOALKEEPER,
    'Defender': PlayerPosition.DEFENDER, 
    'Midfielder': PlayerPosition.MIDFIELDER,
    'Forward': PlayerPosition.FORWARD
  };
  
  return positionMap[positionString] || null;
};

export const authController = {
  async register(req: AuthRequest, res: Response) {
    try {
      const { supabaseId, email, name, age, role, position, parentEmail, teamCode } = req.body;

      if (!supabaseId || !email || !name || !age) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (age < 10 || age > 25) {
        return res.status(400).json({ error: 'Age must be between 10 and 25' });
      }

      let teamId = null;
      if (teamCode) {
        const team = await prisma.team.findUnique({
          where: { inviteCode: teamCode }
        });
        
        if (team) {
          teamId = team.id;
        }
      }

      const user = await prisma.user.create({
        data: {
          supabaseId,
          email,
          name,
          age,
          role: role || 'PLAYER',
          position: convertPositionToEnum(position),
          parentEmail,
          teamId,
          dataConsent: age >= 18
        }
      });

      return res.status(201).json({ user });
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'User already exists' });
      }
      return res.status(500).json({ error: 'Failed to register user' });
    }
  },

  async teamSignup(req: AuthRequest, res: Response) {
    try {
      const { email, password, name, teamCode, jerseyNumber, role, isTeamAccount } = req.body;

      if (!email || !password || !name || !teamCode || !jerseyNumber) {
        return res.status(400).json({ 
          success: false,
          message: 'Missing required fields' 
        });
      }

      // Import Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );

      // Check if team exists
      let team = await prisma.team.findUnique({
        where: { inviteCode: teamCode }
      });

      if (!team) {
        // Create a default team if it doesn't exist
        team = await prisma.team.create({
          data: {
            name: teamCode,
            inviteCode: teamCode,
            description: `Team ${teamCode}`
          }
        });
      }

      // Check if user already exists in Supabase
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users?.some(u => u.email === email);

      if (userExists) {
        return res.json({ 
          success: false,
          userExists: true,
          message: 'User already exists. Please sign in.' 
        });
      }

      // Create user in Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          jersey_number: jerseyNumber,
          team_code: teamCode,
          is_team_account: isTeamAccount
        }
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        return res.status(400).json({ 
          success: false,
          message: authError.message 
        });
      }

      if (!authData.user) {
        return res.status(400).json({ 
          success: false,
          message: 'Failed to create user' 
        });
      }

      // Create user in our database
      const user = await prisma.user.create({
        data: {
          supabaseId: authData.user.id,
          email,
          name,
          age: 16, // Default age for team players
          role: role || 'PLAYER',
          teamId: team?.id,
          dataConsent: false
        }
      });

      return res.json({ 
        success: true,
        user,
        message: 'Team account created successfully' 
      });
    } catch (error: any) {
      console.error('Team signup error:', error);
      if (error.code === 'P2002') {
        return res.json({ 
          success: false,
          userExists: true,
          message: 'User already exists' 
        });
      }
      return res.status(500).json({ 
        success: false,
        message: 'Failed to create team account' 
      });
    }
  },

  async syncUser(req: AuthRequest, res: Response) {
    try {
      const { supabaseId, email, name, age, role, position } = req.body;

      if (!supabaseId || !email) {
        return res.status(400).json({ error: 'Supabase ID and email are required' });
      }
      
      let user = await prisma.user.findUnique({
        where: { supabaseId }
      });

      if (!user) {
        // Check if user exists with this email but different supabaseId
        user = await prisma.user.findUnique({
          where: { email }
        });
        
        if (user) {
          // Update existing user with supabaseId
          user = await prisma.user.update({
            where: { id: user.id },
            data: { supabaseId }
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              supabaseId,
              email,
              name: name || email.split('@')[0] || 'User',
              age: age || 18,
              role: role || 'PLAYER',
              position: convertPositionToEnum(position),
              dataConsent: age >= 18
            }
          });
        }
      } else {
        // Update existing user with latest data
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: name || user.name,
            age: age || user.age,
            role: role || user.role,
            position: convertPositionToEnum(position) || user.position,
          }
        });
      }

      return res.json({ success: true, user });
    } catch (error) {
      console.error('Sync user error:', error);
      return res.status(500).json({ error: 'Failed to sync user' });
    }
  },

  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { supabaseId: req.userId },
        include: {
          team: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ user });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({ error: 'Failed to get user' });
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name, age, position, parentEmail, teamCode } = req.body;

      let teamId = undefined;
      if (teamCode !== undefined) {
        if (teamCode) {
          const team = await prisma.team.findUnique({
            where: { inviteCode: teamCode }
          });
          if (!team) {
            return res.status(400).json({ error: 'Invalid team code' });
          }
          teamId = team.id;
        } else {
          teamId = null;
        }
      }

      const user = await prisma.user.update({
        where: { supabaseId: req.userId },
        data: {
          ...(name && { name }),
          ...(age && { age, dataConsent: age >= 18 }),
          ...(position !== undefined && { position: convertPositionToEnum(position) }),
          ...(parentEmail !== undefined && { parentEmail }),
          ...(teamId !== undefined && { teamId })
        },
        include: {
          team: true
        }
      });

      return res.json({ user });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};
