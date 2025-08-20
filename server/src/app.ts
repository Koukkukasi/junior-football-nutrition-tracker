import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/users', (_req: Request, res: Response) => {
  res.json({ message: 'User routes coming soon' });
});

app.use('/api/v1/food', (_req: Request, res: Response) => {
  res.json({ message: 'Food routes coming soon' });
});

app.use('/api/v1/performance', (_req: Request, res: Response) => {
  res.json({ message: 'Performance routes coming soon' });
});

app.use('/api/v1/teams', (_req: Request, res: Response) => {
  res.json({ message: 'Team routes coming soon' });
});

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