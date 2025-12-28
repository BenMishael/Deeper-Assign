/**
 * Server-side constants
 */

/**
 * File size limits
 */
export const FILE_LIMITS = {
  /** Maximum config file size in bytes (1MB) */
  MAX_CONFIG_SIZE_BYTES: 1024 * 1024,
  
  /** Maximum JSON payload size for Express */
  MAX_JSON_PAYLOAD: '10mb',
} as const;

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  /** Valid filename pattern */
  FILENAME: /^[a-zA-Z0-9_-]+\.json$/,
} as const;

