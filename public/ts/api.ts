/**
 * DeeperDive Publisher Config Tool - API Client
 * 
 * Handles all HTTP communication with the Express server.
 * Provides typed wrappers around fetch with error handling.
 */

import type { 
  PublishersRegistry, 
  PublisherConfig, 
  ApiResponse, 
  SaveResponse 
} from './types.js';

// ============================================================================
// Configuration
// ============================================================================

// API server runs on port 3001, client on port 3000
// Detect if we're in development (localhost) or production
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE = isDevelopment 
  ? 'http://localhost:3001/api'  // Development: separate ports
  : '/api';  // Production: API might be proxied or same origin

// ============================================================================
// Generic Fetch Wrapper
// ============================================================================

/**
 * Generic fetch wrapper with error handling
 */
async function fetchJson<T>(
  url: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: message };
  }
}

// ============================================================================
// API Methods
// ============================================================================

/**
 * Fetch the list of all publishers
 */
export async function fetchPublishers(): Promise<ApiResponse<PublishersRegistry>> {
  return fetchJson<PublishersRegistry>(`${API_BASE}/publishers`);
}

/**
 * Fetch a specific publisher's configuration
 * @param filename - The config filename (e.g., "publisher-aurora.json")
 */
export async function fetchPublisherConfig(
  filename: string
): Promise<ApiResponse<PublisherConfig>> {
  return fetchJson<PublisherConfig>(`${API_BASE}/publisher/${filename}`);
}

/**
 * Save a publisher's configuration
 * @param filename - The config filename (e.g., "publisher-aurora.json")
 * @param config - The updated configuration object
 */
export async function savePublisherConfig(
  filename: string, 
  config: PublisherConfig
): Promise<ApiResponse<SaveResponse>> {
  return fetchJson<SaveResponse>(`${API_BASE}/publisher/${filename}`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

// ============================================================================
// API Client Object (Alternative Interface)
// ============================================================================

/**
 * API client object for dependency injection
 */
export const api = {
  fetchPublishers,
  fetchPublisherConfig,
  savePublisherConfig,
} as const;

export type ApiClient = typeof api;

