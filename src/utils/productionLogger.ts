/**
 * Production-safe logging utility
 * Only logs in development mode, silent in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface Logger {
  log: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

const isDevelopment = import.meta.env.DEV;

const createLogger = (): Logger => {
  const log = (level: LogLevel) => (...args: any[]) => {
    if (isDevelopment) {
      console[level](...args);
    }
    // In production, optionally send to external logging service
    // Example: if (level === 'error') { sendToSentry(...args); }
  };

  return {
    log: log('log'),
    info: log('info'), 
    warn: log('warn'),
    error: log('error'),
    debug: log('debug'),
  };
};

export const logger = createLogger();

// For backward compatibility, export individual functions
export const { log, info, warn, error, debug } = logger;

export default logger;