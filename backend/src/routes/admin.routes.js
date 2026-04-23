import { Router } from "express";
import { getPool } from "../db.js";
import { requireAuth, requireOwner } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth, requireOwner);

/** Last 6 calendar months (UTC) as { year, month0, label } for chart buckets. */
function sixMonthBuckets() {
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() - i);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    buckets.push({
      year: d.getUTCFullYear(),
      month0: d.getUTCMonth(),
      label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }) +
        " " +
        String(d.getUTCFullYear()).slice(-2),
      sales: 0,
    });
  }
  return buckets;
}

function bucketKey(y, m0) {
  return `${y}-${m0}`;
}

router.get("/stats", async (_req, res) => {
  try {
    const pool = getPool();

    const [totals, monthlyRows, productRows, orderRows] = await Promise.all([
      pool.query(
        `SELECT
           COALESCE(SUM(ol.price * ol.quantity), 0)::numeric AS revenue,
           COUNT(DISTINCT o.id)::int AS order_count,
           COALESCE(SUM(ol.quantity), 0)::bigint AS units
         FROM order_lines ol
         JOIN orders o ON o.id = ol.order_id
         JOIN users u ON u.id = o.user_id AND u.role = 'user'`
      ),
      pool.query(
        `SELECT
           date_trunc('month', o.created_at AT TIME ZONE 'UTC') AS bucket,
           SUM(ol.price * ol.quantity)::float AS sales
         FROM order_lines ol
         JOIN orders o ON o.id = ol.order_id
         JOIN users u ON u.id = o.user_id AND u.role = 'user'
         WHERE o.created_at >= NOW() - INTERVAL '8 months'
         GROUP BY bucket
         ORDER BY bucket`
      ),
      pool.query(
        `SELECT ol.name,
                SUM(ol.quantity)::int AS units,
                SUM(ol.price * ol.quantity)::numeric AS revenue
         FROM order_lines ol
         JOIN orders o ON o.id = ol.order_id
         JOIN users u ON u.id = o.user_id AND u.role = 'user'
         GROUP BY ol.name
         ORDER BY revenue DESC NULLS LAST
         LIMIT 24`
      ),
      pool.query(
        `SELECT o.id,
                o.created_at,
                o.total_amount,
                u.email AS customer_email,
                (SELECT COUNT(*)::int FROM order_lines x WHERE x.order_id = o.id) AS item_count
         FROM orders o
         JOIN users u ON u.id = o.user_id AND u.role = 'user'
         ORDER BY o.created_at DESC
         LIMIT 25`
      ),
    ]);

    const t = totals.rows[0] || {};
    const totalSales = Number(t.revenue || 0);
    const totalOrders = Number(t.order_count || 0);
    const totalUnitsSold = Number(t.units || 0);

    const monthMap = new Map();
    for (const row of monthlyRows.rows) {
      const d = row.bucket instanceof Date ? row.bucket : new Date(row.bucket);
      const y = d.getUTCFullYear();
      const m0 = d.getUTCMonth();
      monthMap.set(bucketKey(y, m0), Number(row.sales) || 0);
    }

    const salesData = sixMonthBuckets().map((b) => ({
      name: b.label,
      sales: monthMap.get(bucketKey(b.year, b.month0)) ?? 0,
    }));

    const products = productRows.rows.map((r) => ({
      name: r.name?.length > 32 ? `${String(r.name).slice(0, 30)}…` : r.name,
      value: Number(r.revenue) || 0,
      units: Number(r.units) || 0,
    }));

    let brandData = [];
    if (products.length) {
      const top = products.slice(0, 7);
      const rest = products.slice(7);
      brandData = [...top];
      const otherRev = rest.reduce((a, p) => a + p.value, 0);
      const otherUnits = rest.reduce((a, p) => a + p.units, 0);
      if (otherRev > 0) {
        brandData.push({ name: "Other", value: otherRev, units: otherUnits });
      }
    }

    const recentOrders = orderRows.rows.map((o) => ({
      id: o.id,
      customerEmail: o.customer_email,
      placedAt: o.created_at.toISOString(),
      itemCount: o.item_count,
      orderTotal: Number(o.total_amount),
    }));

    return res.json({
      totalSales: totalSales.toFixed(2),
      totalOrders,
      totalUnitsSold,
      salesData,
      brandData,
      recentOrders,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load admin stats" });
  }
});

export default router;
