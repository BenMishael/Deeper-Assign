import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import type { Request, Response, NextFunction } from "express";
import type { PublisherConfig, PublishersResponse, ApiError, ApiSuccess, HealthCheckResponse } from "./types.js";
import { validateFilename, validatePublisherConfig } from "./utils/validation.js";
import { createBackup, readJsonFile, writeJsonFile, fileExists } from "./utils/fileOperations.js";
import { requestLogger } from "./middleware/logger.js";
import { logger, errorMessages } from "./utils/logger.js";
import { FILE_LIMITS } from "./utils/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; // API server on port 3001
const DATA_DIR = path.join(__dirname, "../data");

// Middleware
app.use(express.json({ limit: FILE_LIMITS.MAX_JSON_PAYLOAD })); // Limit JSON payload size
// Note: Static files are served by a separate server on port 3000
app.use(requestLogger);

// CORS middleware to allow requests from client on port 3000
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response<HealthCheckResponse>) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API endpoint to get publishers list
app.get("/api/publishers", async (_req: Request, res: Response<PublishersResponse | ApiError>) => {
  try {
    const dataPath = path.join(DATA_DIR, "publishers.json");
    
    if (!fileExists(dataPath)) {
      return res.status(404).json({ error: errorMessages.notFound("Publishers file") });
    }

    const data = await readJsonFile<PublishersResponse>(dataPath);
    res.json(data);
  } catch (error) {
    logger.error("Failed to read publishers", error);
    res.status(500).json({ 
      error: errorMessages.fileRead("publishers.json"),
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// API endpoint to get a specific publisher config
app.get("/api/publisher/:filename", async (req: Request, res: Response<PublisherConfig | ApiError>) => {
  try {
    const { filename } = req.params;

    // Validate filename
    if (!validateFilename(filename)) {
      return res.status(400).json({ 
        error: errorMessages.validation("filename format")
      });
    }

    const dataPath = path.join(DATA_DIR, filename);

    if (!fileExists(dataPath)) {
      return res.status(404).json({ 
        error: errorMessages.notFound(`Publisher config "${filename}"`)
      });
    }

    const data = await readJsonFile<PublisherConfig>(dataPath);
    res.json(data);
  } catch (error) {
    logger.error(`Failed to read publisher config: ${req.params.filename}`, error);
    
    if (error instanceof Error && error.message.includes("Invalid JSON")) {
      return res.status(500).json({ 
        error: errorMessages.invalidJson(),
        details: error.message
      });
    }

    res.status(500).json({ 
      error: errorMessages.fileRead(req.params.filename),
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// API endpoint to save a publisher config
app.put("/api/publisher/:filename", async (req: Request, res: Response<ApiSuccess | ApiError>) => {
  try {
    const { filename } = req.params;

    // Validate filename
    if (!validateFilename(filename)) {
      return res.status(400).json({ 
        error: errorMessages.validation("filename format")
      });
    }

    // Validate request body
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ 
        error: errorMessages.validation("request body must be a valid JSON object")
      });
    }

    // Check payload size
    const payloadSize = JSON.stringify(req.body).length;
    if (payloadSize > FILE_LIMITS.MAX_CONFIG_SIZE_BYTES) {
      return res.status(413).json({
        error: `Config too large (${Math.round(payloadSize / 1024)}KB). Maximum size is ${Math.round(FILE_LIMITS.MAX_CONFIG_SIZE_BYTES / 1024)}KB`
      });
    }

    // Validate config structure
    const validation = validatePublisherConfig(req.body);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: validation.error || errorMessages.validation("publisher config structure")
      });
    }

    const dataPath = path.join(DATA_DIR, filename);

    // Create backup before saving
    await createBackup(dataPath);

    // Write the file
    await writeJsonFile<PublisherConfig>(dataPath, req.body as PublisherConfig);

    logger.success(`Saved publisher config: ${filename}`);

    res.json({ 
      success: true,
      message: `Publisher config "${filename}" saved successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to save publisher config: ${req.params.filename}`, error);
    
    res.status(500).json({ 
      error: errorMessages.fileWrite(req.params.filename),
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// 404 handler for API routes
app.use("/api/*", (_req: Request, res: Response<ApiError>) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response<ApiError>, _next: NextFunction) => {
  logger.error("Unhandled error", err);
  res.status(500).json({ 
    error: errorMessages.serverError(),
    details: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Export app for testing
export { app, DATA_DIR };

// Only start server if this file is run directly (not imported for tests)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  app.listen(PORT, () => {
    logger.info(`API Server running at http://localhost:${PORT}`);
    logger.info(`Data directory: ${DATA_DIR}`);
    logger.info(`Health check: http://localhost:${PORT}/api/health`);
    logger.info(`Client should connect to: http://localhost:3000`);
  });
}