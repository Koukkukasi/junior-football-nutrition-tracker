/**
 * Logger utility for server-side logging
 * Replaces console.log statements with proper logging
 */

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private log(level: LogLevel, message: string, meta?: any) {
    if (this.isDevelopment || level === LogLevel.ERROR) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${level}] ${message}`;
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(logMessage, meta || '');
          break;
        case LogLevel.WARN:
          console.warn(logMessage, meta || '');
          break;
        case LogLevel.INFO:
          if (this.isDevelopment) {
            console.info(logMessage, meta || '');
          }
          break;
        case LogLevel.DEBUG:
          if (this.isDevelopment) {
            console.debug(logMessage, meta || '');
          }
          break;
      }
    }
  }

  error(message: string, error?: Error | any) {
    this.log(LogLevel.ERROR, message, error);
  }

  warn(message: string, meta?: any) {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: any) {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message: string, meta?: any) {
    this.log(LogLevel.DEBUG, message, meta);
  }
}

export const logger = new Logger();