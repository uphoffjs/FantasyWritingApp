/**
 * @fileoverview Error Logging Service
 * Basic error logging and reporting functionality for the Fantasy Writing App
 *
 * Purpose:
 * - Centralized error logging
 * - Error categorization and severity levels
 * - User-friendly error messages
 * - Integration with store error handling
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  STORAGE = 'storage',
  AUTH = 'auth',
  UI = 'ui',
  BUSINESS = 'business',
  SYSTEM = 'system'
}

export interface ErrorLog {
  id: string;
  timestamp: Date;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Error details can be any type depending on error context
  details?: any;
  stack?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
}

export interface ErrorContext {
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  userId?: string;
  sessionId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Additional data can be any type for error context
  additionalData?: any;
}

class ErrorLoggingService {
  private logs: ErrorLog[] = [];
  private readonly maxLogs = 1000; // Keep only the last 1000 logs in memory

  /**
   * Log an error with context information
   */
  logError(error: Error | string, context: ErrorContext = {}): string {
    const errorId = this.generateErrorId();
    const timestamp = new Date();

    const errorLog: ErrorLog = {
      id: errorId,
      timestamp,
      category: context.category || ErrorCategory.SYSTEM,
      severity: context.severity || ErrorSeverity.MEDIUM,
      message: typeof error === 'string' ? error : error.message,
      details: context.additionalData,
      stack: typeof error === 'object' ? error.stack : undefined,
      userId: context.userId,
      sessionId: context.sessionId,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    // Add to in-memory logs
    this.logs.push(errorLog);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console for development
    this.logToConsole(errorLog);

    // Store in localStorage for persistence (optional)
    this.persistToStorage(errorLog);

    return errorId;
  }

  /**
   * Log a validation error
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Value can be any type for validation error logging
  logValidationError(message: string, field?: string, value?: any): string {
    return this.logError(message, {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      additionalData: { field, value }
    });
  }

  /**
   * Log a network error
   */
  logNetworkError(error: Error, endpoint?: string, method?: string): string {
    return this.logError(error, {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      additionalData: { endpoint, method }
    });
  }

  /**
   * Log a business logic error
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Data can be any type for business error logging
  logBusinessError(message: string, operation?: string, data?: any): string {
    return this.logError(message, {
      category: ErrorCategory.BUSINESS,
      severity: ErrorSeverity.MEDIUM,
      additionalData: { operation, data }
    });
  }

  /**
   * Get recent error logs
   */
  getRecentLogs(limit: number = 50): ErrorLog[] {
    return this.logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: ErrorCategory, limit: number = 50): ErrorLog[] {
    return this.logs
      .filter(log => log.category === category)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: ErrorSeverity, limit: number = 50): ErrorLog[] {
    return this.logs
      .filter(log => log.severity === severity)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('errorLogs');
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recentCount: number; // Last 24 hours
  } {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentLogs = this.logs.filter(log => log.timestamp > dayAgo);

    const byCategory = Object.values(ErrorCategory).reduce((acc, category) => {
      acc[category] = this.logs.filter(log => log.category === category).length;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const bySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = this.logs.filter(log => log.severity === severity).length;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    return {
      total: this.logs.length,
      byCategory,
      bySeverity,
      recentCount: recentLogs.length
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logToConsole(errorLog: ErrorLog): void {
    if (typeof console === 'undefined') return;

    const consoleMethod = this.getConsoleMethod(errorLog.severity);
    const prefix = `[${errorLog.category.toUpperCase()}][${errorLog.severity.toUpperCase()}]`;

    consoleMethod(`${prefix} ${errorLog.message}`, {
      id: errorLog.id,
      timestamp: errorLog.timestamp,
      details: errorLog.details,
      stack: errorLog.stack
    });
  }

  private getConsoleMethod(severity: ErrorSeverity): (...args: unknown[]) => void {
    switch (severity) {
      case ErrorSeverity.LOW:
        return console.info;
      case ErrorSeverity.MEDIUM:
        return console.warn;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private persistToStorage(errorLog: ErrorLog): void {
    if (typeof window === 'undefined') return;

    try {
      const existingLogs = localStorage.getItem('errorLogs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push({
        ...errorLog,
        timestamp: errorLog.timestamp.toISOString() // Serialize date
      });

      // Keep only the last 100 logs in localStorage
      const recentLogs = logs.slice(-100);
      localStorage.setItem('errorLogs', JSON.stringify(recentLogs));
    } catch (error) {
      // Silent fail - don't log errors about logging errors
      console.warn('Failed to persist error log to localStorage:', error);
    }
  }

  /**
   * Load persisted logs from localStorage
   */
  loadPersistedLogs(): void {
    if (typeof window === 'undefined') return;

    try {
      const existingLogs = localStorage.getItem('errorLogs');
      if (existingLogs) {
        const logs = JSON.parse(existingLogs);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON parsing returns any type for log entries
        const deserializedLogs = logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp) // Deserialize date
        }));
        this.logs = [...deserializedLogs, ...this.logs];
      }
    } catch (error) {
      console.warn('Failed to load persisted error logs:', error);
    }
  }
}

// Create and export singleton instance
export const errorLoggingService = new ErrorLoggingService();

// Initialize persisted logs on startup
if (typeof window !== 'undefined') {
  errorLoggingService.loadPersistedLogs();
}

export default errorLoggingService;