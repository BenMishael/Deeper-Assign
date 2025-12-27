/**
 * DeeperDive Publisher Config Tool - Type Definitions
 * 
 * Core TypeScript interfaces for the publisher configuration system.
 * These types are derived from the actual JSON data structures.
 */

// ============================================================================
// Publisher Registry Types
// ============================================================================

/**
 * A single publisher entry in the registry (publishers.json)
 */
export interface PublisherEntry {
  id: string;
  alias: string;
  file: string;
}

/**
 * The publishers registry structure
 */
export interface PublishersRegistry {
  publishers: PublisherEntry[];
}

// ============================================================================
// Publisher Configuration Types
// ============================================================================

/**
 * Page configuration - defines where widgets appear on publisher pages
 */
export interface PageConfig {
  pageType: string;
  selector: string;
  position: 'top' | 'bottom' | 'sidebar' | string;
}

/**
 * Full publisher configuration
 * Note: Some fields are optional as configs vary between publishers
 */
export interface PublisherConfig {
  // Required fields (present in all configs)
  publisherId: string;
  aliasName: string;
  pages: PageConfig[];
  publisherDashboard: string;
  monitorDashboard: string;
  qaStatusDashboard: string;
  isActive: boolean;

  // Optional fields (vary by publisher)
  customCss?: string;
  tags?: string[];
  allowedDomains?: string[];
  contactEmail?: string;
  defaultLanguage?: string;
  lastUpdated?: string;
  notes?: string;
}

// ============================================================================
// Application State Types
// ============================================================================

/**
 * Application state for managing the config editor
 */
export interface AppState {
  // Publisher list
  publishers: PublisherEntry[];
  isLoadingPublishers: boolean;
  publishersError: string | null;

  // Selected publisher
  selectedPublisherId: string | null;
  
  // Config editing
  originalConfig: PublisherConfig | null;
  workingConfig: PublisherConfig | null;
  isLoadingConfig: boolean;
  configError: string | null;
  
  // Save state
  isSaving: boolean;
  saveError: string | null;
  lastSaveTime: Date | null;
}

/**
 * State change listener callback
 */
export type StateListener = (state: AppState, changedKeys: (keyof AppState)[]) => void;

// ============================================================================
// API Types
// ============================================================================

/**
 * API response wrapper for error handling
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Save response from the server
 */
export interface SaveResponse {
  success: boolean;
}

// ============================================================================
// UI Types
// ============================================================================

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification data
 */
export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/**
 * Field metadata for dynamic form rendering
 */
export interface FieldMeta {
  key: string;
  label: string;
  type: 'text' | 'url' | 'boolean' | 'textarea' | 'array' | 'object-array' | 'readonly';
  required: boolean;
  placeholder?: string;
  hint?: string;
}

/**
 * Change diff for preview highlighting
 */
export interface ConfigDiff {
  path: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'added' | 'removed' | 'changed';
}

