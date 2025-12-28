/**
 * Logging utility for server
 * Provides consistent logging with environment-aware behavior
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Format log message with timestamp and level
 */
function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const emoji = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
  }[level];
  
  let formatted = `${emoji} [${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    formatted += `\n${JSON.stringify(data, null, 2)}`;
  }
  
  return formatted;
}

/**
 * Application logger
 */
export const logger = {
  /**
   * Debug logs (only in development)
   */
  debug(message: string, data?: unknown): void {
    if (isDevelopment) {
      console.log(formatLog('debug', message, data));
    }
  },
  
  /**
   * Info logs
   */
  info(message: string, data?: unknown): void {
    console.log(formatLog('info', message, data));
  },
  
  /**
   * Warning logs
   */
  warn(message: string, data?: unknown): void {
    console.warn(formatLog('warn', message, data));
  },
  
  /**
   * Error logs
   */
  error(message: string, error?: unknown): void {
    const data = error instanceof Error ? {
      message: error.message,
      stack: isDevelopment ? error.stack : undefined,
    } : error;
    
    console.error(formatLog('error', message, data));
  },
  
  /**
   * Success logs (info with checkmark)
   */
  success(message: string): void {
    console.log(`✅ ${message}`);
  },
};

/**
 * Error message formatter
 */
export const errorMessages = {
  validation: (field: string) => `Validation failed: ${field}`,
  notFound: (resource: string) => `${resource} not found`,
  fileRead: (filename: string) => `Failed to read file: ${filename}`,
  fileWrite: (filename: string) => `Failed to write file: ${filename}`,
  invalidJson: () => 'Invalid JSON format',
  serverError: () => 'Internal server error',
  timeout: () => 'Request timeout',
  network: () => 'Network error',
  unauthorized: () => 'Unauthorized access',
};

