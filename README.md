# DeeperDive Publisher Config Tool

A modern, web-based configuration management tool designed to help support engineers safely view and edit publisher configurations without worrying about JSON syntax errors. Built with TypeScript, Express.js, and a focus on user experience.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)
![Express](https://img.shields.io/badge/Express-4.18-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🎨 Screenshots

| | | |
|---|---|---|
| [<img src="media/Screenshot_1.png" width="250"/>](media/Screenshot_1.png) | [<img src="media/Screenshot_2.png" width="250"/>](media/Screenshot_2.png) | [<img src="media/Screenshot_3.png" width="250"/>](media/Screenshot_3.png) |
| [<img src="media/Screenshot_4.png" width="250"/>](media/Screenshot_4.png) | [<img src="media/Screenshot_5.png" width="250"/>](media/Screenshot_5.png) | [<img src="media/Screenshot_6.png" width="250"/>](media/Screenshot_6.png) |

## 🎬 Video
Check out the demo video to see **DeeperDive Publisher Config Tool** in action:

https://github.com/user-attachments/assets/9c414ae3-4f94-4c7f-a3bd-10a1f288b779


## 🎯 Overview

**DeeperDive Publisher Config Tool** is a visual configuration editor that transforms complex JSON editing into an intuitive, form-based interface. It eliminates common JSON syntax errors and provides real-time validation, making configuration management safe and efficient for technical users.

### The Problem It Solves

Support engineers frequently need to edit publisher configurations but struggle with:
- Finding the right configuration files
- Avoiding JSON syntax mistakes (commas, brackets, quotes)
- Understanding nested structures and arrays
- Keeping track of changes

This tool provides a **safe, visual, and intuitive** solution that protects users from common mistakes while maintaining the flexibility of JSON editing.

## ✨ Features

### Core Functionality
- **📋 Publisher Browser**: Searchable sidebar with all available publishers
- **✏️ Visual Form Editor**: Dynamic form generation based on configuration structure
- **👁️ Real-time Preview**: Live JSON preview with syntax highlighting
- **💾 Safe Saving**: Automatic validation and backup creation before saving
- **🔄 Change Tracking**: Visual indicators for unsaved changes
- **📤 Export**: Download configurations as formatted JSON

### Advanced Features
- **🎨 Dynamic Field Support**: Automatically detects and renders unknown fields
- **✅ Input Validation**: Real-time validation with error highlighting
- **🎭 Smooth Animations**: Professional UI animations (disabled during editing)
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔍 Search & Filter**: Quickly find publishers by name or ID
- **⚡ Performance Optimized**: Efficient rendering without unnecessary re-renders

### Developer Features
- **🔒 Type Safety**: Full TypeScript coverage
- **🛡️ Security**: Path traversal protection, input validation, sanitization, file size limits
- **📝 Request Logging**: Comprehensive server-side logging with environment-aware behavior
- **💾 Automatic Backups**: Backup files created before each save
- **🏥 Health Check**: Server health monitoring endpoint
- **⚡ Performance Optimized**: Efficient deep equality (3-6x faster, up to 280x+ for large objects), optimized cloning (3.5-4.5x faster), circular reference safe
- **🔄 Immutable State**: Immutable array operations for reliable state management
- **⏱️ Request Timeouts**: Automatic timeout handling for API requests

## 🛠️ Tech Stack

### Frontend
- **TypeScript** - Type-safe client-side code
- **Vanilla HTML/CSS** - No framework dependencies
- **Custom State Management** - Reactive store with subscriptions
- **DOM Utilities** - Lightweight DOM manipulation helpers

### Backend
- **Express.js** - RESTful API server
- **TypeScript** - Type-safe server code
- **File System Operations** - Safe JSON file handling

### Development Tools
- **Vitest** - Fast unit and integration testing framework
- **Supertest** - HTTP assertion library for API testing
- **Chrome DevTools MCP** - Browser automation and debugging during development
- **ESLint** - Code quality and consistency
- **tsx** - TypeScript execution for development

## 📁 Project Structure

```
Deeper-Assign/
├── public/                 # Frontend application
│   ├── css/
│   │   └── styles.css     # Main stylesheet
│   ├── images/
│   │   └── logo.svg       # Application logo
│   ├── ts/                # TypeScript source
│   │   ├── api.ts         # API client
│   │   ├── state.ts       # State management
│   │   ├── main.ts        # Application entry point
│   │   ├── types.ts       # Type definitions
│   │   ├── components/
│   │   │   └── editor.ts  # Dynamic form editor
│   │   └── utils/
│   │       ├── dom.ts     # DOM utilities
│   │       ├── equality.ts # Deep equality and cloning utilities
│   │       └── constants.ts # Application constants
│   ├── js/                # Compiled JavaScript (generated)
│   └── index.html         # Main HTML file
│
├── src/                   # Backend server
│   ├── server.ts          # Express API server (port 3001)
│   ├── static-server.ts   # Static file server (port 3000)
│   ├── types.ts           # Server types
│   ├── README.md          # Server-side documentation
│   ├── utils/
│   │   ├── validation.ts  # Validation utilities
│   │   ├── fileOperations.ts # File I/O utilities
│   │   ├── constants.ts   # Server constants
│   │   └── logger.ts      # Structured logging utility
│   └── middleware/
│       └── logger.ts      # Request logging middleware
│
├── tests/                 # Test suite
│   ├── unit/              # Unit tests
│   │   ├── equality.test.ts
│   │   ├── validation.test.ts
│   │   └── fileOperations.test.ts
│   ├── integration/       # Integration tests
│   │   └── api.test.ts
│   ├── benchmark/         # Performance benchmarks
│   │   └── performance.bench.ts
│   ├── fixtures/          # Test data fixtures
│   │   ├── test-publishers.json
│   │   └── test-publisher-alpha.json
│   ├── setup.ts           # Test setup configuration
│   └── README.md          # Test documentation
│
├── data/                  # Configuration files
│   ├── publishers.json    # Publisher registry
│   ├── publisher-*.json   # Individual publisher configs
│   └── *.backup           # Automatic backup files
│
├── dist/                  # Compiled output (generated)
│   ├── public/            # Compiled client code
│   └── src/               # Compiled server code
│
├── coverage/              # Test coverage reports (generated)
│
├── media/                 # Media assets (images, videos)
│   └── Screenshot_*.png   # Application screenshots
│
├── tsconfig.json          # TypeScript config (server)
├── tsconfig.client.json   # TypeScript config (client)
├── vitest.config.ts       # Vitest test configuration
├── package.json           # Dependencies and scripts
├── package-lock.json      # Dependency lock file
├── README.md              # This file
└── TASK.md                # Original project requirements
```

## 🏗️ High-Level Design (HLD)

### System Architecture Overview

The DeeperDive Publisher Config Tool follows a **client-server architecture** with separation of concerns between frontend presentation and backend API services.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Frontend Application (Port 3000)                         │ │
│  │  ├── Static Files (HTML/CSS/JS)                           │ │
│  │  ├── State Management (Reactive Store)                     │ │
│  │  ├── UI Components (Dynamic Form Editor)                   │ │
│  │  └── API Client (HTTP Client)                             │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            │ HTTP Requests
                            │ (CORS enabled)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express API Server (Port 3001)               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  API Layer                                                 │ │
│  │  ├── Request Logging Middleware                           │ │
│  │  ├── CORS Middleware                                       │ │
│  │  ├── JSON Body Parser (10MB limit)                        │ │
│  │  └── Route Handlers                                       │ │
│  │      ├── GET /api/health                                  │ │
│  │      ├── GET /api/publishers                              │ │
│  │      ├── GET /api/publisher/:filename                     │ │
│  │      └── PUT /api/publisher/:filename                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Business Logic Layer                                     │ │
│  │  ├── Validation Utilities                                 │ │
│  │  │   ├── Filename Validation (Path Traversal Protection) │ │
│  │  │   └── Config Schema Validation                         │ │
│  │  ├── File Operations                                      │ │
│  │  │   ├── Read JSON Files                                  │ │
│  │  │   ├── Write JSON Files                                 │ │
│  │  │   └── Create Backups                                   │ │
│  │  └── Structured Logging                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            │ File System I/O
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Directory (/data)                      │
│  ├── publishers.json (Registry)                                  │
│  ├── publisher-*.json (Individual Configs)                      │
│  └── *.backup (Automatic Backups)                               │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### **Frontend Components** (Port 3000)

1. **Static File Server** (`src/static-server.ts`)
   - Serves HTML, CSS, JavaScript, and assets
   - Handles client-side routing fallback
   - Port: `3000`

2. **Main Application** (`public/ts/main.ts`)
   - Application bootstrap and initialization
   - Event handling and UI orchestration
   - Publisher selection and navigation

3. **State Management** (`public/ts/state.ts`)
   - Reactive store with subscription pattern
   - Immutable state updates
   - Change tracking (unsaved changes detection)

4. **API Client** (`public/ts/api.ts`)
   - HTTP communication layer
   - Request timeout handling (10 seconds)
   - Error handling and response parsing
   - Connects to API server on port `3001`

5. **Dynamic Form Editor** (`public/ts/components/editor.ts`)
   - Generates form fields based on config structure
   - Handles nested objects and arrays
   - Real-time validation

6. **Utilities**
   - `dom.ts`: DOM manipulation helpers
   - `equality.ts`: Deep equality and cloning (performance optimized)
   - `constants.ts`: Client-side constants

#### **Backend Components** (Port 3001)

1. **API Server** (`src/server.ts`)
   - Express.js RESTful API
   - Port: `3001`
   - Handles all API requests

2. **Middleware**
   - `requestLogger`: Logs all requests with timestamps and status codes
   - CORS: Allows requests from `http://localhost:3000`
   - JSON Parser: Limits payload size to 10MB

3. **Validation Layer** (`src/utils/validation.ts`)
   - Filename validation (prevents path traversal)
   - Publisher config schema validation
   - Input sanitization

4. **File Operations** (`src/utils/fileOperations.ts`)
   - Safe JSON file reading/writing
   - Automatic backup creation
   - File existence checks

5. **Logging** (`src/utils/logger.ts`)
   - Structured logging with environment awareness
   - Debug logs only in development

### Request/Response Lifecycle

#### **1. Application Initialization Flow**

```
Browser Loads → Static Server (3000) → index.html
                                      ↓
                              Load JavaScript Bundles
                                      ↓
                              Initialize Application
                                      ↓
                              GET /api/publishers
                                      ↓
                              API Server (3001)
                                      ↓
                              Read publishers.json
                                      ↓
                              Return Publishers List
                                      ↓
                              Render Publisher Sidebar
```

#### **2. Publisher Selection Flow**

```
User Clicks Publisher → Event Handler (main.ts)
                              ↓
                    Check for Duplicate Requests
                    (Debounce + Request Guard)
                              ↓
                    Update State (Loading)
                              ↓
                    GET /api/publisher/:filename
                              ↓
                    API Server (3001)
                              ↓
                    Validate Filename
                              ↓
                    Read publisher-*.json
                              ↓
                    Return Publisher Config
                              ↓
                    Update State (Config Loaded)
                              ↓
                    Render Dynamic Form Editor
                              ↓
                    Update JSON Preview
```

#### **3. Save Configuration Flow**

```
User Clicks Save → Validate Form Data
                        ↓
                  Check for Unsaved Changes
                        ↓
                  Update State (Saving)
                        ↓
                  PUT /api/publisher/:filename
                        ↓
                  API Server (3001)
                        ↓
                  Validate Filename
                        ↓
                  Validate Config Schema
                        ↓
                  Create Backup (.backup file)
                        ↓
                  Write Updated Config
                        ↓
                  Return Success Response
                        ↓
                  Update State (Save Success)
                        ↓
                  Show Success Toast
                        ↓
                  Clear Unsaved Changes Flag
```

### Networking Details

#### **Ports and Services**

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Static File Server | `3000` | HTTP | Serves frontend application (HTML, CSS, JS) |
| API Server | `3001` | HTTP | Handles all API requests (RESTful endpoints) |

#### **API Routes**

**Base URL**: `http://localhost:3001/api` (development)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/health` | Health check | None | `{ status, timestamp, uptime }` |
| `GET` | `/api/publishers` | Get all publishers | None | `{ publishers: [...] }` |
| `GET` | `/api/publisher/:filename` | Get publisher config | None | `PublisherConfig` |
| `PUT` | `/api/publisher/:filename` | Save publisher config | `PublisherConfig` | `{ success, message, timestamp }` |
| `OPTIONS` | `*` | CORS preflight | None | `200 OK` |

#### **CORS Configuration**

- **Allowed Origin**: `http://localhost:3000`
- **Allowed Methods**: `GET`, `PUT`, `OPTIONS`
- **Allowed Headers**: `Content-Type`
- **Preflight**: Automatically handled for all routes

#### **Request/Response Format**

**Request Headers:**
```
Content-Type: application/json
Origin: http://localhost:3000
```

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Additional details (development only)"
}
```

**HTTP Status Codes:**
- `200`: Success
- `304`: Not Modified (cached)
- `400`: Bad Request (validation error)
- `404`: Not Found
- `413`: Payload Too Large (>10MB)
- `500`: Internal Server Error

### Data Flow Examples

#### **Example 1: Loading Publisher List**

```
┌─────────┐     GET /api/publishers      ┌──────────┐
│ Browser │ ────────────────────────────> │   API    │
│  :3000  │                               │  :3001   │
└─────────┘                               └──────────┘
                                                 │
                                                 │ Read File
                                                 ▼
                                            ┌──────────┐
                                            │  data/   │
                                            │publishers│
                                            │  .json   │
                                            └──────────┘
                                                 │
                                                 │ Return JSON
┌─────────┐     { publishers: [...] }      ┌──────────┐
│ Browser │ <────────────────────────────── │   API    │
│  :3000  │                               │  :3001   │
└─────────┘                               └──────────┘
     │
     │ Render Sidebar
     ▼
┌─────────┐
│   UI    │
└─────────┘
```

#### **Example 2: Saving Configuration**

```
┌─────────┐     PUT /api/publisher/       ┌──────────┐
│ Browser │     publisher-aurora.json     │   API    │
│  :3000  │ ────────────────────────────> │  :3001   │
└─────────┘     { config data... }        └──────────┘
                                                 │
                                                 │ Validate
                                                 ▼
                                            ┌──────────┐
                                            │Validate & │
                                            │Sanitize  │
                                            └──────────┘
                                                 │
                                                 │ Create Backup
                                                 ▼
                                            ┌──────────┐
                                            │ publisher │
                                            │-aurora.json│
                                            │  .backup  │
                                            └──────────┘
                                                 │
                                                 │ Write File
                                                 ▼
                                            ┌──────────┐
                                            │ publisher│
                                            │-aurora.json│
                                            └──────────┘
                                                 │
                                                 │ Success
┌─────────┐     { success: true }          ┌──────────┐
│ Browser │ <────────────────────────────── │   API    │
│  :3000  │                               │  :3001   │
└─────────┘                               └──────────┘
     │
     │ Show Toast
     ▼
┌─────────┐
│   UI    │
└─────────┘
```

### Security Features

1. **Path Traversal Protection**: Filename validation prevents `../` attacks
2. **Payload Size Limits**: 10MB limit on request body, 1MB on config files
3. **CORS Restrictions**: Only allows requests from `localhost:3000`
4. **Input Validation**: All inputs validated before processing
5. **Automatic Backups**: Files backed up before modification
6. **Request Timeouts**: Client-side 10-second timeout prevents hanging requests

### Performance Optimizations

1. **Deep Equality**: Custom implementation (3-6x faster than JSON.stringify)
2. **Immutable Operations**: Prevents accidental mutations
3. **Request Deduplication**: Prevents duplicate API calls
4. **Debouncing**: 300ms debounce on publisher selection
5. **Efficient Cloning**: Optimized deep clone utility (3.5-4.5x faster)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BenMishael/Deeper-Assign/
   cd Deeper-Assign
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the client-side code**
   ```bash
   npm run build:client
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```
   This starts both:
   - **API Server** on `http://localhost:3001` (handles API requests)
   - **Client Server** on `http://localhost:3000` (serves the frontend)

5. **Open your browser**
   ```
   http://localhost:3000
   ```
   
   > **Note**: The client automatically connects to the API server on port 3001.

### Production Build

```bash
# Build everything
npm run build

# Start production server
npm start
```

## 📖 Usage Guide

### Basic Workflow

1. **Browse Publishers**: Use the sidebar to view all available publishers. Use the search bar to filter by name or ID.

2. **Select a Publisher**: Click on any publisher to load its configuration.

3. **Edit Configuration**: 
   - Modify fields using the form editor
   - Required fields are marked with an asterisk (*)
   - Changes are tracked in real-time
   - JSON preview updates automatically

4. **Save Changes**: 
   - Click "Save Configuration" to persist changes
   - The server automatically creates a backup before saving
   - Success/error notifications appear at the bottom

5. **Export JSON**: Click "Export JSON" to download the current configuration.

### Field Types

The editor supports various field types:
- **Text Input**: Single-line text fields
- **URL Input**: Validated URL fields
- **Textarea**: Multi-line text (for CSS, notes, etc.)
- **Toggle Switch**: Boolean values (Active/Inactive)
- **String Arrays**: Lists of strings (tags, domains)
- **Object Arrays**: Complex nested objects (page configurations)
- **Read-only Fields**: Display-only fields (Publisher ID, Last Updated)

### Dynamic Fields

The tool automatically detects and renders fields that aren't in the predefined schema. These appear in the "Optional Settings" section with inferred types and labels.

## 🔌 API Documentation

### Endpoints

#### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

#### `GET /api/publishers`
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

#### `GET /api/publisher/:filename`
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

#### `PUT /api/publisher/:filename`
Save a publisher configuration.

**Parameters:**
- `filename`: Publisher config filename

**Request Body:** Publisher configuration object

**Response:**
```json
{
  "success": true,
  "message": "Publisher config saved successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Additional details (development only)"
}
```

**HTTP Status Codes:**
- `400`: Bad Request (validation errors)
- `404`: Not Found (file doesn't exist)
- `413`: Payload Too Large (request body exceeds 10MB limit)
- `500`: Internal Server Error


## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests**: 98 tests covering validation (41), file operations (19), and equality utilities (38) including Date, NaN, and circular reference handling
- **Integration Tests**: 32 tests covering API route handlers
- **Total**: 130 tests, all passing ✅

Run tests with:
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

**Performance Benchmarks**: To verify performance metrics, run:
```bash
npx tsx tests/benchmark/performance.bench.ts
```

### Development Workflow

During development, **Chrome DevTools MCP** was used extensively for:
- Browser automation and testing
- Real-time UI debugging
- Visual regression testing
- Performance monitoring
- Cross-browser compatibility checks

This tool enabled rapid iteration and ensured consistent behavior across different scenarios.

### Available Scripts

```bash
# Development
npm run dev          # Start both API (3001) and client (3000) servers with auto-reload
npm run dev:server   # Start only API server on port 3001
npm run dev:client   # Start only client server on port 3000
npm run build:client # Build client-side TypeScript
npm run build        # Build all TypeScript

# Code Quality
npm run lint         # Run ESLint

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Production
npm start            # Start both servers in production mode
npm run start:server # Start only API server
npm run start:client # Start only client server
```

### Port Configuration

- **Client Server**: Port `3000` - Serves the frontend application
- **API Server**: Port `3001` - Handles all API requests

The client automatically connects to the API server on port 3001 in development mode.

### Code Organization

- **Client-side**: Located in `public/ts/`
  - Modular architecture with clear separation of concerns
  - Reactive state management
  - Component-based UI rendering

- **Server-side**: Located in `src/`
  - RESTful API design
  - Utility functions for validation and file operations
  - Middleware for logging and error handling

### TypeScript Configuration

- **Client**: `tsconfig.client.json` - ES2020 target, DOM libs
- **Server**: `tsconfig.json` - ES2020 target, Node.js libs

## 🔒 Security Features

- **Path Traversal Protection**: Filename validation prevents directory traversal attacks
- **Input Validation**: All request bodies are validated before processing
- **JSON Sanitization**: Safe parsing with error handling
- **Payload Limits**: 10MB limit on request body size, 1MB limit on config files
- **Automatic Backups**: Files are backed up before modification
- **Request Timeouts**: API requests timeout after 10 seconds to prevent hanging

## ⚡ Performance Features

- **Optimized State Comparison**: Custom deep equality function (3-6x faster than JSON.stringify, handles circular references, scales better with larger objects)
- **Efficient Cloning**: Lightweight deep clone utility (3.5-4.5x faster than structuredClone, handles circular references)
- **Immutable Operations**: All array operations use immutable patterns for reliability
- **Smart Re-rendering**: Only updates changed UI elements, not entire forms

## 📝 Configuration Files

Publisher configurations are stored in the `data/` directory:

- `publishers.json` - Registry of all publishers
- `publisher-*.json` - Individual publisher configurations
- `*.backup` - Automatic backup files (excluded from git)

## 🤝 Contributing

This project follows best practices for:
- TypeScript type safety
- Code organization and modularity
- Error handling and validation
- User experience design

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with TypeScript for type safety
- Express.js for the RESTful API
- Vitest and Supertest for comprehensive testing
- Chrome DevTools MCP for development and debugging
- Modern CSS for responsive design

## 📞 Support

For questions or issues, please refer to the documentation in:
- `src/README.md` - Server-side documentation
- `tests/README.md` - Test suite documentation
- `TASK.md` - Original project requirements

---

## 📊 Performance Metrics

- **Deep Equality**: 3-6x faster than JSON.stringify (performance scales with object size, up to 280x+ for large objects)
- **State Cloning**: 3.5-4.5x faster than structuredClone (with circular reference detection)
- **Test Coverage**: 130 tests covering all critical paths including edge cases
- **Build Time**: ~2 seconds for full TypeScript compilation

*Performance measured on typical publisher config objects (3-50 pages). Larger objects show even greater performance gains.*

---

**Built with ❤️ using TypeScript and modern web technologies**

