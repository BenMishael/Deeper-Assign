/**
 * Unit tests for file operations utilities
 * Tests backup creation, JSON reading/writing, and file existence checks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createBackup,
  readJsonFile,
  writeJsonFile,
  fileExists,
} from '../../src/utils/fileOperations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixtures directory
const FIXTURES_DIR = path.join(__dirname, '../fixtures');
const TEST_FILE = path.join(FIXTURES_DIR, 'test-config.json');
const TEST_BACKUP = path.join(FIXTURES_DIR, 'test-config.json.backup');

// Sample test data
const sampleConfig = {
  publisherId: 'test-001',
  aliasName: 'Test Publisher',
  isActive: true,
  pages: [],
};

// ============================================================================
// Setup / Teardown
// ============================================================================

beforeEach(async () => {
  // Ensure fixtures directory exists
  await fs.mkdir(FIXTURES_DIR, { recursive: true });
});

afterEach(async () => {
  // Clean up test files
  try {
    if (existsSync(TEST_FILE)) {
      await fs.unlink(TEST_FILE);
    }
    if (existsSync(TEST_BACKUP)) {
      await fs.unlink(TEST_BACKUP);
    }
  } catch {
    // Ignore cleanup errors
  }
});

// ============================================================================
// fileExists Tests
// ============================================================================

describe('fileExists', () => {
  it('should return true for existing files', async () => {
    // Create a test file
    await fs.writeFile(TEST_FILE, '{}', 'utf-8');
    expect(fileExists(TEST_FILE)).toBe(true);
  });

  it('should return false for non-existing files', () => {
    expect(fileExists('/non/existent/file.json')).toBe(false);
  });

  it('should return false for directories', async () => {
    expect(fileExists(FIXTURES_DIR)).toBe(true); // existsSync returns true for directories
  });
});

// ============================================================================
// readJsonFile Tests
// ============================================================================

describe('readJsonFile', () => {
  it('should read and parse valid JSON file', async () => {
    await fs.writeFile(TEST_FILE, JSON.stringify(sampleConfig), 'utf-8');
    
    const result = await readJsonFile<typeof sampleConfig>(TEST_FILE);
    
    expect(result).toEqual(sampleConfig);
    expect(result.publisherId).toBe('test-001');
    expect(result.aliasName).toBe('Test Publisher');
  });

  it('should read and parse JSON with formatting', async () => {
    await fs.writeFile(TEST_FILE, JSON.stringify(sampleConfig, null, 2), 'utf-8');
    
    const result = await readJsonFile<typeof sampleConfig>(TEST_FILE);
    
    expect(result).toEqual(sampleConfig);
  });

  it('should throw for invalid JSON', async () => {
    await fs.writeFile(TEST_FILE, '{ invalid json }', 'utf-8');
    
    await expect(readJsonFile(TEST_FILE)).rejects.toThrow('Invalid JSON');
  });

  it('should throw for non-existent file', async () => {
    await expect(readJsonFile('/non/existent/file.json')).rejects.toThrow();
  });

  it('should read arrays', async () => {
    const arrayData = [1, 2, 3, { key: 'value' }];
    await fs.writeFile(TEST_FILE, JSON.stringify(arrayData), 'utf-8');
    
    const result = await readJsonFile<typeof arrayData>(TEST_FILE);
    
    expect(result).toEqual(arrayData);
  });

  it('should handle nested objects', async () => {
    const nestedConfig = {
      ...sampleConfig,
      nested: {
        level1: {
          level2: {
            value: 'deep'
          }
        }
      }
    };
    await fs.writeFile(TEST_FILE, JSON.stringify(nestedConfig), 'utf-8');
    
    const result = await readJsonFile<typeof nestedConfig>(TEST_FILE);
    
    expect(result.nested.level1.level2.value).toBe('deep');
  });
});

// ============================================================================
// writeJsonFile Tests
// ============================================================================

describe('writeJsonFile', () => {
  it('should write JSON file with formatting', async () => {
    await writeJsonFile(TEST_FILE, sampleConfig);
    
    const content = await fs.readFile(TEST_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    
    expect(parsed).toEqual(sampleConfig);
    // Check that it's formatted (has newlines)
    expect(content).toContain('\n');
  });

  it('should create file if it does not exist', async () => {
    expect(existsSync(TEST_FILE)).toBe(false);
    
    await writeJsonFile(TEST_FILE, sampleConfig);
    
    expect(existsSync(TEST_FILE)).toBe(true);
  });

  it('should overwrite existing file', async () => {
    const initialConfig = { publisherId: 'initial' };
    const updatedConfig = { publisherId: 'updated' };
    
    await writeJsonFile(TEST_FILE, initialConfig);
    await writeJsonFile(TEST_FILE, updatedConfig);
    
    const result = await readJsonFile<typeof updatedConfig>(TEST_FILE);
    expect(result.publisherId).toBe('updated');
  });

  it('should handle arrays', async () => {
    const arrayData = ['item1', 'item2', 'item3'];
    
    await writeJsonFile(TEST_FILE, arrayData);
    
    const result = await readJsonFile<typeof arrayData>(TEST_FILE);
    expect(result).toEqual(arrayData);
  });

  it('should use 2-space indentation', async () => {
    await writeJsonFile(TEST_FILE, { a: { b: 1 } });
    
    const content = await fs.readFile(TEST_FILE, 'utf-8');
    
    // Should contain 2-space indentation pattern
    expect(content).toMatch(/^  "a"/m);
    expect(content).toMatch(/^    "b"/m);
  });
});

// ============================================================================
// createBackup Tests
// ============================================================================

describe('createBackup', () => {
  it('should create backup file with .backup extension', async () => {
    await fs.writeFile(TEST_FILE, JSON.stringify(sampleConfig), 'utf-8');
    
    await createBackup(TEST_FILE);
    
    expect(existsSync(TEST_BACKUP)).toBe(true);
  });

  it('should copy original content to backup', async () => {
    const originalContent = JSON.stringify(sampleConfig, null, 2);
    await fs.writeFile(TEST_FILE, originalContent, 'utf-8');
    
    await createBackup(TEST_FILE);
    
    const backupContent = await fs.readFile(TEST_BACKUP, 'utf-8');
    expect(backupContent).toBe(originalContent);
  });

  it('should not throw if original file does not exist', async () => {
    // Should not throw - just silently skip
    await expect(createBackup('/non/existent/file.json')).resolves.not.toThrow();
  });

  it('should overwrite existing backup', async () => {
    const firstContent = JSON.stringify({ version: 1 });
    const secondContent = JSON.stringify({ version: 2 });
    
    // Create first version and backup
    await fs.writeFile(TEST_FILE, firstContent, 'utf-8');
    await createBackup(TEST_FILE);
    
    // Update file and create new backup
    await fs.writeFile(TEST_FILE, secondContent, 'utf-8');
    await createBackup(TEST_FILE);
    
    const backupContent = await fs.readFile(TEST_BACKUP, 'utf-8');
    expect(JSON.parse(backupContent).version).toBe(2);
  });

  it('should log backup creation', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    await fs.writeFile(TEST_FILE, '{}', 'utf-8');
    await createBackup(TEST_FILE);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Backup created')
    );
    
    consoleSpy.mockRestore();
  });
});

