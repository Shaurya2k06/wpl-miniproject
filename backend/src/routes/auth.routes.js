import { Router } from "express";
import bcrypt from "bcryptjs";
import { getPool } from "../db.js";
import { signToken } from "../auth/jwt.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function ownerEmails() {
  return (process.env.OWNER_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function issueUserToken(user) {
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, role: requestedRole } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    let role = requestedRole === "owner" ? "owner" : "user";
    if (role === "owner") {
      const allowed = ownerEmails();
      if (!allowed.length || !allowed.includes(String(email).toLowerCase())) {
        role = "user";
      }
    }
    const hash = await bcrypt.hash(password, 10);
    const pool = getPool();
    const inserted = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)
       RETURNING id, email, role`,
      [email, hash, role]
    );
    return res.json(issueUserToken(inserted.rows[0]));
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error(e);
    return res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, email, password_hash, role FROM users WHERE lower(email) = lower($1)`,
      [email]
    );
    const user = result.rows[0];
    if (!user?.password_hash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({ error: "Role does not match this account" });
    }
    return res.json(
      issueUserToken({ id: user.id, email: user.email, role: user.role })
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, email, role FROM users WHERE id = $1`,
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load profile" });
  }
});

export default router;
