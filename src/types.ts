/**
 * Server-side Type Definitions
 */

export interface PublisherConfig {
  publisherId: string;
  aliasName: string;
  isActive: boolean;
  pages?: PageConfig[];
  publisherDashboard?: string;
  monitorDashboard?: string;
  qaStatusDashboard?: string;
  customCss?: string;
  tags?: string[];
  allowedDomains?: string[];
  contactEmail?: string;
  defaultLanguage?: string;
  notes?: string;
  lastUpdated?: string;
  [key: string]: unknown; // Allow additional dynamic fields
}

export interface PageConfig {
  pageType: string;
  selector: string;
  position: string;
  [key: string]: unknown; // Allow additional dynamic fields
}

export interface PublishersResponse {
  publishers: PublisherEntry[];
}

export interface PublisherEntry {
  id: string;
  alias: string;
  file: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface ApiSuccess {
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

