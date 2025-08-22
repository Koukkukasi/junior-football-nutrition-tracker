const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFoodCreate() {
  try {
    // First, get the user
    const clerkId = 'user_31WS21sVk2eoGZkMe14EM8Eje1o';
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found!');
      return;
    }
    
    // Try to create a food entry
    const foodEntry = await prisma.foodEntry.create({
      data: {
        userId: user.id,
        mealType: 'BREAKFAST',
        time: '08:00',
        location: 'Home',
        description: 'Test meal from script',
        notes: 'Test note',
        date: new Date()
      }
    });
    
    console.log('Created food entry:', foodEntry);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFoodCreate();