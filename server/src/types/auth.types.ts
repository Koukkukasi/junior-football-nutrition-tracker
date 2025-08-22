import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;      // Clerk user ID
  dbUserId?: string;    // Database user ID - populated by auth middleware
  user?: any;           // Full user object from Clerk
}

export interface PerformanceMetricsRequest {
  date?: string;
  energyLevel: number;
  sleepHours: number;
  isTrainingDay?: boolean;
  trainingType?: string;
  matchDay?: boolean;
  notes?: string;
}