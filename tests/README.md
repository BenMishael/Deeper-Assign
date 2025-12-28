# 🧪 Test Suite Documentation

This document describes the test suite for the DeeperDive Publisher Config Tool.

## Overview

The test suite includes:
- **Unit Tests**: Test individual functions and utilities in isolation
- **Integration Tests**: Test API route handlers and their interactions

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── fixtures/              # Test data files
│   ├── test-publishers.json
│   └── test-publisher-alpha.json
├── integration/           # Integration tests
│   └── api.test.ts       # API route handler tests
├── unit/                  # Unit tests
│   ├── validation.test.ts    # Validation utilities tests
│   └── fileOperations.test.ts # File operations tests
├── setup.ts              # Global test configuration
└── README.md             # This file
```

## Test Categories

### 1. Unit Tests - Validation (`tests/unit/validation.test.ts`)

Tests for `src/utils/validation.ts`:

| Test Category | Tests |
|---------------|-------|
| `validateFilename` - Valid Filenames | 5 tests |
| `validateFilename` - Invalid Filenames | 9 tests |
| `validatePublisherConfig` - Valid Configs | 5 tests |
| `validatePublisherConfig` - Missing Required Fields | 8 tests |
| `validatePublisherConfig` - Invalid Field Types | 4 tests |
| `validatePublisherConfig` - Invalid Page Configs | 4 tests |
| `sanitizeFilename` | 6 tests |

**Total: 41 tests**

Key test scenarios:
- Path traversal attack prevention (`../`, `./`, etc.)
- JSON extension validation
- Special character handling
- Required field validation (`publisherId`, `aliasName`, `isActive`)
- Nested array validation (pages)

### 2. Unit Tests - File Operations (`tests/unit/fileOperations.test.ts`)

Tests for `src/utils/fileOperations.ts`:

| Test Category | Tests |
|---------------|-------|
| `fileExists` | 3 tests |
| `readJsonFile` | 6 tests |
| `writeJsonFile` | 5 tests |
| `createBackup` | 5 tests |

**Total: 19 tests**

Key test scenarios:
- Reading valid/invalid JSON files
- Writing JSON with proper formatting
- Backup creation before file modifications
- Error handling for non-existent files

### 3. Integration Tests - API Routes (`tests/integration/api.test.ts`)

Tests for API route handler logic:

| Test Category | Tests |
|---------------|-------|
| `GET /api/health` | 2 tests |
| `GET /api/publishers` | 4 tests |
| `GET /api/publisher/:filename` | 6 tests |
| `PUT /api/publisher/:filename` | 16 tests |
| Filename Validation Edge Cases | 4 tests |

**Total: 32 tests**

Key test scenarios:
- Health check endpoint
- Publishers list retrieval
- Individual publisher config retrieval
- Config saving with validation
- Input validation and error responses
- Security validation (path traversal, invalid filenames)

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    pool: 'threads',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
    },
    testTimeout: 10000,
  },
});
```

### Test Setup (`tests/setup.ts`)

- Suppresses console output during tests for cleaner output
- Configures global mocks

## Coverage

Run `npm run test:coverage` to generate coverage reports:
- **Console**: Summary in terminal
- **HTML**: Detailed report in `coverage/index.html`
- **JSON**: Machine-readable in `coverage/coverage.json`

Coverage includes:
- `src/utils/validation.ts`
- `src/utils/fileOperations.ts`
- `src/types.ts`

## Writing New Tests

### Adding Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../../src/utils/myModule.js';

describe('myFunction', () => {
  it('should handle normal case', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('should handle edge case', () => {
    expect(myFunction('')).toBeNull();
  });
});
```

### Adding Integration Tests

```typescript
import { describe, it, expect } from 'vitest';
import { handleMyRoute } from './helpers';

describe('GET /api/myroute', () => {
  it('should return 200 for valid request', async () => {
    const response = await handleMyRoute(TEST_DATA_DIR, 'param');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('key');
  });
});
```

## CI/CD Integration

Tests can be run in CI pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm run test

- name: Run Coverage
  run: npm run test:coverage
```

## Troubleshooting

### Tests timing out
Increase `testTimeout` in `vitest.config.ts`

### Console output during tests
Remove or comment out the console mocks in `tests/setup.ts`

### Fixtures not found
Ensure fixtures are in `tests/fixtures/` and paths are correct

