/**
 * Unit tests for validation utilities
 * Tests filename validation, publisher config validation, and sanitization functions
 */

import { describe, it, expect } from 'vitest';
import { 
  validateFilename, 
  validatePublisherConfig, 
  sanitizeFilename 
} from '../../src/utils/validation.js';

// ============================================================================
// validateFilename Tests
// ============================================================================

describe('validateFilename', () => {
  describe('valid filenames', () => {
    it('should accept simple .json filename', () => {
      expect(validateFilename('publishers.json')).toBe(true);
    });

    it('should accept filename with hyphens', () => {
      expect(validateFilename('publisher-aurora.json')).toBe(true);
    });

    it('should accept filename with underscores', () => {
      expect(validateFilename('publisher_aurora.json')).toBe(true);
    });

    it('should accept filename with numbers', () => {
      expect(validateFilename('publisher123.json')).toBe(true);
    });

    it('should accept mixed alphanumeric with hyphens and underscores', () => {
      expect(validateFilename('my_publisher-config-v2.json')).toBe(true);
    });
  });

  describe('invalid filenames', () => {
    it('should reject filename without .json extension', () => {
      expect(validateFilename('publishers.txt')).toBe(false);
    });

    it('should reject filename with path traversal (../)', () => {
      expect(validateFilename('../publishers.json')).toBe(false);
    });

    it('should reject filename with path separator', () => {
      expect(validateFilename('data/publishers.json')).toBe(false);
    });

    it('should reject filename with backslash', () => {
      expect(validateFilename('data\\publishers.json')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateFilename('')).toBe(false);
    });

    it('should reject just .json', () => {
      expect(validateFilename('.json')).toBe(false);
    });

    it('should reject filename with spaces', () => {
      expect(validateFilename('my file.json')).toBe(false);
    });

    it('should reject filename with special characters', () => {
      expect(validateFilename('publisher@aurora.json')).toBe(false);
      expect(validateFilename('publisher#1.json')).toBe(false);
      expect(validateFilename('publisher$.json')).toBe(false);
    });

    it('should reject multiple extensions', () => {
      expect(validateFilename('file.json.bak')).toBe(false);
    });
  });
});

// ============================================================================
// validatePublisherConfig Tests
// ============================================================================

describe('validatePublisherConfig', () => {
  const validConfig = {
    publisherId: 'pub-001',
    aliasName: 'Test Publisher',
    isActive: true,
    pages: [
      { pageType: 'homepage', selector: '#main', position: 'top' }
    ],
    publisherDashboard: 'https://dashboard.example.com',
    monitorDashboard: 'https://monitor.example.com',
    qaStatusDashboard: 'https://qa.example.com',
  };

  describe('valid configurations', () => {
    it('should accept a complete valid config', () => {
      const result = validatePublisherConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept config with optional fields', () => {
      const configWithOptional = {
        ...validConfig,
        customCss: '.widget { color: red; }',
        tags: ['tech', 'news'],
        allowedDomains: ['example.com'],
        contactEmail: 'support@example.com',
        notes: 'Test notes',
      };
      const result = validatePublisherConfig(configWithOptional);
      expect(result.valid).toBe(true);
    });

    it('should accept config without pages array', () => {
      const { pages, ...configWithoutPages } = validConfig;
      const result = validatePublisherConfig(configWithoutPages);
      expect(result.valid).toBe(true);
    });

    it('should accept config with empty pages array', () => {
      const configWithEmptyPages = { ...validConfig, pages: [] };
      const result = validatePublisherConfig(configWithEmptyPages);
      expect(result.valid).toBe(true);
    });

    it('should accept isActive as false', () => {
      const configInactive = { ...validConfig, isActive: false };
      const result = validatePublisherConfig(configInactive);
      expect(result.valid).toBe(true);
    });
  });

  describe('missing required fields', () => {
    it('should reject null config', () => {
      const result = validatePublisherConfig(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be an object');
    });

    it('should reject undefined config', () => {
      const result = validatePublisherConfig(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be an object');
    });

    it('should reject non-object config', () => {
      const result = validatePublisherConfig('string');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be an object');
    });

    it('should reject missing publisherId', () => {
      const { publisherId, ...configWithoutId } = validConfig;
      const result = validatePublisherConfig(configWithoutId);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('publisherId');
    });

    it('should reject missing aliasName', () => {
      const { aliasName, ...configWithoutAlias } = validConfig;
      const result = validatePublisherConfig(configWithoutAlias);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('aliasName');
    });

    it('should reject empty aliasName', () => {
      const configEmptyAlias = { ...validConfig, aliasName: '' };
      const result = validatePublisherConfig(configEmptyAlias);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('aliasName');
    });

    it('should reject whitespace-only aliasName', () => {
      const configWhitespaceAlias = { ...validConfig, aliasName: '   ' };
      const result = validatePublisherConfig(configWhitespaceAlias);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('aliasName');
    });

    it('should reject missing isActive', () => {
      const { isActive, ...configWithoutActive } = validConfig;
      const result = validatePublisherConfig(configWithoutActive);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('isActive');
    });
  });

  describe('invalid field types', () => {
    it('should reject non-string publisherId', () => {
      const configNumericId = { ...validConfig, publisherId: 123 };
      const result = validatePublisherConfig(configNumericId);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('publisherId');
    });

    it('should reject non-string aliasName', () => {
      const configNumericAlias = { ...validConfig, aliasName: 456 };
      const result = validatePublisherConfig(configNumericAlias);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('aliasName');
    });

    it('should reject non-boolean isActive', () => {
      const configStringActive = { ...validConfig, isActive: 'yes' };
      const result = validatePublisherConfig(configStringActive);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('isActive');
    });

    it('should reject pages as non-array', () => {
      const configPagesObject = { ...validConfig, pages: {} };
      const result = validatePublisherConfig(configPagesObject);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('pages must be an array');
    });
  });

  describe('invalid page configurations', () => {
    it('should reject page without pageType', () => {
      const configInvalidPage = {
        ...validConfig,
        pages: [{ selector: '#main', position: 'top' }]
      };
      const result = validatePublisherConfig(configInvalidPage);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('pageType');
    });

    it('should reject non-string pageType', () => {
      const configInvalidPageType = {
        ...validConfig,
        pages: [{ pageType: 123, selector: '#main', position: 'top' }]
      };
      const result = validatePublisherConfig(configInvalidPageType);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('pageType');
    });

    it('should reject non-object page entry', () => {
      const configNonObjectPage = {
        ...validConfig,
        pages: ['homepage']
      };
      const result = validatePublisherConfig(configNonObjectPage);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be an object');
    });

    it('should indicate which page index has the error', () => {
      const configMultiplePages = {
        ...validConfig,
        pages: [
          { pageType: 'homepage', selector: '#main', position: 'top' },
          { selector: '#article', position: 'bottom' }, // Missing pageType
        ]
      };
      const result = validatePublisherConfig(configMultiplePages);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('pages[1]');
    });
  });
});

// ============================================================================
// sanitizeFilename Tests
// ============================================================================

describe('sanitizeFilename', () => {
  it('should pass through valid filenames unchanged', () => {
    expect(sanitizeFilename('publishers.json')).toBe('publishers.json');
    expect(sanitizeFilename('publisher-aurora.json')).toBe('publisher-aurora.json');
  });

  it('should remove forward slashes', () => {
    expect(sanitizeFilename('path/to/file.json')).toBe('pathtofile.json');
  });

  it('should remove backslashes', () => {
    expect(sanitizeFilename('path\\to\\file.json')).toBe('pathtofile.json');
  });

  it('should remove double dots (path traversal)', () => {
    expect(sanitizeFilename('../file.json')).toBe('file.json');
    expect(sanitizeFilename('../../file.json')).toBe('file.json');
  });

  it('should remove special characters', () => {
    expect(sanitizeFilename('file@name.json')).toBe('filename.json');
    expect(sanitizeFilename('file#name.json')).toBe('filename.json');
    expect(sanitizeFilename('file$name.json')).toBe('filename.json');
    expect(sanitizeFilename('file name.json')).toBe('filename.json');
  });

  it('should preserve allowed characters', () => {
    expect(sanitizeFilename('my_file-name.json')).toBe('my_file-name.json');
    expect(sanitizeFilename('file123.json')).toBe('file123.json');
  });
});

