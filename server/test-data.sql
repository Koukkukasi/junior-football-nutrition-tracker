-- Create test user for development testing
INSERT INTO "User" (
  id,
  "supabaseId",
  email,
  name,
  age,
  role,
  position,
  "parentEmail",
  "dataConsent",
  "completedOnboarding",
  "trainingDaysPerWeek",
  goals,
  "createdAt",
  "updatedAt"
) VALUES (
  'test-user-id-123',
  'test-supabase-123',
  'testplayer@example.com',
  'Test Player',
  14,
  'PLAYER',
  'MIDFIELDER',
  'parent@example.com',
  false,
  true,
  3,
  ARRAY['improve_performance', 'better_nutrition'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  "updatedAt" = NOW();