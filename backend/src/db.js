import pg from "pg";

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function initDb() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        google_id TEXT UNIQUE,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'owner')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        image TEXT,
        src_set TEXT,
        size TEXT,
        price NUMERIC NOT NULL,
        quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await client.query(
      `CREATE INDEX IF NOT EXISTS cart_items_user_id_idx ON cart_items(user_id);`
    );
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'placed'
          CHECK (status IN ('placed', 'processing', 'shipped', 'cancelled')),
        recipient_name TEXT NOT NULL,
        shipping_email TEXT NOT NULL,
        address_line TEXT NOT NULL,
        city TEXT NOT NULL,
        zip TEXT NOT NULL,
        telephone TEXT,
        total_amount NUMERIC NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_lines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        image TEXT,
        src_set TEXT,
        size TEXT,
        price NUMERIC NOT NULL,
        quantity INT NOT NULL CHECK (quantity >= 1),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await client.query(
      `CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS order_lines_order_id_idx ON order_lines(order_id);`
    );
  } finally {
    client.release();
  }
}
