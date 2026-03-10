/**
 * Logging and Monitoring Utilities
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  timestamp: Date;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;

  constructor() {
    // Set log level based on environment
    if (process.env.NODE_ENV === 'development') {
      this.logLevel = LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${levelName}: ${message}${contextStr}`;
  }

  debug(message: string, context?: any) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: any) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: any) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  error(message: string, error?: Error, context?: any) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, context));
      if (error) {
        console.error(error);
      }
    }

    // Send to monitoring service in production
    this.sendToMonitoring({
      level: LogLevel.ERROR,
      message,
      context,
      timestamp: new Date(),
      error,
    });
  }

  private async sendToMonitoring(entry: LogEntry) {
    // TODO: Implement monitoring service integration
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Would send to monitoring:', entry);
    }
  }
}

export const logger = new Logger();

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static startMark(name: string) {
    const startTime = performance.now();
    this.marks.set(name, startTime);
    logger.debug(`Performance mark started: ${name}`);
  }

  static endMark(name: string) {
    const startTime = this.marks.get(name);
    if (!startTime) {
      logger.warn(`Performance mark '${name}' not found`);
      return;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    logger.info(`Performance: ${name} took ${duration.toFixed(2)}ms`);

    // Send to monitoring if duration is concerning
    if (duration > 5000) { // 5 seconds
      logger.warn(`Slow operation detected: ${name}`, { duration });
    }

    return duration;
  }

  static measureFunction<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
    this.startMark(name);

    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.finally(() => this.endMark(name));
      } else {
        this.endMark(name);
        return result;
      }
    } catch (error) {
      this.endMark(name);
      throw error;
    }
  }
}

/**
 * User activity tracking
 */
export class ActivityTracker {
  static trackEvent(eventName: string, properties?: Record<string, any>, userId?: string) {
    const event = {
      eventName,
      properties,
      userId,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    logger.info(`Activity: ${eventName}`, event);

    // TODO: Send to analytics service
  }

  static trackPageView(page: string, userId?: string) {
    this.trackEvent('page_view', { page }, userId);
  }

  static trackUserAction(action: string, details?: Record<string, any>, userId?: string) {
    this.trackEvent('user_action', { action, ...details }, userId);
  }

  static trackError(error: Error, context?: Record<string, any>, userId?: string) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      ...context
    }, userId);
  }
}