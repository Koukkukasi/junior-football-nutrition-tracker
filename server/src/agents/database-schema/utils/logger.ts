export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(prefix: string = '[DB-Agent]', level: LogLevel = LogLevel.INFO) {
    this.prefix = prefix;
    this.level = this.getLogLevelFromEnv() || level;
  }

  private getLogLevelFromEnv(): LogLevel | null {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel && envLevel in LogLevel) {
      return LogLevel[envLevel as keyof typeof LogLevel] as LogLevel;
    }
    return null;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + JSON.stringify(args) : '';
    return `${timestamp} ${this.prefix} [${level}] ${message}${formattedArgs}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, ...args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message, ...args));
    }
  }

  logQuery(query: string, params?: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('QUERY', query));
      if (params && params.length > 0) {
        console.debug(this.formatMessage('PARAMS', JSON.stringify(params)));
      }
    }
  }

  logPerformance(operation: string, startTime: number): void {
    const duration = Date.now() - startTime;
    const level = duration > 1000 ? 'WARN' : 'INFO';
    
    if ((level === 'WARN' && this.level <= LogLevel.WARN) || 
        (level === 'INFO' && this.level <= LogLevel.INFO)) {
      console.log(this.formatMessage('PERF', `${operation} took ${duration}ms`));
    }
  }
}

export const logger = new Logger();
export default logger;