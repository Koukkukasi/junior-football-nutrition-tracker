-- Add missing fields to User table that are required for the application

-- Add onboarding and profile fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ageGroup" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "goals" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trainingDaysPerWeek" INTEGER DEFAULT 3;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "completedOnboarding" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferences" JSONB;

-- Update Team table with missing fields
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "inviteCode" TEXT;

-- Create unique constraint on inviteCode if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Team_inviteCode_key') THEN
        ALTER TABLE "Team" ADD CONSTRAINT "Team_inviteCode_key" UNIQUE ("inviteCode");
    END IF;
END $$;

-- Update existing Team records to have an inviteCode if they don't have one
UPDATE "Team" 
SET "inviteCode" = CASE 
    WHEN "inviteCode" IS NULL THEN CONCAT('TEAM-', UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)))
    ELSE "inviteCode"
END;

-- Now make inviteCode NOT NULL after populating it
ALTER TABLE "Team" ALTER COLUMN "inviteCode" SET NOT NULL;

-- Add AFTER_PRACTICE to MealType enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'AFTER_PRACTICE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'MealType')) THEN
        ALTER TYPE "MealType" ADD VALUE 'AFTER_PRACTICE';
    END IF;
END $$;

-- Add recovery fields to PerformanceMetric
ALTER TABLE "PerformanceMetric" ADD COLUMN IF NOT EXISTS "bedTime" TEXT;
ALTER TABLE "PerformanceMetric" ADD COLUMN IF NOT EXISTS "wakeTime" TEXT;
ALTER TABLE "PerformanceMetric" ADD COLUMN IF NOT EXISTS "recoveryLevel" INTEGER;
ALTER TABLE "PerformanceMetric" ADD COLUMN IF NOT EXISTS "hadRecoveryMeal" BOOLEAN DEFAULT false;
ALTER TABLE "PerformanceMetric" ADD COLUMN IF NOT EXISTS "recoveryNotes" TEXT;

-- Create TeamMember table if it doesn't exist
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PLAYER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints for TeamMember if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TeamMember_userId_fkey') THEN
        ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TeamMember_teamId_fkey') THEN
        ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" 
        FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Create unique constraint on TeamMember
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TeamMember_userId_teamId_key') THEN
        ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_teamId_key" UNIQUE ("userId", "teamId");
    END IF;
END $$;

-- Create indexes for TeamMember
CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");
CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- Create indexes for Team
CREATE INDEX IF NOT EXISTS "Team_inviteCode_idx" ON "Team"("inviteCode");
CREATE INDEX IF NOT EXISTS "Team_coachId_idx" ON "Team"("coachId");

-- Add indexes for User table
CREATE INDEX IF NOT EXISTS "User_teamId_idx" ON "User"("teamId");