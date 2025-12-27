import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Parse JSON bodies
app.use(express.json());

// API endpoint to get publishers list
app.get("/api/publishers", async (_req, res) => {
  try {
    const dataPath = path.join(__dirname, "../data/publishers.json");
    const data = await fs.readFile(dataPath, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: "Failed to read publishers data" });
  }
});

// API endpoint to get a specific publisher config
app.get("/api/publisher/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const dataPath = path.join(__dirname, "../data", filename);
    const data = await fs.readFile(dataPath, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(404).json({ error: "Publisher config not found" });
  }
});

// API endpoint to save a publisher config
app.put("/api/publisher/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const dataPath = path.join(__dirname, "../data", filename);
    await fs.writeFile(dataPath, JSON.stringify(req.body, null, 2), "utf-8");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save publisher config" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

