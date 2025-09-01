/**
 * Seed script to ensure FC Inter P13 2012 team exists
 * This is a real team testing the application
 */

import { prisma } from '../db';

async function seedTeam() {
  try {
    console.log('Checking for FC Inter P13 2012 team...');
    
    // Check if team already exists
    const existingTeam = await prisma.team.findUnique({
      where: { inviteCode: 'INTER2012' }
    });

    if (existingTeam) {
      console.log('✅ Team already exists:', existingTeam.name);
      console.log('   Invite code:', existingTeam.inviteCode);
      
      // Get member count
      const memberCount = await prisma.teamMember.count({
        where: { teamId: existingTeam.id }
      });
      console.log('   Current members:', memberCount);
      
      return existingTeam;
    }

    // Create the team if it doesn't exist
    console.log('Creating FC Inter P13 2012 team...');
    
    const team = await prisma.team.create({
      data: {
        name: 'FC Inter P13 2012',
        description: 'U13 competitive team focusing on nutrition and performance',
        inviteCode: 'INTER2012'
      }
    });

    console.log('✅ Team created successfully!');
    console.log('   Team ID:', team.id);
    console.log('   Team name:', team.name);
    console.log('   Invite code:', team.inviteCode);
    console.log('');
    console.log('Players can join using invite code: INTER2012');
    
    return team;
  } catch (error) {
    console.error('❌ Error seeding team:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedTeam()
    .then(() => {
      console.log('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export default seedTeam;