const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    // Check if any users exist
    const users = await prisma.user.findMany();
    console.log('Existing users:', users.length);
    
    if (users.length > 0) {
      console.log('Users in database:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Clerk ID: ${user.clerkId}`);
      });
    }
    
    // Try to find user by the Clerk ID we see in the auth
    const clerkId = 'user_31WS21sVk2eoGZkMe14EM8Eje1o';
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    if (user) {
      console.log('\nFound user with Clerk ID:', user);
    } else {
      console.log('\nNo user found with Clerk ID:', clerkId);
      console.log('Creating test user...');
      
      // Create test user
      const newUser = await prisma.user.create({
        data: {
          clerkId: clerkId,
          email: 'markus.saari@test.com',
          name: 'Markus Saari',
          age: 14,
          role: 'PLAYER',
          ageGroup: '13-15',
          dataConsent: false,
          completedOnboarding: false
        }
      });
      console.log('Created user:', newUser);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();