-- Add missing fields to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "ageGroup" TEXT,
ADD COLUMN IF NOT EXISTS "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "trainingDaysPerWeek" INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS "completedOnboarding" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "onboardingDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "preferences" JSONB;

-- Add inviteCode to Team table and rename code to inviteCode if needed
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Team' AND column_name='code') THEN
    ALTER TABLE "Team" RENAME COLUMN "code" TO "inviteCode";
  ELSE
    ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "inviteCode" TEXT NOT NULL DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Create TeamMember table if it doesn't exist
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PLAYER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint on TeamMember
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TeamMember_userId_teamId_key') THEN
    ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_teamId_key" UNIQUE ("userId", "teamId");
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");
CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- Add unique constraint on PerformanceMetric for userId and date
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PerformanceMetric_userId_date_key') THEN
    ALTER TABLE "PerformanceMetric" ADD CONSTRAINT "PerformanceMetric_userId_date_key" UNIQUE ("userId", "date");
  END IF;
END $$;