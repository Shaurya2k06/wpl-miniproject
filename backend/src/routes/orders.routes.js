import { Router } from "express";
import { getPool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

function mapOrderRow(row, items) {
  return {
    id: row.id,
    status: row.status,
    totalAmount: Number(row.total_amount),
    createdAt: row.created_at.toISOString(),
    shipping: {
      name: row.recipient_name,
      email: row.shipping_email,
      address: row.address_line,
      city: row.city,
      zip: row.zip,
      telephone: row.telephone,
    },
    items: items.map((it) => ({
      id: it.id,
      name: it.name,
      image: it.image,
      srcSet: it.src_set,
      size: it.size,
      price: Number(it.price),
      quantity: it.quantity,
    })),
  };
}

router.get("/", async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ error: "Orders are only available for customer accounts" });
  }
  try {
    const pool = getPool();
    const ordersResult = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    const ids = ordersResult.rows.map((r) => r.id);
    if (!ids.length) {
      return res.json([]);
    }
    const linesResult = await pool.query(
      `SELECT * FROM order_lines WHERE order_id = ANY($1::uuid[]) ORDER BY created_at ASC`,
      [ids]
    );
    const byOrder = new Map();
    for (const line of linesResult.rows) {
      const list = byOrder.get(line.order_id) || [];
      list.push(line);
      byOrder.set(line.order_id, list);
    }
    const payload = ordersResult.rows.map((row) =>
      mapOrderRow(row, byOrder.get(row.id) || [])
    );
    return res.json(payload);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load orders" });
  }
});

router.post("/", async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ error: "Only customers can place orders" });
  }
  const shipping = req.body?.shipping || req.body;
  const name = shipping?.name?.trim();
  const email = shipping?.email?.trim();
  const address = shipping?.address?.trim();
  const city = shipping?.city?.trim();
  const zip = shipping?.zip?.trim();
  const telephone = shipping?.telephone?.trim() || null;
  if (!name || !email || !address || !city || !zip) {
    return res.status(400).json({ error: "Missing required shipping fields" });
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const cart = await client.query(
      `SELECT id, name, image, src_set, size, price, quantity FROM cart_items
       WHERE user_id = $1 ORDER BY created_at ASC`,
      [req.user.id]
    );
    if (!cart.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cart is empty" });
    }
    const total = cart.rows.reduce(
      (acc, row) => acc + Number(row.price) * row.quantity,
      0
    );
    const orderIns = await client.query(
      `INSERT INTO orders (
         user_id, recipient_name, shipping_email, address_line, city, zip, telephone, total_amount
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, name, email, address, city, zip, telephone, total]
    );
    const order = orderIns.rows[0];
    const insertedLines = [];
    for (const line of cart.rows) {
      const ins = await client.query(
        `INSERT INTO order_lines (order_id, name, image, src_set, size, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          order.id,
          line.name,
          line.image,
          line.src_set,
          line.size,
          line.price,
          line.quantity,
        ]
      );
      insertedLines.push(ins.rows[0]);
    }
    await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [req.user.id]);
    await client.query("COMMIT");
    return res.status(201).json(mapOrderRow(order, insertedLines));
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    return res.status(500).json({ error: "Could not place order" });
  } finally {
    client.release();
  }
});

export default router;
