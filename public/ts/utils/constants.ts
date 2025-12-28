/**
 * Application constants
 * Centralized configuration values for consistency and maintainability
 */

/**
 * UI timing constants
 */
export const UI_TIMING = {
  /** Minimum duration for loading animations (ms) */
  MIN_LOADING_DURATION_MS: 300,
  
  /** Default toast notification duration (ms) */
  TOAST_DEFAULT_DURATION_MS: 4000,
  
  /** Toast fade out animation duration (ms) */
  TOAST_FADEOUT_MS: 300,
  
  /** Focus delay for new form inputs (ms) */
  INPUT_FOCUS_DELAY_MS: 50,
} as const;

/**
 * Form field detection thresholds
 */
export const FIELD_DETECTION = {
  /** Character count threshold for textarea vs input */
  TEXTAREA_THRESHOLD_CHARS: 100,
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  /** Request timeout in milliseconds */
  REQUEST_TIMEOUT_MS: 10000,
  
  /** Maximum retries for failed requests */
  MAX_RETRIES: 3,
  
  /** Retry delay in milliseconds */
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * File size limits
 */
export const FILE_LIMITS = {
  /** Maximum config file size in bytes (1MB) */
  MAX_CONFIG_SIZE_BYTES: 1024 * 1024,
  
  /** Maximum JSON payload size */
  MAX_JSON_PAYLOAD: '10mb',
} as const;

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  /** Valid filename pattern (alphanumeric, hyphens, underscores, .json extension) */
  FILENAME: /^[a-zA-Z0-9_-]+\.json$/,
  
  /** URL pattern detection */
  URL_PREFIX: /^https?:\/\//,
} as const;

