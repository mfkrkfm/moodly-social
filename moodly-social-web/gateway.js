import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---------------- CORS ----------------
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// -------------- Backend proxy --------------
// Proxy ALL API-like requests to backend
app.use(
  ["/auth", "/profile", "/posts", "/account", "/admin", "/media"],
  createProxyMiddleware({
    target: "http://backend:8080",
    changeOrigin: true,
  }),
);

// -------------- Serve frontend --------------
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// -------------- Start server --------------
const PORT = 8081;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Gateway running on port ${PORT}`),
);
