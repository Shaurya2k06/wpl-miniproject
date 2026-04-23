import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb, getPool } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ordersRoutes from "./routes/orders.routes.js";

const app = express();
const port = Number(process.env.PORT || 4000);

<<<<<<< HEAD
const frontend = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: frontend,
=======
/** Normalize origin for comparison (no trailing slash). */
function normalizeOrigin(url) {
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/\/$/, "");
}

/**
 * Allowed browser origins for CORS. Set on Render/Vercel:
 * - FRONTEND_URL — primary app URL (also used for redirects if you add OAuth later)
 * - CORS_ORIGINS — optional extra comma-separated URLs (e.g. http://localhost:3000)
 */
function allowedOrigins() {
  const primary = normalizeOrigin(
    process.env.FRONTEND_URL || "http://localhost:3000"
  );
  const extras = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);
  return [...new Set([primary, ...extras])];
}

const corsOrigins = allowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      const n = normalizeOrigin(origin);
      if (corsOrigins.includes(n)) {
        return callback(null, true);
      }
      console.warn(`CORS: blocked origin ${origin}`);
      return callback(null, false);
    },
>>>>>>> 2d1249c0e630297287afff797bb7d974d111f1e6
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await getPool().query("SELECT 1");
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message) });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function main() {
  await initDb();
  const server = app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Stop the other process: lsof -nP -iTCP:${port} -sTCP:LISTEN — or set PORT in backend/.env`
      );
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
