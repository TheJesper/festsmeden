const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Helpers — store shared and private in separate folders
function filePath(key, shared) {
  const dir = shared ? path.join(DATA_DIR, "shared") : path.join(DATA_DIR, "private");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  // sanitize key for filesystem
  const safe = key.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
  return path.join(dir, safe + ".json");
}

// GET /api/storage?key=...&shared=true|false
app.get("/api/storage", (req, res) => {
  const { key, shared } = req.query;
  if (!key) return res.status(400).json({ error: "key required" });
  const isShared = shared !== "false";
  const fp = filePath(key, isShared);
  if (!fs.existsSync(fp)) return res.json(null);
  try {
    const raw = fs.readFileSync(fp, "utf8");
    res.json({ key, value: raw, shared: isShared });
  } catch (e) {
    res.json(null);
  }
});

// POST /api/storage { key, value, shared }
app.post("/api/storage", (req, res) => {
  const { key, value, shared } = req.body;
  if (!key) return res.status(400).json({ error: "key required" });
  const isShared = shared !== false;
  const fp = filePath(key, isShared);
  try {
    fs.writeFileSync(fp, value, "utf8");
    res.json({ key, value, shared: isShared });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/storage?key=...&shared=true|false
app.delete("/api/storage", (req, res) => {
  const { key, shared } = req.query;
  if (!key) return res.status(400).json({ error: "key required" });
  const isShared = shared !== "false";
  const fp = filePath(key, isShared);
  try {
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    res.json({ key, deleted: true, shared: isShared });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// LIST /api/storage/list?prefix=...&shared=true|false
app.get("/api/storage/list", (req, res) => {
  const { prefix, shared } = req.query;
  const isShared = shared !== "false";
  const dir = isShared ? path.join(DATA_DIR, "shared") : path.join(DATA_DIR, "private");
  if (!fs.existsSync(dir)) return res.json({ keys: [], shared: isShared });
  try {
    let files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    let keys = files.map((f) => f.replace(".json", "").replace(/_/g, "-"));
    // Re-read actual keys from files for accuracy
    keys = files.map((f) => {
      // We stored with sanitized names, read actual key from content isn't possible
      // so we approximate — the key is the filename minus .json, with _ back to original
      return f.replace(".json", "");
    });
    if (prefix) {
      const safePrefix = prefix.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      keys = keys.filter((k) => k.startsWith(safePrefix));
    }
    res.json({ keys, prefix: prefix || null, shared: isShared });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚢 FestSmeden server running on http://localhost:${PORT}`);
});
