/**
 * Validation utilities for server-side
 */

import type { PublisherConfig, ValidationResult, PageConfig } from '../types.js';

/**
 * Validate filename to prevent path traversal attacks
 */
export function validateFilename(filename: string): boolean {
  // Only allow alphanumeric, hyphens, underscores, and dots
  // Must end with .json
  const validPattern = /^[a-zA-Z0-9_-]+\.json$/;
  return validPattern.test(filename);
}

/**
 * Validate publisher config structure
 */
export function validatePublisherConfig(data: unknown): ValidationResult {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid config: must be an object" };
  }

  const config = data as Record<string, unknown>;

  // Required fields
  if (!config.publisherId || typeof config.publisherId !== "string") {
    return { 
      valid: false, 
      error: "Invalid config: publisherId is required and must be a string" 
    };
  }

  if (!config.aliasName || typeof config.aliasName !== "string" || config.aliasName.trim() === "") {
    return { 
      valid: false, 
      error: "Invalid config: aliasName is required and cannot be empty" 
    };
  }

  if (typeof config.isActive !== "boolean") {
    return { 
      valid: false, 
      error: "Invalid config: isActive must be a boolean" 
    };
  }

  // Validate pages array if present
  if (config.pages !== undefined) {
    if (!Array.isArray(config.pages)) {
      return { 
        valid: false, 
        error: "Invalid config: pages must be an array" 
      };
    }
    
    for (let i = 0; i < config.pages.length; i++) {
      const page = config.pages[i] as PageConfig;
      if (!page || typeof page !== "object") {
        return { 
          valid: false, 
          error: `Invalid config: pages[${i}] must be an object` 
        };
      }
      if (!page.pageType || typeof page.pageType !== "string") {
        return { 
          valid: false, 
          error: `Invalid config: pages[${i}].pageType is required and must be a string` 
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path separators and dangerous characters
  return filename
    .replace(/[\/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9_.-]/g, '');
}

