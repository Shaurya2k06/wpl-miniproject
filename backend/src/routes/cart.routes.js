import { Router } from "express";
import { getPool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    srcSet: row.src_set,
    size: row.size,
    price: Number(row.price),
    total: row.quantity,
    createdAt: row.created_at.toISOString(),
  };
}

router.use(requireAuth);

router.get("/", async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ error: "Cart is only available for customer accounts" });
  }
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, name, image, src_set, size, price, quantity, created_at
       FROM cart_items WHERE user_id = $1 ORDER BY created_at ASC`,
      [req.user.id]
    );
    return res.json(result.rows.map(mapRow));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load cart" });
  }
});

router.post("/", async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ error: "Cart is only available for customer accounts" });
  }
  try {
    const body = req.body || {};
    const name = body.name;
    const price = Number(body.price);
    const quantity = Math.max(1, Number(body.total ?? body.quantity ?? 1));
    if (!name || Number.isNaN(price)) {
      return res.status(400).json({ error: "name and price are required" });
    }
    const pool = getPool();
    const inserted = await pool.query(
      `INSERT INTO cart_items (user_id, name, image, src_set, size, price, quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, image, src_set, size, price, quantity, created_at`,
      [
        req.user.id,
        name,
        body.image ?? null,
        body.srcSet ?? body.src_set ?? null,
        body.size != null ? String(body.size) : null,
        price,
        quantity,
      ]
    );
    return res.status(201).json(mapRow(inserted.rows[0]));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to add to cart" });
  }
});

router.put("/:id", async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ error: "Cart is only available for customer accounts" });
  }
  try {
    const qty = Number(req.body?.total ?? req.body?.quantity);
    if (Number.isNaN(qty) || qty < 1) {
      return res.status(400).json({ error: "Invalid quantity" });
    }
    const pool = getPool();
    const updated = await pool.query(
      `UPDATE cart_items SET quantity = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, name, image, src_set, size, price, quantity, created_at`,
      [qty, req.params.id, req.user.id]
    );
    if (!updated.rows[0]) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    return res.json(mapRow(updated.rows[0]));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update cart item" });
  }
});

router.delete("/:id", async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ error: "Cart is only available for customer accounts" });
  }
  try {
    const pool = getPool();
    const result = await pool.query(
      `DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to remove cart item" });
  }
});

export default router;
