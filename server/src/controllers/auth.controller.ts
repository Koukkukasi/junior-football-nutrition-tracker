import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import prisma from '../db';
import { clerkClient } from '@clerk/clerk-sdk-node';

export const authController = {
  async register(req: AuthRequest, res: Response) {
    try {
      const { clerkId, email, name, age, role, position, parentEmail, teamCode } = req.body;

      if (!clerkId || !email || !name || !age) {
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
          clerkId,
          email,
          name,
          age,
          role: role || 'PLAYER',
          position,
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

  async syncUser(req: AuthRequest, res: Response) {
    try {
      const { clerkId } = req.body;

      if (!clerkId) {
        return res.status(400).json({ error: 'Clerk ID is required' });
      }

      const clerkUser = await clerkClient.users.getUser(clerkId);
      
      let user = await prisma.user.findUnique({
        where: { clerkId }
      });

      if (!user) {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 
                    email?.split('@')[0] || 'User';

        user = await prisma.user.create({
          data: {
            clerkId,
            email: email || `${clerkId}@placeholder.com`,
            name,
            age: 18,
            role: 'PLAYER',
            dataConsent: false
          }
        });
      }

      return res.json({ user });
    } catch (error) {
      console.error('Sync user error:', error);
      return res.status(500).json({ error: 'Failed to sync user' });
    }
  },

  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: req.userId },
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
        where: { clerkId: req.userId },
        data: {
          ...(name && { name }),
          ...(age && { age, dataConsent: age >= 18 }),
          ...(position !== undefined && { position }),
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