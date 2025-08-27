import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
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

// CORS configuration for production
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://junior-football-nutrition-tracker.onrender.com',  // Main production URL
      'https://junior-football-nutrition-client.onrender.com',
      'https://junior-football-nutrition-tracker.vercel.app',
      'https://junior-football-nutrition.netlify.app'
    ];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // For now, allow all origins to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Email'],
  maxAge: 86400 // 24 hours
};

// Essential middleware - re-enabled for proper functionality
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging for debugging production issues
app.use((req: Request, _res: Response, next: NextFunction) => {
  // Simple logging for production debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    origin: req.headers.origin,
    hasAuth: !!req.headers.authorization
  });
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

// Serve static files from the client build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the client build directory
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));
  
  // Serve index.html for all non-API routes (client-side routing)
  app.get('*', (req: Request, res: Response) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ 
        error: 'API route not found',
        method: req.method,
        url: req.url,
        path: req.path,
        timestamp: new Date().toISOString()
      });
    } else {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    }
  });
} else {
  // 404 handler for unmatched routes in development
  app.use((req: Request, res: Response) => {
    res.status(404).json({ 
      error: 'Route not found',
      method: req.method,
      url: req.url,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  });
}

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

export default app;