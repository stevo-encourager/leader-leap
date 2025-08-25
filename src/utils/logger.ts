import { logger as productionLogger } from './productionLogger';
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;
  private prefix: string;

  constructor(prefix = '') {
    this.isDevelopment = import.meta.env.DEV;
    this.prefix = prefix;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefixStr = this.prefix ? `[${this.prefix}] ` : '';
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `${timestamp} ${level.toUpperCase()} ${prefixStr}${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      productionLogger.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      productionLogger.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    productionLogger.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    const errorInfo = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;
    
    const fullContext = { ...context, error: errorInfo };
    productionLogger.error(this.formatMessage('error', message, fullContext));
  }
}

// Create logger instances for different parts of the application
export const createLogger = (prefix?: string) => new Logger(prefix);

// Pre-configured loggers for common use cases
export const logger = new Logger();
export const assessmentLogger = new Logger('Assessment');
export const authLogger = new Logger('Auth');
export const adminLogger = new Logger('Admin');
export const chartLogger = new Logger('Chart');
export const pdfLogger = new Logger('PDF');
export const supabaseLogger = new Logger('Supabase');