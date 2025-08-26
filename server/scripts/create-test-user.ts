import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Create or update test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        supabaseId: 'test_user_123',
        name: 'Test User',
        updatedAt: new Date()
      },
      create: {
        clerkId: `supabase_test_user_123_${Date.now()}`,
        supabaseId: 'test_user_123',
        email: 'test@example.com',
        name: 'Test User',
        age: 16,
        role: 'PLAYER',
        ageGroup: '16-18',
        dataConsent: false,
        completedOnboarding: false
      }
    });

    console.log('Test user created/updated:', user);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();