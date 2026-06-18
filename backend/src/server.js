import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import applicationRoutes from "./routes/applications.js";
import dsaRoutes from "./routes/dsa.js";
import interviewRoutes from "./routes/interview.js";
import analyticsRoutes from "./routes/analytics.js";

const app = express();

// CORS — allow CLIENT_URL and common localhost dev ports
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
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
