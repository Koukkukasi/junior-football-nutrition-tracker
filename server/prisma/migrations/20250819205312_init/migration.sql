-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('PLAYER', 'COACH', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."PlayerPosition" AS ENUM ('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD');

-- CreateEnum
CREATE TYPE "public"."MealType" AS ENUM ('BREAKFAST', 'SNACK', 'LUNCH', 'DINNER', 'EVENING_SNACK');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'PLAYER',
    "position" "public"."PlayerPosition",
    "parentEmail" TEXT,
    "dataConsent" BOOLEAN NOT NULL DEFAULT false,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "coachId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FoodEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mealType" "public"."MealType" NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PerformanceMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "energyLevel" INTEGER NOT NULL,
    "sleepHours" DOUBLE PRECISION NOT NULL,
    "isTrainingDay" BOOLEAN NOT NULL DEFAULT false,
    "trainingType" TEXT,
    "matchDay" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "public"."User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "public"."User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_teamId_idx" ON "public"."User"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_code_key" ON "public"."Team"("code");

-- CreateIndex
CREATE INDEX "Team_code_idx" ON "public"."Team"("code");

-- CreateIndex
CREATE INDEX "Team_coachId_idx" ON "public"."Team"("coachId");

-- CreateIndex
CREATE INDEX "FoodEntry_userId_date_idx" ON "public"."FoodEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "FoodEntry_date_idx" ON "public"."FoodEntry"("date");

-- CreateIndex
CREATE INDEX "PerformanceMetric_userId_date_idx" ON "public"."PerformanceMetric"("userId", "date");

-- CreateIndex
CREATE INDEX "PerformanceMetric_date_idx" ON "public"."PerformanceMetric"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceMetric_userId_date_key" ON "public"."PerformanceMetric"("userId", "date");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FoodEntry" ADD CONSTRAINT "FoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PerformanceMetric" ADD CONSTRAINT "PerformanceMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
