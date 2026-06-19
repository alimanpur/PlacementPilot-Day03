import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import applicationRoutes from "./routes/applications.js";
import dsaRoutes from "./routes/dsa.js";
import interviewRoutes from "./routes/interview.js";
import analyticsRoutes from "./routes/analytics.js";

// ── Startup validation — fail loudly if critical env vars are missing ──
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET", "CLIENT_URL"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error("[FATAL] Missing required environment variables:", missing.join(", "));
  console.error("[FATAL] Set these in Render dashboard → Environment → Environment Variables");
  process.exit(1);
}

console.log("[ENV] DATABASE_URL:", process.env.DATABASE_URL ? "✓ set" : "✗ missing");
console.log("[ENV] JWT_SECRET:", process.env.JWT_SECRET ? "✓ set" : "✗ missing");
console.log("[ENV] CLIENT_URL:", process.env.CLIENT_URL);
console.log("[ENV] NODE_ENV:", process.env.NODE_ENV || "not set (defaults to development)");

const app = express();

// CORS — allow CLIENT_URL and common localhost dev ports
// Strip trailing slash from CLIENT_URL to avoid CORS mismatch
const clientUrl = (process.env.CLIENT_URL || "").replace(/\/+$/, "");
const allowedOrigins = [
  clientUrl,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

console.log("[CORS] Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dsa", dsaRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// Global error handler — catches any unhandled async errors
app.use((err, req, res, _next) => {
  console.error("[SERVER ERROR]", err.message);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[SERVER] Running on port ${PORT}`));
