const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('Adding missing fields to database...');
    
    // Add missing fields to User table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "ageGroup" TEXT,
      ADD COLUMN IF NOT EXISTS "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
      ADD COLUMN IF NOT EXISTS "trainingDaysPerWeek" INTEGER DEFAULT 3,
      ADD COLUMN IF NOT EXISTS "completedOnboarding" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "onboardingDate" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "preferences" JSONB
    `);
    console.log('✓ Added User fields');

    // Fix Team table
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Team" RENAME COLUMN "code" TO "inviteCode"
      `);
      console.log('✓ Renamed Team.code to inviteCode');
    } catch (e) {
      // Column might already be renamed or not exist
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "inviteCode" TEXT NOT NULL DEFAULT gen_random_uuid()
        `);
        console.log('✓ Added Team.inviteCode');
      } catch (e2) {
        console.log('⚠ Team.inviteCode might already exist');
      }
    }

    // Create TeamMember table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TeamMember" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "teamId" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'PLAYER',
        "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✓ Created TeamMember table');

    // Add constraints
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_teamId_key" UNIQUE ("userId", "teamId")
      `);
      console.log('✓ Added TeamMember unique constraint');
    } catch (e) {
      console.log('⚠ TeamMember unique constraint might already exist');
    }

    // Add indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId")
    `);
    console.log('✓ Added TeamMember indexes');

    // Add PerformanceMetric constraint
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "PerformanceMetric" ADD CONSTRAINT "PerformanceMetric_userId_date_key" UNIQUE ("userId", "date")
      `);
      console.log('✓ Added PerformanceMetric unique constraint');
    } catch (e) {
      console.log('⚠ PerformanceMetric unique constraint might already exist');
    }

    console.log('\n✅ Database fixed successfully!');
    
    // Test by counting users
    const userCount = await prisma.user.count();
    console.log(`\n📊 Current users in database: ${userCount}`);
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase();