import { Router, Response, Request } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

const router = Router();

// Test endpoint - no auth required for development
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { email = 'ilmivalta@gmail.com', role = 'PLAYER', teamCode = 'TEST-TEAM-2024' } = req.body;
    
    // Generate unique invite code
    const inviteCode = crypto.randomBytes(8).toString('hex');
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    const inviteUrl = `${baseUrl}/sign-up?invite=${inviteCode}&email=${encodeURIComponent(email)}&role=${role}&team=${teamCode}`;
    
    // Log for development
    logger.info('\n📧 TEST INVITATION CREATED');
    logger.info('================================');
    logger.info(`Email: ${email}`);
    logger.info(`Role: ${role}`);
    logger.info(`Team Code: ${teamCode}`);
    logger.info(`Invite Code: ${inviteCode}`);
    logger.info('\n🔗 Invitation URL:');
    logger.info(inviteUrl);
    logger.info('================================\n');
    
    res.json({ 
      success: true,
      message: 'Test invitation created successfully',
      inviteUrl,
      inviteCode,
      email,
      role,
      teamCode,
      instructions: [
        '1. Copy the invitation URL',
        '2. Send it to the test user',
        '3. User clicks the link to sign up',
        '4. Email will be pre-filled',
        '5. Complete sign-up with password: TestPass123!'
      ]
    });
    
  } catch (error) {
    logger.error('Test invite error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create test invitation' 
    });
  }
});

// Quick invite for ilmivalta@gmail.com
router.get('/quick', async (_req: Request, res: Response) => {
  const email = 'ilmivalta@gmail.com';
  const inviteCode = crypto.randomBytes(8).toString('hex');
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
  const inviteUrl = `${baseUrl}/sign-up?invite=${inviteCode}&email=${encodeURIComponent(email)}&role=PLAYER&team=TEST-TEAM-2024`;
  
  logger.info('\n📧 QUICK TEST INVITATION');
  logger.info('================================');
  logger.info(`Email: ${email}`);
  logger.info(`\n🔗 Invitation URL:`);
  logger.info(inviteUrl);
  logger.info('================================\n');
  
  res.json({
    success: true,
    email,
    inviteUrl,
    message: 'Quick invitation created for ilmivalta@gmail.com'
  });
});

export default router;