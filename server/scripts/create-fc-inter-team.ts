import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createFCInterTeam() {
  try {
    console.log('🏁 Creating FC Inter p13 2012 team...');
    
    // Check if team already exists
    const existingTeam = await prisma.team.findFirst({
      where: {
        name: 'FC Inter p13 2012'
      }
    });

    if (existingTeam) {
      console.log('⚠️  Team already exists!');
      console.log('📋 Team Details:');
      console.log('   Name:', existingTeam.name);
      console.log('   ID:', existingTeam.id);
      console.log('   Invite Code:', existingTeam.inviteCode);
      console.log('   Description:', existingTeam.description);
      return existingTeam;
    }

    // Generate a memorable invite code for the team
    // Using format: INTER-P13-XXXX where XXXX is random
    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const inviteCode = `INTER-P13-${randomSuffix}`;

    // Create the team
    const team = await prisma.team.create({
      data: {
        name: 'FC Inter p13 2012',
        description: 'FC Inter Turku P13 (born 2012) - Junior football team participating in nutrition tracking program',
        inviteCode,
        coachId: null // Will be assigned when coach joins
      }
    });

    console.log('✅ Team created successfully!');
    console.log('\n📋 Team Details:');
    console.log('   Name:', team.name);
    console.log('   ID:', team.id);
    console.log('   Invite Code:', team.inviteCode);
    console.log('   Description:', team.description);
    
    console.log('\n🔗 Share this invite code with team members:');
    console.log('   👉', team.inviteCode);
    
    console.log('\n📱 Team members can join by:');
    console.log('   1. Signing up at https://junior-football-nutrition-client.onrender.com');
    console.log('   2. Selecting "Player" role during onboarding');
    console.log('   3. Entering age group "13-15" (for p13 2012 players)');
    console.log('   4. Using invite code:', team.inviteCode);

    // Create sample coach account (optional - remove if not needed)
    console.log('\n👤 Creating sample coach account...');
    const coachUser = await prisma.user.create({
      data: {
        clerkId: `coach_${crypto.randomBytes(8).toString('hex')}`,
        email: 'coach.fcinter.p13@example.com',
        name: 'FC Inter Coach',
        age: 35,
        role: 'COACH',
        ageGroup: null,
        position: null,
        completedOnboarding: true,
        dataConsent: true
      }
    });

    // Add coach as team member
    await prisma.teamMember.create({
      data: {
        userId: coachUser.id,
        teamId: team.id,
        role: 'COACH'
      }
    });

    // Update team with coach ID
    await prisma.team.update({
      where: { id: team.id },
      data: { coachId: coachUser.id }
    });

    console.log('✅ Sample coach account created');
    console.log('   Email: coach.fcinter.p13@example.com');
    console.log('   Note: This is a placeholder - the real coach should sign up and be assigned');

    return team;
  } catch (error) {
    console.error('❌ Error creating team:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createFCInterTeam()
  .then(() => {
    console.log('\n🎉 Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });