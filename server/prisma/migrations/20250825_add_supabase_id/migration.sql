-- Add supabaseId field to User table
ALTER TABLE "User" ADD COLUMN "supabaseId" TEXT;

-- Create index for faster lookups
CREATE INDEX "User_supabaseId_idx" ON "User"("supabaseId");

-- Make supabaseId unique after population (will be done in a second migration)
-- ALTER TABLE "User" ADD CONSTRAINT "User_supabaseId_key" UNIQUE ("supabaseId");