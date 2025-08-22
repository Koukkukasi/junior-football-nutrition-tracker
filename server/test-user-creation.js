const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUserCreation() {
  try {
    console.log('Testing user creation...\n');
    
    const testUser = {
      clerkId: 'user_31WS21sVk2eoGZkMe14EM8Eje1o',
      email: 'a.markus.saari@gmail.com',
      name: 'Markus Saari',
      age: 14,
      role: 'PLAYER',
      ageGroup: '13-15',
      position: 'MIDFIELDER',
      goals: ['performance', 'energy'],
      trainingDaysPerWeek: 4,
      completedOnboarding: true,
      onboardingDate: new Date()
    };
    
    console.log('Creating user with data:', testUser);
    
    const user = await prisma.user.create({
      data: testUser
    });
    
    console.log('\n✅ User created successfully!');
    console.log('User ID:', user.id);
    console.log('ClerkID:', user.clerkId);
    console.log('Email:', user.email);
    
  } catch (error) {
    console.error('\n❌ Error creating user:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testUserCreation();