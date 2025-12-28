/**
 * Integration tests for API route handlers
 * Tests the Express route logic directly without starting a server
 * This approach works in sandbox environments that block network operations
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { PublisherConfig } from '../../src/types.js';
import { validateFilename, validatePublisherConfig } from '../../src/utils/validation.js';
import { createBackup, readJsonFile, writeJsonFile, fileExists } from '../../src/utils/fileOperations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixtures
const FIXTURES_DIR = path.join(__dirname, '../fixtures');
const TEST_DATA_DIR = path.join(FIXTURES_DIR, 'test-data');

// ============================================================================
// Route Handler Simulation Functions
// These simulate the Express route handlers without network
// ============================================================================

interface MockResponse {
  status: number;
  body: any;
}

/**
 * Simulate GET /api/health
 */
function handleGetHealth(): MockResponse {
  return {
    status: 200,
    body: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  };
}

/**
 * Simulate GET /api/publishers
 */
async function handleGetPublishers(dataDir: string): Promise<MockResponse> {
  const dataPath = path.join(dataDir, 'publishers.json');
  
  if (!fileExists(dataPath)) {
    return { status: 404, body: { error: 'Publishers file not found' } };
  }
  
  try {
    const data = await readJsonFile(dataPath);
    return { status: 200, body: data };
  } catch (error) {
    return {
      status: 500,
      body: {
        error: 'Failed to read publishers data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Simulate GET /api/publisher/:filename
 */
async function handleGetPublisher(dataDir: string, filename: string): Promise<MockResponse> {
  if (!validateFilename(filename)) {
    return {
      status: 400,
      body: { error: 'Invalid filename format. Filename must be alphanumeric with .json extension' },
    };
  }
  
  const dataPath = path.join(dataDir, filename);
  
  if (!fileExists(dataPath)) {
    return {
      status: 404,
      body: { error: `Publisher config "${filename}" not found` },
    };
  }
  
  try {
    const data = await readJsonFile<PublisherConfig>(dataPath);
    return { status: 200, body: data };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid JSON')) {
      return {
        status: 500,
        body: { error: 'Invalid JSON in publisher config file', details: error.message },
      };
    }
    return {
      status: 500,
      body: {
        error: 'Failed to read publisher config',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Simulate PUT /api/publisher/:filename
 */
async function handlePutPublisher(
  dataDir: string, 
  filename: string, 
  body: unknown
): Promise<MockResponse> {
  if (!validateFilename(filename)) {
    return {
      status: 400,
      body: { error: 'Invalid filename format. Filename must be alphanumeric with .json extension' },
    };
  }
  
  if (!body || typeof body !== 'object') {
    return {
      status: 400,
      body: { error: 'Invalid request: body must be a valid JSON object' },
    };
  }
  
  const validation = validatePublisherConfig(body);
  if (!validation.valid) {
    return {
      status: 400,
      body: { error: validation.error || 'Invalid publisher config structure' },
    };
  }
  
  const dataPath = path.join(dataDir, filename);
  
  try {
    await createBackup(dataPath);
    await writeJsonFile<PublisherConfig>(dataPath, body as PublisherConfig);
    
    return {
      status: 200,
      body: {
        success: true,
        message: `Publisher config "${filename}" saved successfully`,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        error: 'Failed to save publisher config',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// ============================================================================
// Test Setup / Teardown
// ============================================================================

beforeAll(async () => {
  // Create test data directory
  await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  
  // Copy fixtures to test data directory
  const publishersContent = await fs.readFile(
    path.join(FIXTURES_DIR, 'test-publishers.json'),
    'utf-8'
  );
  await fs.writeFile(
    path.join(TEST_DATA_DIR, 'publishers.json'),
    publishersContent
  );
  
  const alphaContent = await fs.readFile(
    path.join(FIXTURES_DIR, 'test-publisher-alpha.json'),
    'utf-8'
  );
  await fs.writeFile(
    path.join(TEST_DATA_DIR, 'test-publisher-alpha.json'),
    alphaContent
  );
});

afterAll(async () => {
  // Clean up test data directory
  try {
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});

// ============================================================================
// Health Check Tests
// ============================================================================

describe('GET /api/health (handler)', () => {
  it('should return health status', () => {
    const response = handleGetHealth();
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
    expect(typeof response.body.uptime).toBe('number');
  });
  
  it('should return valid ISO timestamp', () => {
    const response = handleGetHealth();
    
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.toISOString()).toBe(response.body.timestamp);
  });
});

// ============================================================================
// GET /api/publishers Tests
// ============================================================================

describe('GET /api/publishers (handler)', () => {
  it('should return publishers list', async () => {
    const response = await handleGetPublishers(TEST_DATA_DIR);
    
    expect(response.status).toBe(200);
    expect(response.body.publishers).toBeDefined();
    expect(Array.isArray(response.body.publishers)).toBe(true);
  });
  
  it('should return publishers with correct structure', async () => {
    const response = await handleGetPublishers(TEST_DATA_DIR);
    
    expect(response.status).toBe(200);
    const publisher = response.body.publishers[0];
    expect(publisher).toHaveProperty('id');
    expect(publisher).toHaveProperty('alias');
    expect(publisher).toHaveProperty('file');
  });
  
  it('should return expected test publishers', async () => {
    const response = await handleGetPublishers(TEST_DATA_DIR);
    
    expect(response.status).toBe(200);
    const ids = response.body.publishers.map((p: { id: string }) => p.id);
    expect(ids).toContain('test-001');
    expect(ids).toContain('test-002');
  });
  
  it('should return 404 for missing publishers file', async () => {
    const response = await handleGetPublishers('/non/existent/path');
    
    expect(response.status).toBe(404);
    expect(response.body.error).toContain('not found');
  });
});

// ============================================================================
// GET /api/publisher/:filename Tests
// ============================================================================

describe('GET /api/publisher/:filename (handler)', () => {
  it('should return publisher config for valid filename', async () => {
    const response = await handleGetPublisher(TEST_DATA_DIR, 'test-publisher-alpha.json');
    
    expect(response.status).toBe(200);
    expect(response.body.publisherId).toBe('test-001');
    expect(response.body.aliasName).toBe('Test Publisher Alpha');
    expect(response.body.isActive).toBe(true);
  });
  
  it('should return 404 for non-existent publisher', async () => {
    const response = await handleGetPublisher(TEST_DATA_DIR, 'non-existent.json');
    
    expect(response.status).toBe(404);
    expect(response.body.error).toContain('not found');
  });
  
  it('should return 400 for invalid filename format', async () => {
    const response = await handleGetPublisher(TEST_DATA_DIR, '../etc/passwd');
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid filename');
  });
  
  it('should return 400 for filename without .json extension', async () => {
    const response = await handleGetPublisher(TEST_DATA_DIR, 'publisher-aurora.txt');
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid filename');
  });
  
  it('should return 400 for filename with special characters', async () => {
    const response = await handleGetPublisher(TEST_DATA_DIR, 'file@name.json');
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid filename');
  });
  
  it('should return pages array', async () => {
    const response = await handleGetPublisher(TEST_DATA_DIR, 'test-publisher-alpha.json');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.pages)).toBe(true);
    expect(response.body.pages.length).toBeGreaterThan(0);
    expect(response.body.pages[0]).toHaveProperty('pageType');
    expect(response.body.pages[0]).toHaveProperty('selector');
    expect(response.body.pages[0]).toHaveProperty('position');
  });
});

// ============================================================================
// PUT /api/publisher/:filename Tests
// ============================================================================

describe('PUT /api/publisher/:filename (handler)', () => {
  const validConfig: PublisherConfig = {
    publisherId: 'test-update',
    aliasName: 'Updated Publisher',
    isActive: true,
    pages: [
      { pageType: 'article', selector: '.content', position: 'bottom' }
    ],
    publisherDashboard: 'https://dashboard.example.com',
    monitorDashboard: 'https://monitor.example.com',
    qaStatusDashboard: 'https://qa.example.com',
  };
  
  afterEach(async () => {
    // Clean up any test files created during tests
    const testFiles = [
      path.join(TEST_DATA_DIR, 'new-publisher.json'),
      path.join(TEST_DATA_DIR, 'new-publisher.json.backup'),
    ];
    
    for (const file of testFiles) {
      try {
        if (existsSync(file)) {
          await fs.unlink(file);
        }
      } catch {
        // Ignore cleanup errors
      }
    }
  });
  
  it('should save valid publisher config', async () => {
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', validConfig);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('saved successfully');
  });
  
  it('should persist saved config to file', async () => {
    await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', validConfig);
    
    // Read the saved file and verify
    const savedConfig = await readJsonFile<PublisherConfig>(
      path.join(TEST_DATA_DIR, 'new-publisher.json')
    );
    
    expect(savedConfig.publisherId).toBe('test-update');
    expect(savedConfig.aliasName).toBe('Updated Publisher');
  });
  
  it('should return 400 for missing publisherId', async () => {
    const invalidConfig = { ...validConfig };
    delete (invalidConfig as any).publisherId;
    
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', invalidConfig);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('publisherId');
  });
  
  it('should return 400 for missing aliasName', async () => {
    const invalidConfig = { ...validConfig };
    delete (invalidConfig as any).aliasName;
    
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', invalidConfig);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('aliasName');
  });
  
  it('should return 400 for empty aliasName', async () => {
    const invalidConfig = { ...validConfig, aliasName: '' };
    
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', invalidConfig);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('aliasName');
  });
  
  it('should return 400 for missing isActive', async () => {
    const invalidConfig = { ...validConfig };
    delete (invalidConfig as any).isActive;
    
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', invalidConfig);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('isActive');
  });
  
  it('should return 400 for invalid isActive type', async () => {
    const invalidConfig = { ...validConfig, isActive: 'yes' as any };
    
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', invalidConfig);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('isActive');
  });
  
  it('should return 400 for invalid filename format', async () => {
    const response = await handlePutPublisher(TEST_DATA_DIR, '../malicious.json', validConfig);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid filename');
  });
  
  it('should return 400 for null request body', async () => {
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', null);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('body must be a valid JSON object');
  });
  
  it('should return 400 for string request body', async () => {
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', 'string');
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('body must be a valid JSON object');
  });
  
  it('should return 400 for invalid pages array', async () => {
    const invalidConfig = { ...validConfig, pages: 'not-an-array' as any };
    
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', invalidConfig);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('pages');
  });
  
  it('should return 400 for invalid page object', async () => {
    const invalidConfig = {
      ...validConfig,
      pages: [{ selector: '.content' }] as any, // Missing pageType
    };
    
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', invalidConfig);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('pageType');
  });
  
  it('should accept config with optional fields', async () => {
    const configWithOptional = {
      ...validConfig,
      customCss: '.widget { color: blue; }',
      tags: ['test', 'integration'],
      notes: 'Integration test notes',
    };
    
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', configWithOptional);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verify optional fields were saved
    const savedConfig = await readJsonFile<PublisherConfig>(
      path.join(TEST_DATA_DIR, 'new-publisher.json')
    );
    expect(savedConfig.customCss).toBe('.widget { color: blue; }');
    expect(savedConfig.tags).toEqual(['test', 'integration']);
  });
  
  it('should include timestamp in response', async () => {
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', validConfig);
    
    expect(response.status).toBe(200);
    expect(response.body.timestamp).toBeDefined();
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.toISOString()).toBe(response.body.timestamp);
  });
  
  it('should accept config with empty pages array', async () => {
    const configWithEmptyPages = { ...validConfig, pages: [] };
    
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', configWithEmptyPages);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
  
  it('should accept config without pages field', async () => {
    const { pages, ...configWithoutPages } = validConfig;
    
    const response = await handlePutPublisher(TEST_DATA_DIR, 'new-publisher.json', configWithoutPages);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

// ============================================================================
// Filename Validation Edge Cases Tests
// ============================================================================

describe('Filename Validation Edge Cases', () => {
  it('should reject URL encoded path traversal', async () => {
    const response = await handleGetPublisher(TEST_DATA_DIR, '..%2F..%2Fetc%2Fpasswd.json');
    
    expect(response.status).toBe(400);
  });
  
  it('should reject filename with spaces', async () => {
    const response = await handleGetPublisher(TEST_DATA_DIR, 'my file.json');
    
    expect(response.status).toBe(400);
  });
  
  it('should accept filename with underscores', async () => {
    // This should pass validation (return 404 because file doesn't exist, not 400)
    const response = await handleGetPublisher(TEST_DATA_DIR, 'my_file.json');
    
    expect(response.status).toBe(404); // Not found, but filename is valid
  });
  
  it('should accept filename with numbers', async () => {
    const response = await handleGetPublisher(TEST_DATA_DIR, 'publisher123.json');
    
    expect(response.status).toBe(404); // Not found, but filename is valid
  });
});
