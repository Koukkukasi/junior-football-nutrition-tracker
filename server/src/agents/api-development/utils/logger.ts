export class Logger {
  private prefix: string;

  constructor(prefix: string = '[API-Agent]') {
    this.prefix = prefix;
  }

  info(message: string, ...args: any[]): void {
    console.info(`${this.prefix} [INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix} [WARN] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`${this.prefix} [ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.DEBUG === 'true') {
      console.debug(`${this.prefix} [DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
export default logger;