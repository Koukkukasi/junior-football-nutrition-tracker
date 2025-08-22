const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPerformanceCreation() {
  try {
    console.log('Testing performance metric creation...\n');
    
    // First, get the user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error('No user found in database');
      return;
    }
    
    console.log('Found user:', { id: user.id, name: user.name, clerkId: user.clerkId });
    
    // Create performance metric
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const performanceData = {
      userId: user.id,
      date: today,
      energyLevel: 4,
      sleepHours: 8,
      isTrainingDay: false,
      trainingType: null,
      matchDay: false,
      notes: 'Test entry from script'
    };
    
    console.log('\nCreating performance metric with data:', performanceData);
    
    const metric = await prisma.performanceMetric.create({
      data: performanceData
    });
    
    console.log('\n✅ Performance metric created successfully!');
    console.log('Metric ID:', metric.id);
    console.log('Date:', metric.date);
    console.log('Energy Level:', metric.energyLevel);
    
  } catch (error) {
    console.error('\n❌ Error creating performance metric:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
    
    console.error('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPerformanceCreation();