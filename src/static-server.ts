/**
 * Static file server for client-side application
 * Runs on port 3000 to serve the frontend
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "../public");

// Serve static files
app.use(express.static(PUBLIC_DIR));

// Fallback to index.html for client-side routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🌐 Client server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${PUBLIC_DIR}`);
});

