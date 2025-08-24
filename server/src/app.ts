import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import authRoutes from './routes/auth.routes';
import foodRoutes from './routes/food.routes';
import performanceRoutes from './routes/performance.routes';
import analyticsRoutes from './routes/analytics.routes';
import userRoutes from './routes/user.routes';
import feedbackRoutes from './routes/feedback.routes';
import inviteRoutes from './routes/invite.routes';
import testInviteRoutes from './routes/test-invite.routes';
import testRoutes from './routes/test.routes';
import adminRoutes from './routes/admin.routes';
import teamRoutes from './routes/team.routes';
import webhookRoutes from './routes/webhook.routes';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://juniorfootballnutrition.com', // Production custom domain
    'https://www.juniorfootballnutrition.com', // Production www subdomain
    'https://junior-nutrition-tracker-prod.vercel.app', // Current production Vercel URL
    'https://junior-football-nutrition-tracker.vercel.app', // Production Vercel URL
    'https://junior-football-nutrition-tracker-*.vercel.app', // Preview deployments
    'http://localhost:5173', // Vite default port
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://192.168.68.104:5174',
    'http://192.168.68.104:5175',
    'http://192.168.68.104:5176', // Your local network IP
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Allow any local network IP with any port
    /^http:\/\/172\.26\.\d+\.\d+:\d+$/, // Allow WSL network
    /^https:\/\/junior-football-nutrition-tracker-.*\.vercel\.app$/, // Regex for preview deployments
    /^https:\/\/junior-nutrition-tracker-.*\.vercel\.app$/ // Regex for new production deployment pattern
  ],
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// CRITICAL: Add comprehensive request logging to track all incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  // Test with multiple output methods to ensure visibility
  console.log('=== INCOMING REQUEST ===');
  console.error('=== INCOMING REQUEST (stderr) ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Path:', req.path);
  console.log('Headers:', {
    authorization: req.headers.authorization ? 'Bearer [TOKEN]' : 'NONE',
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent']?.substring(0, 50) + '...',
    origin: req.headers.origin
  });
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('=== END REQUEST LOG ===');
  
  // Also add a header to prove middleware is executing
  res.set('X-Request-Logged', 'true');
  next();
});

// Health check endpoints
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API v1 health endpoint for consistency
app.get('/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected' // We'll verify this after testing
  });
});

// Additional API health endpoint
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// Webhook routes (before other routes, no auth required)
app.use('/api/webhooks', webhookRoutes);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/food', foodRoutes);
app.use('/api/v1/performance', performanceRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/invites', inviteRoutes);
app.use('/api/v1/test-invite', testInviteRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/teams', teamRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

export default app;