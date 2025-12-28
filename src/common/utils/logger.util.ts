import * as fs from 'fs';
import * as path from 'path';
import { DatabaseCallLog } from '../interfaces/db.log.interface';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class LoggerUtil {
  private static dbLogPath = path.join(process.cwd(), 'logs', 'database.log');
  private static errorLogPath = path.join(process.cwd(), 'logs', 'error.log');
  private static appLogPath = path.join(
    process.cwd(),
    'logs',
    'application.log',
  );
  private static requestCount = 0;
  private static lastRequestTime = Date.now();
  private static requestsPerSecond = 0;

  static {
    // Ensure logs directory exists
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  /**
   * Get stack trace information
   */
  private static getStackInfo(): { file: string; line: number; func: string } {
    const stack = new Error().stack;
    const lines = stack?.split('\n') || [];

    // Skip first 3 lines (Error, getStackInfo, and the calling function)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);

      if (match) {
        const func = match[1] || 'anonymous';
        const file = match[2].split('/').pop() || 'unknown';
        const lineNum = parseInt(match[3], 10);
        return { file, line: lineNum, func };
      }

      // Handle anonymous functions
      const simpleMatch = line.match(/at\s+(.+):(\d+):(\d+)/);
      if (simpleMatch) {
        const file = simpleMatch[1].split('/').pop() || 'unknown';
        const lineNum = parseInt(simpleMatch[2], 10);
        return { file, line: lineNum, func: 'anonymous' };
      }
    }

    return { file: 'unknown', line: 0, func: 'unknown' };
  }

  /**
   * Log database call with performance metrics
   */
  static logDatabaseCall(
    query: string,
    duration: number,
    module: string,
  ): void {
    const { file, line, func } = this.getStackInfo();
    const timestamp = new Date().toISOString();

    const logEntry: DatabaseCallLog = {
      timestamp,
      query,
      duration,
      file,
      line,
      function: func,
      module,
    };

    // Log to console for immediate visibility
    console.log(logEntry);

    const logLine = `[${timestamp}] [${module}] ${file}:${line} ${func}() - Query: ${query} - Duration: ${duration}ms\n`;

    try {
      fs.appendFileSync(this.dbLogPath, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write database log to file:', error);
    }
  }

  /**
   * Track and log request per second
   */
  static trackRequest(): void {
    this.requestCount++;
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;

    if (elapsed >= 1000) {
      this.requestsPerSecond = Math.round((this.requestCount / elapsed) * 1000);
      const timestamp = new Date().toISOString();
      const logLine = `[${timestamp}] Requests per second: ${this.requestsPerSecond}\n`;

      try {
        fs.appendFileSync(this.dbLogPath, logLine, 'utf8');
      } catch (error) {
        console.error('Failed to write request tracking log to file:', error);
      }

      this.requestCount = 0;
      this.lastRequestTime = now;
    }
  }

  /**
   * Get current requests per second
   */
  static getRequestsPerSecond(): number {
    return this.requestsPerSecond;
  }

  /**
   * Log error with full context
   */
  static logError(
    error: Error | string,
    module: string,
    additionalContext?: Record<string, any>,
  ): void {
    const { file, line, func } = this.getStackInfo();
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : error;
    const stackTrace = error instanceof Error ? error.stack : '';

    const logEntry = {
      timestamp,
      module,
      file,
      line,
      function: func,
      error: errorMessage,
      stack: stackTrace,
      context: additionalContext,
    };

    // Log to console for immediate visibility
    console.error(logEntry);

    const logLine = `[${timestamp}] [${module}] ${file}:${line} ${func}()\nError: ${errorMessage}\nStack: ${stackTrace}\nContext: ${JSON.stringify(additionalContext)}\n${'='.repeat(80)}\n`;

    try {
      fs.appendFileSync(this.errorLogPath, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write error log to file:', error);
    }
  }

  /**
   * Log general application messages (info, warn, debug)
   */
  static log(
    level: LogLevel,
    message: string,
    module: string,
    additionalContext?: Record<string, any>,
  ): void {
    const { file, line, func } = this.getStackInfo();
    const timestamp = new Date().toISOString();

    // const logEntry = {
    //   timestamp,
    //   level,
    //   module,
    //   file,
    //   line,
    //   function: func,
    //   message,
    //   context: additionalContext,
    // };

    // Always log to console for immediate visibility
    const consoleMessage = `[${timestamp}] [${level}] [${module}] ${message}`;
    if (level === LogLevel.ERROR || level === LogLevel.WARN) {
      console.error(consoleMessage, additionalContext || '');
    } else {
      console.log(consoleMessage, additionalContext || '');
    }

    // Write to file
    const logLine = `[${timestamp}] [${level}] [${module}] ${file}:${line} ${func}()\nMessage: ${message}\nContext: ${JSON.stringify(additionalContext || {})}\n${'='.repeat(80)}\n`;

    try {
      fs.appendFileSync(this.appLogPath, logLine, 'utf8');
    } catch (error) {
      // Fallback to console if file write fails
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Convenience methods for different log levels
   */
  static info(
    message: string,
    module: string,
    context?: Record<string, any>,
  ): void {
    this.log(LogLevel.INFO, message, module, context);
  }

  static warn(
    message: string,
    module: string,
    context?: Record<string, any>,
  ): void {
    this.log(LogLevel.WARN, message, module, context);
  }

  static debug(
    message: string,
    module: string,
    context?: Record<string, any>,
  ): void {
    this.log(LogLevel.DEBUG, message, module, context);
  }

  /**
   * Clear logs (useful for testing or maintenance)
   */
  static clearLogs(): void {
    if (fs.existsSync(this.dbLogPath)) {
      fs.writeFileSync(this.dbLogPath, '', 'utf8');
    }
    if (fs.existsSync(this.errorLogPath)) {
      fs.writeFileSync(this.errorLogPath, '', 'utf8');
    }
    if (fs.existsSync(this.appLogPath)) {
      fs.writeFileSync(this.appLogPath, '', 'utf8');
    }
  }
}
