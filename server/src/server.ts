import app from './app';
import { logger } from './utils/logger';
import { prisma } from './db';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📡 Health check available at http://localhost:${PORT}/health`);
    });
    
    // Keep the process alive
    server.keepAliveTimeout = 61 * 1000;
    server.headersTimeout = 65 * 1000;
    
    // Graceful shutdown handlers
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
    
    // Keep the server running
    // This prevents the Node.js process from exiting
    setInterval(() => {
      // Keep-alive interval
    }, 1000 * 60 * 60); // 1 hour
  } catch (error) {
    logger.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();