# Server-Side Implementation

This directory contains the Express.js server implementation for the DeeperDive Publisher Config Tool.

## Structure

```
src/
├── server.ts              # Express API server (port 3001)
├── static-server.ts       # Static file server (port 3000)
├── types.ts               # TypeScript type definitions
├── utils/
│   ├── validation.ts      # Validation utilities (filename, config structure)
│   ├── fileOperations.ts  # File I/O operations (read, write, backup)
│   ├── constants.ts       # Server-side constants (file limits, patterns)
│   └── logger.ts          # Structured logging utility
└── middleware/
    └── logger.ts          # Request logging middleware
```

## Features

### Security
- **Path Traversal Protection**: Filename validation prevents directory traversal attacks
- **Input Validation**: Request body validation ensures data integrity
- **JSON Payload Limits**: 10MB limit on request body size
- **File Size Validation**: 1MB limit on individual config files to prevent DoS

### Validation
- **Publisher Config Schema**: Validates required fields (publisherId, aliasName, isActive)
- **Pages Array Validation**: Ensures page configurations are properly structured
- **Filename Sanitization**: Only allows safe filename patterns

### Reliability
- **Automatic Backups**: Creates `.backup` files before overwriting
- **Error Handling**: Comprehensive error handling with detailed messages
- **File Existence Checks**: Validates files exist before operations

### Developer Experience
- **Structured Logging**: Environment-aware logging utility (debug logs only in development)
- **Request Logging**: Logs all API requests with timestamps and status codes
- **Type Safety**: Full TypeScript type definitions
- **Health Check**: `/api/health` endpoint for monitoring
- **Standardized Errors**: Consistent error message formatting across all endpoints

## API Endpoints

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

### `GET /api/publishers`
Get list of all publishers.

**Response:**
```json
{
  "publishers": [
    {
      "id": "pub-aurora",
      "alias": "Aurora Media",
      "file": "publisher-aurora.json"
    }
  ]
}
```

### `GET /api/publisher/:filename`
Get a specific publisher configuration.

**Parameters:**
- `filename`: Publisher config filename (e.g., `publisher-aurora.json`)

**Response:**
```json
{
  "publisherId": "pub-aurora",
  "aliasName": "Aurora Media",
  "isActive": true,
  "pages": [...]
}
```

### `PUT /api/publisher/:filename`
Save a publisher configuration.

**Parameters:**
- `filename`: Publisher config filename (e.g., `publisher-aurora.json`)

**Request Body:**
```json
{
  "publisherId": "pub-aurora",
  "aliasName": "Aurora Media",
  "isActive": true,
  "pages": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Publisher config \"publisher-aurora.json\" saved successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Additional error details (only in development)"
}
```

**HTTP Status Codes:**
- `400`: Bad Request (validation errors)
- `404`: Not Found (file doesn't exist)
- `413`: Payload Too Large (config exceeds 1MB limit)
- `500`: Internal Server Error

## Environment Variables

- `PORT`: API server port (default: 3001)
- `NODE_ENV`: Environment mode (`development` or `production`)

## Port Configuration

The server setup uses two separate servers:
- **API Server** (`server.ts`): Runs on port `3001` - Handles all API requests
- **Static Server** (`static-server.ts`): Runs on port `3000` - Serves frontend files

In development, both servers run concurrently via `npm run dev`.

## Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## Backup Files

The server automatically creates `.backup` files before saving changes. These are stored in the `data/` directory and are excluded from git via `.gitignore`.

## Utilities

### `utils/logger.ts`
Structured logging utility with environment-aware behavior:
- `logger.debug()` - Only logs in development
- `logger.info()` - Standard info logs
- `logger.warn()` - Warning logs
- `logger.error()` - Error logs with stack traces (dev only)
- `logger.success()` - Success messages

### `utils/constants.ts`
Centralized server-side constants:
- `FILE_LIMITS` - File size limits and payload sizes
- `VALIDATION_PATTERNS` - Regex patterns for validation

### `utils/validation.ts`
Validation utilities:
- `validateFilename()` - Prevents path traversal attacks
- `validatePublisherConfig()` - Validates config structure
- `sanitizeFilename()` - Sanitizes unsafe filenames

### `utils/fileOperations.ts`
File I/O operations:
- `readJsonFile()` - Safe JSON file reading
- `writeJsonFile()` - Formatted JSON file writing
- `createBackup()` - Automatic backup creation
- `fileExists()` - File existence check

## Type Safety

All endpoints use TypeScript types from `types.ts`:
- `PublisherConfig`: Publisher configuration structure
- `PublishersResponse`: Publishers list response
- `ApiError`: Error response format
- `ApiSuccess`: Success response format
- `HealthCheckResponse`: Health check response format

## Testing

You can test the server endpoints using curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Get publishers
curl http://localhost:3001/api/publishers

# Get specific publisher
curl http://localhost:3001/api/publisher/publisher-aurora.json

# Save publisher (example)
curl -X PUT http://localhost:3001/api/publisher/publisher-aurora.json \
  -H "Content-Type: application/json" \
  -d @data/publisher-aurora.json
```

## Future Enhancements

Optional features that could be added:
- **Rate Limiting**: Prevent API abuse
- **Authentication**: Add user authentication
- **Versioning**: Track config file versions
- **Audit Log**: Log all configuration changes
- **CORS Configuration**: Fine-tune cross-origin settings
- **Compression**: Add gzip compression for responses
- **HTTPS Support**: For production deployment

