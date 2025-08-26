import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import morgan from 'morgan';
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

const app: Application = express();

// Essential middleware - re-enabled for proper functionality
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TEMPORARILY DISABLE comprehensive request logging to test if it causes issues
/*
app.use((req: Request, res: Response, next: NextFunction) => {
  // Use ALL output methods to ensure visibility
  const requestInfo = {
    method: req.method,
    url: req.url,
    path: req.path,
    timestamp: new Date().toISOString()
  };
  
  // Multiple output methods to catch any suppression
  console.log('\n🚀 === INCOMING REQUEST ===');
  console.error('🚀 === INCOMING REQUEST (stderr) ===');
  console.info('🚀 === INCOMING REQUEST (info) ===');
  process.stdout.write(`🚀 RAW STDOUT: ${JSON.stringify(requestInfo)}\n`);
  process.stderr.write(`🚀 RAW STDERR: ${JSON.stringify(requestInfo)}\n`);
  
  console.log('Method:', req.method, 'URL:', req.url, 'Path:', req.path);
  console.error('Method:', req.method, 'URL:', req.url, 'Path:', req.path);
  
  console.log('Headers:', {
    authorization: req.headers.authorization ? 'Bearer [TOKEN]' : 'NONE',
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent']?.substring(0, 50) + '...',
    origin: req.headers.origin
  });
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('=== END REQUEST LOG ===\n');
  
  // Also add a header to prove middleware is executing
  res.set('X-Request-Logged', 'true');
  next();
});
*/

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

// Register all API routes
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

// 404 handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    url: req.url,
    path: req.path,
    timestamp: new Date().toISOString()
  });
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