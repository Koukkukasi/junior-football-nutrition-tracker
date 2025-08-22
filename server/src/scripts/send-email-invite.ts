import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { logger } from '../utils/logger';

dotenv.config();

async function sendEmailInvitation() {
  const email = 'ilmivalta@gmail.com';
  const inviteCode = crypto.randomBytes(8).toString('hex');
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
  const inviteUrl = `${baseUrl}/sign-up?invite=${inviteCode}&email=${encodeURIComponent(email)}&role=PLAYER&team=TEST-TEAM-2024`;
  
  logger.info('\n📧 Preparing to send email invitation...');
  logger.info('=====================================');
  logger.info(`To: ${email}`);
  logger.info(`Invite Code: ${inviteCode}`);
  logger.info(`URL: ${inviteUrl}`);
  logger.info('=====================================\n');

  // Email HTML content
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white !important; padding: 14px 35px; text-decoration: none; border-radius: 5px; margin: 25px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #333; margin-top: 0; }
        h3 { color: #555; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚽ Junior Football Nutrition Tracker</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">You're invited to join our beta testing program!</p>
        </div>
        <div class="content">
          <h2>Welcome, Future Champion! 🌟</h2>
          
          <p>Hi there!</p>
          
          <p>You've been specially selected to test our new nutrition tracking app designed specifically for junior football players. This is an exclusive opportunity to help shape the future of youth sports nutrition!</p>
          
          <div class="info-box">
            <strong>Your Test Account Details:</strong><br>
            Email: <strong>${email}</strong><br>
            Role: <strong>PLAYER</strong><br>
            Team Code: <strong>TEST-TEAM-2024</strong><br>
            Access: <strong>Full Beta Features</strong><br>
            Valid for: <strong>7 days</strong>
          </div>
          
          <center>
            <a href="${inviteUrl}" class="button" style="color: white !important;">Accept Invitation & Start Testing</a>
          </center>
          
          <h3>🎯 What You'll Be Testing:</h3>
          <ul>
            <li><strong>Food Logging:</strong> Track your meals and get instant nutrition scores</li>
            <li><strong>Performance Metrics:</strong> Monitor your energy, recovery, and training quality</li>
            <li><strong>Age-Specific Recommendations:</strong> Get advice tailored to your age group</li>
            <li><strong>Team Features:</strong> Connect with your coach and teammates</li>
            <li><strong>Analytics Dashboard:</strong> View your progress over time</li>
          </ul>
          
          <h3>✅ Getting Started is Easy:</h3>
          <ol>
            <li>Click the button above to create your account</li>
            <li>Your email will be pre-filled - just set a password</li>
            <li>Complete the quick 4-step onboarding wizard</li>
            <li>Start exploring and testing features</li>
            <li>Use the feedback widget (bottom-right corner) to share your thoughts</li>
          </ol>
          
          <h3>💡 Test Account Benefits:</h3>
          <ul>
            <li>Free unlimited access during beta period</li>
            <li>Pre-loaded sample data to explore</li>
            <li>Direct influence on app development</li>
            <li>Early access to new features</li>
            <li>Your feedback shapes the final product</li>
          </ul>
          
          <div class="info-box" style="background: #fff3cd; border-color: #ffc107;">
            <strong>⚠️ Important Testing Notes:</strong><br>
            • This is a beta version - you may encounter bugs<br>
            • Please test all features thoroughly<br>
            • Use the feedback widget to report any issues<br>
            • Try different meal combinations and scenarios<br>
            • Test on both mobile and desktop if possible
          </div>
          
          <p><strong>Password Suggestion:</strong> TestPass123! (or create your own secure password)</p>
          
          <p>We're excited to have you as part of our beta testing team! Your input is invaluable in creating the best nutrition tracking experience for young athletes.</p>
          
          <p>Thank you for helping us build something amazing! ⚽🥗💪</p>
          
          <p>Best regards,<br>
          <strong>The Junior Football Nutrition Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>This invitation expires in 7 days</strong></p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${inviteUrl}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999;">If you didn't expect this email, please ignore it. This invitation was sent for beta testing purposes.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Junior Football Nutrition Tracker - Beta Testing Invitation
==========================================================

Welcome, Future Champion! ⚽

You've been specially selected to test our new nutrition tracking app designed specifically for junior football players.

YOUR TEST ACCOUNT DETAILS:
--------------------------
Email: ${email}
Role: PLAYER
Team Code: TEST-TEAM-2024
Access: Full Beta Features

ACCEPT YOUR INVITATION:
-----------------------
${inviteUrl}

WHAT YOU'LL BE TESTING:
-----------------------
• Food Logging - Track meals and get nutrition scores
• Performance Metrics - Monitor energy and recovery
• Age-Specific Recommendations
• Team Features
• Analytics Dashboard

GETTING STARTED:
---------------
1. Click the invitation link above
2. Create your account (email will be pre-filled)
3. Complete the onboarding wizard
4. Start testing features
5. Share feedback using the in-app widget

Password Suggestion: TestPass123!

This invitation expires in 7 days.

Thank you for helping us build something amazing!

Best regards,
The Junior Football Nutrition Team
  `.trim();

  // Check if we have email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.info('⚠️  Email credentials not configured in .env file');
    logger.info('\n📝 To send actual emails, add these to your .env file:');
    logger.info('EMAIL_USER=your-email@gmail.com');
    logger.info('EMAIL_PASS=your-app-specific-password');
    logger.info('\n📋 For Gmail:');
    logger.info('1. Enable 2-factor authentication');
    logger.info('2. Generate an app-specific password');
    logger.info('3. Use that password in EMAIL_PASS\n');
    
    logger.info('📧 Email content prepared (not sent):');
    logger.info('=====================================');
    logger.info('Subject: ⚽ You\'re Invited to Test Junior Football Nutrition Tracker!');
    logger.info('To:', email);
    logger.info('\n🔗 Invitation URL for manual sending:');
    logger.info(inviteUrl);
    logger.info('=====================================\n');
    
    // Save to file for manual sending
    const fs = require('fs');
    const path = require('path');
    const emailDir = path.join(process.cwd(), 'emails');
    if (!fs.existsSync(emailDir)) {
      fs.mkdirSync(emailDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
      path.join(emailDir, `invitation_${email}_${timestamp}.html`),
      emailHtml,
      'utf-8'
    );
    fs.writeFileSync(
      path.join(emailDir, `invitation_${email}_${timestamp}.txt`),
      emailText,
      'utf-8'
    );
    
    logger.info(`📁 Email content saved to: emails/invitation_${email}_${timestamp}.html`);
    logger.info(`📁 Text version saved to: emails/invitation_${email}_${timestamp}.txt`);
    
    return;
  }

  try {
    // Create transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Junior Football Nutrition" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '⚽ You\'re Invited to Test Junior Football Nutrition Tracker!',
      text: emailText,
      html: emailHtml
    });

    logger.info('✅ Email sent successfully!');
    logger.info('Message ID:', info.messageId);
    logger.info('Accepted:', info.accepted);
    
  } catch (error) {
    logger.error('❌ Failed to send email:', error);
    logger.info('\n💡 Troubleshooting tips:');
    logger.info('1. Check your EMAIL_USER and EMAIL_PASS in .env');
    logger.info('2. For Gmail, use an app-specific password');
    logger.info('3. Make sure "Less secure app access" is enabled (if not using app password)');
    logger.info('4. Check your internet connection');
    
    logger.info('\n📋 Manual invitation URL:');
    logger.info(inviteUrl);
  }
}

// Run the script
sendEmailInvitation().catch(console.error);