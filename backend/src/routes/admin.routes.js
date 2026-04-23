import { Router } from "express";
import { getPool } from "../db.js";
import { requireAuth, requireOwner } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth, requireOwner);

router.get("/stats", async (_req, res) => {
  try {
    const pool = getPool();
    let sneakers = [];
    try {
      const sneakersRes = await fetch(
        "https://63bd839d18bc301c026b31a9.mockapi.io/sneakersData"
      );
      const data = await sneakersRes.json();
      if (Array.isArray(data)) sneakers = data;
    } catch {
      sneakers = [];
    }
    const sneakersCount = sneakers.length;

    const lineRows = await pool.query(
      `SELECT ol.id, ol.name, ol.price, ol.quantity, o.created_at
       FROM order_lines ol
       JOIN orders o ON o.id = ol.order_id
       JOIN users u ON u.id = o.user_id AND u.role = 'user'
       ORDER BY o.created_at ASC, ol.created_at ASC`
    );

    const rows = lineRows.rows;
    const totalSales = rows.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0
    );

    const orderCountRes = await pool.query(
      `SELECT COUNT(*)::int AS c FROM orders o
       JOIN users u ON u.id = o.user_id AND u.role = 'user'`
    );
    const orderCount = orderCountRes.rows[0]?.c ?? 0;

    const recentOrders = [...rows].slice(-5).reverse().map((order) => ({
      id: order.id,
      name: order.name,
      quantity: order.quantity,
      price: Number(order.price),
    }));

    const salesData = [
      { name: "Jan", sales: 4000 },
      { name: "Feb", sales: 3000 },
      { name: "Mar", sales: 2000 },
      { name: "Apr", sales: 2780 },
      { name: "May", sales: 1890 },
      { name: "Jun", sales: 2390 },
    ];

    let brandData = [];
    if (sneakers.length) {
      const brands = {};
      sneakers.forEach((s) => {
        brands[s.brand] = (brands[s.brand] || 0) + 1;
      });
      brandData = Object.keys(brands).map((key) => ({ name: key, value: brands[key] }));
    }

    return res.json({
      totalSales: totalSales.toFixed(2),
      totalOrders: orderCount,
      totalSneakers: sneakersCount,
      brandData,
      salesData,
      recentOrders,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load admin stats" });
  }
});

export default router;
