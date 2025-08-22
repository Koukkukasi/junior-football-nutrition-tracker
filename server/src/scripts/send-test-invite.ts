import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

async function sendTestInvite() {
  const email = 'ilmivalta@gmail.com';
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  logger.info('📧 Sending test invitation to:', email);
  logger.info('================================');
  
  try {
    // Create a simple invite without authentication for testing
    const inviteCode = Math.random().toString(36).substring(7);
    const inviteUrl = `${baseUrl}/sign-up?invite=${inviteCode}&email=${encodeURIComponent(email)}`;
    
    logger.info('\n✅ Test Invitation Created Successfully!');
    logger.info('================================');
    logger.info('Email:', email);
    logger.info('Role: PLAYER');
    logger.info('Team Code: TEST-TEAM-2024');
    logger.info('\n🔗 Invitation URL:');
    logger.info(inviteUrl);
    logger.info('\n📋 Instructions:');
    logger.info('1. Copy the URL above and send it to', email);
    logger.info('2. Open the URL in a browser');
    logger.info('3. Complete the sign-up process');
    logger.info('4. The onboarding wizard will guide you through setup');
    logger.info('\n💡 Test Credentials:');
    logger.info('Password suggestion: TestPass123!');
    logger.info('\n🎯 After signup:');
    logger.info('- Complete the onboarding wizard');
    logger.info('- Explore the dashboard');
    logger.info('- Try logging meals');
    logger.info('- Use the feedback widget to share thoughts');
    logger.info('================================\n');
    
    // Also create a formatted email content
    const emailContent = `
Hello!

You're invited to test the Junior Football Nutrition Tracker app!

Click here to sign up: ${inviteUrl}

What to expect:
- Easy onboarding process
- Nutrition tracking features
- Performance monitoring
- Team features

Your test account details:
- Email: ${email}
- Suggested password: TestPass123!
- Team code: TEST-TEAM-2024

Please use the in-app feedback widget to share your thoughts!

Thank you for testing!
    `.trim();
    
    logger.info('📄 Email Content to Send:');
    logger.info('------------------------');
    logger.info(emailContent);
    logger.info('------------------------\n');
    
  } catch (error) {
    logger.error('❌ Error creating invitation:', error);
  }
}

// Run the script
sendTestInvite();