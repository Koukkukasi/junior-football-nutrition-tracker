import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createAdminAccount() {
  try {
    console.log('🔐 Creating Admin Account for Junior Football Nutrition Tracker...');
    
    // Admin details - you can customize these
    const adminEmail = 'admin@fcinter.fi'; // Change this to your preferred email
    const adminName = 'System Administrator';
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          { role: 'ADMIN' }
        ]
      }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log('📋 Admin Details:');
      console.log('   Name:', existingAdmin.name);
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      console.log('   ID:', existingAdmin.id);
      
      // Update to ensure ADMIN role
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: 'ADMIN' }
        });
        console.log('✅ Updated role to ADMIN');
      }
      
      return existingAdmin;
    }

    // Create admin account
    const adminUser = await prisma.user.create({
      data: {
        clerkId: `admin_${crypto.randomBytes(8).toString('hex')}`,
        email: adminEmail,
        name: adminName,
        age: 30, // Default age for admin
        role: 'ADMIN',
        completedOnboarding: true,
        dataConsent: true,
        preferences: {
          receiveNotifications: true,
          dashboardView: 'advanced'
        }
      }
    });

    console.log('✅ Admin account created successfully!');
    console.log('\n📋 Admin Account Details:');
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   ID:', adminUser.id);
    console.log('   Clerk ID:', adminUser.clerkId);
    
    // Also add admin to FC Inter team as supervisor
    const fcInterTeam = await prisma.team.findFirst({
      where: { name: 'FC Inter p13 2012' }
    });
    
    if (fcInterTeam) {
      await prisma.teamMember.create({
        data: {
          userId: adminUser.id,
          teamId: fcInterTeam.id,
          role: 'COACH' // Admin with coach privileges
        }
      });
      console.log('\n✅ Added admin as supervisor to FC Inter p13 2012 team');
    }
    
    console.log('\n🔑 Admin Access Instructions:');
    console.log('────────────────────────────────────────');
    console.log('1. Sign up at: https://junior-football-nutrition-client.onrender.com/sign-up');
    console.log('2. Use email:', adminEmail);
    console.log('3. Create a secure password');
    console.log('4. You will have full admin access');
    console.log('\n📊 Admin Dashboard Features:');
    console.log('   • View all teams and players');
    console.log('   • Monitor system health');
    console.log('   • Access analytics for all users');
    console.log('   • Manage team assignments');
    console.log('   • Generate reports');
    console.log('   • Send invitations');
    console.log('\n🔗 Admin URLs:');
    console.log('   Dashboard: /dashboard');
    console.log('   Admin Monitor: /admin/monitor');
    console.log('   Admin Invite: /admin/invite');
    console.log('   Coach Dashboard: /coach');
    console.log('   Team Management: /team');

    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminAccount()
  .then(() => {
    console.log('\n🎉 Admin setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });