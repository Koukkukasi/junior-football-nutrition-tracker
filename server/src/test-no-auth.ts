// Direct test without auth to verify API functionality
import { prisma } from './db';
import { analyzeFoodQuality, getAgeGroup } from './services/nutritionAnalyzer';

async function testDirect() {
  console.log('🧪 Testing API functionality directly...\n');

  try {
    // Test 1: Create Food Entry directly
    console.log('📝 TEST 1: Creating Food Entry directly in database...');
    
    const user = await prisma.user.findUnique({
      where: { id: 'test-user-id-123' }
    });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log('✅ Found user:', user.name);
    
    // Analyze nutrition
    const ageGroup = user.age ? getAgeGroup(user.age) : undefined;
    const nutritionAnalysis = analyzeFoodQuality(
      'Grilled chicken with rice, salad, and orange juice',
      'regular',
      user.age || undefined,
      ageGroup
    );
    
    console.log('Nutrition Analysis:', nutritionAnalysis);
    
    // Create food entry
    const foodEntry = await prisma.foodEntry.create({
      data: {
        userId: user.id,
        mealType: 'LUNCH',
        time: '12:30',
        location: 'School cafeteria',
        description: 'Grilled chicken with rice, salad, and orange juice',
        notes: 'Good balanced meal after training',
        date: new Date(),
        nutritionScore: nutritionAnalysis.score,
        quality: nutritionAnalysis.quality,
        calories: nutritionAnalysis.macroEstimates.calories,
        protein: nutritionAnalysis.macroEstimates.protein,
        carbs: nutritionAnalysis.macroEstimates.carbs,
        fats: nutritionAnalysis.macroEstimates.fats
      }
    });
    
    console.log('✅ Food entry created:', {
      id: foodEntry.id,
      score: foodEntry.nutritionScore,
      quality: foodEntry.quality
    });
    console.log('');

    // Test 2: Create Performance Metrics
    console.log('📊 TEST 2: Creating Performance Metrics...');
    const performanceMetric = await prisma.performanceMetric.create({
      data: {
        userId: user.id,
        date: new Date(),
        energyLevel: 4,
        sleepHours: 8.5,
        isTrainingDay: true,
        trainingType: 'Technical skills',
        matchDay: false,
        notes: 'Felt good during training'
      }
    });
    
    console.log('✅ Performance metrics saved:', {
      id: performanceMetric.id,
      energyLevel: performanceMetric.energyLevel,
      sleepHours: performanceMetric.sleepHours
    });
    console.log('');

    // Test 3: Get Food Entries
    console.log('🍽️ TEST 3: Fetching Food Entries...');
    const foodEntries = await prisma.foodEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 5
    });
    console.log(`✅ Found ${foodEntries.length} food entries`);
    console.log('');

    // Test 4: Get Performance Trends
    console.log('📈 TEST 4: Fetching Performance Data...');
    const performanceData = await prisma.performanceMetric.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 7
    });
    console.log(`✅ Found ${performanceData.length} performance records`);
    
    if (performanceData.length > 0) {
      const avgEnergy = performanceData.reduce((sum, m) => sum + m.energyLevel, 0) / performanceData.length;
      const avgSleep = performanceData.reduce((sum, m) => sum + m.sleepHours, 0) / performanceData.length;
      console.log(`Average energy level: ${avgEnergy.toFixed(1)}`);
      console.log(`Average sleep hours: ${avgSleep.toFixed(1)}`);
    }
    console.log('');

    console.log('🎉 All direct tests completed successfully!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testDirect();