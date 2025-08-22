const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPerformanceCreate() {
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
    
    // Try to create a performance entry
    const performanceEntry = await prisma.performanceMetric.create({
      data: {
        userId: user.id,
        date: new Date(),
        energyLevel: 4,
        sleepHours: 8.5,
        isTrainingDay: true,
        trainingType: 'team_practice',
        matchDay: false,
        notes: 'Test from script'
      }
    });
    
    console.log('Created performance entry:', performanceEntry);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'P2002') {
      console.log('Entry already exists for today. Trying update...');
      
      const user = await prisma.user.findUnique({
        where: { clerkId: 'user_31WS21sVk2eoGZkMe14EM8Eje1o' }
      });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const updated = await prisma.performanceMetric.update({
        where: {
          userId_date: {
            userId: user.id,
            date: today
          }
        },
        data: {
          energyLevel: 5,
          sleepHours: 9
        }
      });
      
      console.log('Updated performance entry:', updated);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPerformanceCreate();