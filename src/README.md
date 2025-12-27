# Server-Side Implementation

This directory contains the Express.js server implementation for the DeeperDive Publisher Config Tool.

## Structure

```
src/
├── server.ts              # Main Express server entry point
├── types.ts               # TypeScript type definitions
├── utils/
│   ├── validation.ts      # Validation utilities (filename, config structure)
│   └── fileOperations.ts  # File I/O operations (read, write, backup)
└── middleware/
    └── logger.ts          # Request logging middleware
```

## Features

### Security
- **Path Traversal Protection**: Filename validation prevents directory traversal attacks
- **Input Validation**: Request body validation ensures data integrity
- **JSON Payload Limits**: 10MB limit on request body size

### Validation
- **Publisher Config Schema**: Validates required fields (publisherId, aliasName, isActive)
- **Pages Array Validation**: Ensures page configurations are properly structured
- **Filename Sanitization**: Only allows safe filename patterns

### Reliability
- **Automatic Backups**: Creates `.backup` files before overwriting
- **Error Handling**: Comprehensive error handling with detailed messages
- **File Existence Checks**: Validates files exist before operations

### Developer Experience
- **Request Logging**: Logs all API requests with timestamps
- **Type Safety**: Full TypeScript type definitions
- **Health Check**: `/api/health` endpoint for monitoring

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
- `500`: Internal Server Error

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (`development` or `production`)

## Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## Backup Files

The server automatically creates `.backup` files before saving changes. These are stored in the `data/` directory and are excluded from git via `.gitignore`.

## Type Safety

All endpoints use TypeScript types from `types.ts`:
- `PublisherConfig`: Publisher configuration structure
- `PublishersResponse`: Publishers list response
- `ApiError`: Error response format
- `ApiSuccess`: Success response format
- `HealthCheckResponse`: Health check response format

