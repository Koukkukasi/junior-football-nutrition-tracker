import { Router, Response, Request } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth.types';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { logger } from '../utils/logger';

const router = Router();


// Store invites in database (we'll create a new model for this)
interface PendingInvite {
  email: string;
  role: 'PLAYER' | 'COACH';
  inviteCode: string;
  teamCode?: string;
  expiresAt: Date;
  sentBy?: string;
  createdAt: Date;
}

// In-memory storage for development (in production, use database)
const pendingInvites = new Map<string, PendingInvite>();

// Create email transporter (for development, we'll use console logging)
// In production, configure with real SMTP settings
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Production email configuration
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Development: Use ethereal email or console
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass'
    }
  });
};

// Send test user invite
router.post('/send', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { email, role = 'PLAYER', teamCode, customMessage } = req.body;
    
    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid email required' 
      });
    }
    
    // Check if user is authorized to send invites
    const sender = await prisma.user.findUnique({
      where: { clerkId: req.userId }
    });
    
    if (!sender || (sender.role !== 'COACH' && sender.role !== 'ADMIN')) {
      // For development, allow anyone to send invites
      logger.info('⚠️ Non-coach/admin sending invite - allowed in development');
    }
    
    // Generate unique invite code
    const inviteCode = crypto.randomBytes(16).toString('hex');
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/sign-up?invite=${inviteCode}&email=${encodeURIComponent(email)}`;
    
    // Store invite details
    const invite: PendingInvite = {
      email,
      role,
      inviteCode,
      teamCode,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      sentBy: sender?.email,
      createdAt: new Date()
    };
    
    pendingInvites.set(inviteCode, invite);
    
    // Email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚽ Junior Football Nutrition Tracker</h1>
            <p>You're invited to join our beta testing program!</p>
          </div>
          <div class="content">
            <h2>Welcome, Future Champion! 🌟</h2>
            
            <p>You've been invited to test our new nutrition tracking app designed specifically for junior football players.</p>
            
            ${customMessage ? `<p><strong>Personal message:</strong> ${customMessage}</p>` : ''}
            
            <div class="info-box">
              <strong>Your Invitation Details:</strong><br>
              Role: <strong>${role}</strong><br>
              ${teamCode ? `Team Code: <strong>${teamCode}</strong><br>` : ''}
              Valid for: 7 days
            </div>
            
            <center>
              <a href="${inviteUrl}" class="button">Accept Invitation & Sign Up</a>
            </center>
            
            <h3>What You'll Get:</h3>
            <ul>
              <li>📊 Personalized nutrition tracking</li>
              <li>⚡ Performance monitoring</li>
              <li>🎯 Age-specific recommendations</li>
              <li>👥 Team features (if applicable)</li>
              <li>📈 Progress analytics</li>
            </ul>
            
            <h3>Test Account Benefits:</h3>
            <ul>
              <li>Free access during beta period</li>
              <li>Your feedback shapes the app</li>
              <li>Early access to new features</li>
              <li>Sample data pre-loaded for testing</li>
            </ul>
            
            <p><strong>Getting Started:</strong></p>
            <ol>
              <li>Click the button above to sign up</li>
              <li>Complete the quick onboarding wizard</li>
              <li>Explore the app features</li>
              <li>Use the feedback widget to share your thoughts</li>
            </ol>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Note:</strong> This is a beta version for testing purposes. 
              Please use the in-app feedback widget to report any issues or suggestions.
            </p>
          </div>
          <div class="footer">
            <p>This invitation expires in 7 days</p>
            <p>If you didn't expect this email, please ignore it.</p>
            <p style="margin-top: 20px;">
              <a href="${inviteUrl}" style="color: #667eea;">Click here if the button doesn't work</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const emailText = `
Junior Football Nutrition Tracker - Beta Invitation

You're invited to join our beta testing program!

Role: ${role}
${teamCode ? `Team Code: ${teamCode}` : ''}

Accept your invitation here: ${inviteUrl}

This invitation expires in 7 days.

What you'll get:
- Personalized nutrition tracking
- Performance monitoring  
- Age-specific recommendations
- Team features (if applicable)
- Progress analytics

Your feedback will help shape the future of youth football nutrition!
    `;
    
    // Send email (or log in development)
    const transporter = createTransporter();
    
    try {
      if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
        // Send actual email in production
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"Nutrition Tracker" <noreply@nutrition-tracker.com>',
          to: email,
          subject: '⚽ You\'re Invited to Test Junior Football Nutrition Tracker!',
          text: emailText,
          html: emailHtml
        });
        
        logger.info(`✉️ Invitation email sent to ${email}`);
      } else {
        // Development: Log email details
        logger.info('\n📧 INVITATION EMAIL (Development Mode)');
        logger.info('=====================================');
        logger.info(`To: ${email}`);
        logger.info(`Role: ${role}`);
        logger.info(`Invite URL: ${inviteUrl}`);
        logger.info(`Team Code: ${teamCode || 'None'}`);
        logger.info(`Sent by: ${sender?.email || 'System'}`);
        logger.info('=====================================\n');
      }
    } catch (emailError) {
      logger.error('Email send error:', emailError);
      // Don't fail the request if email fails, still provide the invite link
    }
    
    res.json({ 
      success: true, 
      message: 'Invitation created successfully',
      inviteUrl,
      inviteCode,
      email,
      expiresAt: invite.expiresAt,
      developmentMode: process.env.NODE_ENV !== 'production'
    });
    
  } catch (error) {
    logger.error('Invite creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create invitation' 
    });
  }
});

// Validate invite code
router.get('/validate/:code', async (req: Request, res: Response): Promise<any> => {
  try {
    const { code } = req.params;
    
    const invite = pendingInvites.get(code);
    
    if (!invite) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid or expired invitation code' 
      });
    }
    
    if (new Date() > invite.expiresAt) {
      pendingInvites.delete(code);
      return res.status(410).json({ 
        success: false, 
        error: 'This invitation has expired' 
      });
    }
    
    res.json({ 
      success: true,
      email: invite.email,
      role: invite.role,
      teamCode: invite.teamCode
    });
    
  } catch (error) {
    logger.error('Invite validation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to validate invitation' 
    });
  }
});

// Bulk invite for testing
router.post('/bulk', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { emails, role = 'PLAYER', teamCode } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email list required' 
      });
    }
    
    const results = [];
    
    for (const email of emails) {
      const inviteCode = crypto.randomBytes(16).toString('hex');
      const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/sign-up?invite=${inviteCode}&email=${encodeURIComponent(email)}`;
      
      const invite: PendingInvite = {
        email,
        role,
        inviteCode,
        teamCode,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        sentBy: req.userId,
        createdAt: new Date()
      };
      
      pendingInvites.set(inviteCode, invite);
      
      results.push({
        email,
        inviteUrl,
        inviteCode
      });
      
      // Log for development
      logger.info(`📧 Bulk invite created for ${email}: ${inviteUrl}`);
    }
    
    res.json({ 
      success: true,
      message: `${results.length} invitations created`,
      invitations: results
    });
    
  } catch (error) {
    logger.error('Bulk invite error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create bulk invitations' 
    });
  }
});

// Get all pending invites (admin only)
router.get('/pending', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId }
    });
    
    if (user?.role !== 'COACH' && user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }
    
    const invites = Array.from(pendingInvites.values())
      .filter(invite => new Date() <= invite.expiresAt)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    res.json({ 
      success: true,
      invites,
      count: invites.length
    });
    
  } catch (error) {
    logger.error('Get invites error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch invitations' 
    });
  }
});

export default router;