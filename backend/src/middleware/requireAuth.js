import { verifyToken } from "../auth/jwt.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  try {
    const decoded = verifyToken(m[1]);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireOwner(req, res, next) {
  if (req.user?.role !== "owner") {
    return res.status(403).json({ error: "Admin access required" });
  }
  return next();
}
