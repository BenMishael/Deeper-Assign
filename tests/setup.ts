/**
 * Test setup file
 * Global configuration for Vitest
 */

import { beforeAll, afterAll, vi } from 'vitest';

// Suppress console.log and console.warn during tests (optional - remove if you want to see logs)
beforeAll(() => {
  // Keep console.error for important errors
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

