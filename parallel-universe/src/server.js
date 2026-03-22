import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function startDashboard(port = 3000) {
  const app = express();

  // Serve static web files
  app.use(express.static(path.join(__dirname, "..", "web")));

  // Serve contract artifacts (for frontend to load ABIs)
  app.use("/artifacts", express.static(path.join(__dirname, "..", "artifacts")));

  // API: get deployed addresses
  app.get("/api/addresses", (req, res) => {
    try {
      const addrPath = path.join(__dirname, "addresses.json");
      const addresses = JSON.parse(fs.readFileSync(addrPath, "utf8"));
      res.json(addresses);
    } catch {
      res.json({ error: "Not deployed" });
    }
  });

  const server = app.listen(port, () => {
    console.log(`  Dashboard: http://localhost:${port}`);
  });

  return server;
}

// Run standalone
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  startDashboard();
}
