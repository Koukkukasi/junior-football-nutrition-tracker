/**
 * Type definitions for Admin module
 */

export interface SystemStats {
  totalUsers: number;
  activeToday: number;
  pendingInvites: number;
  totalFeedback: number;
  averageScore: number;
  totalMeals: number;
}

export interface RecentActivity {
  id: string;
  type: 'signup' | 'meal' | 'feedback' | 'invite';
  user: string;
  timestamp: Date;
  details: string;
}

export interface PendingInvite {
  email: string;
  role: string;
  inviteCode: string;
  expiresAt: Date;
  sentBy?: string;
}

export interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  auth: 'healthy' | 'warning' | 'error';
}

export interface Invitation {
  email: string;
  role: 'PLAYER' | 'COACH';
  teamCode: string;
  inviteUrl?: string;
  error?: string;
}

export interface InviteResult {
  success: boolean;
  message: string;
  inviteUrl?: string;
  invitations?: Invitation[];
  successCount?: number;
  failedCount?: number;
}

export interface InviteFormData {
  email: string;
  role: 'PLAYER' | 'COACH';
  teamCode: string;
  customMessage: string;
}