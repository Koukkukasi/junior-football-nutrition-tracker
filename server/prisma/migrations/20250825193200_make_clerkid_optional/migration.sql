-- Make clerkId optional for transitioning to Supabase
ALTER TABLE "User" ALTER COLUMN "clerkId" DROP NOT NULL;