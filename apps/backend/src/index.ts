import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1'
import { zValidator } from '@hono/zod-validator'
import z from 'zod'
import * as schema from './schema'
import { eq } from 'drizzle-orm'
import { fail } from './lib/response'

import productsRoutes from './routes/products';
import recipesRoutes from './routes/recipes';
import authRoutes from './routes/auth';
import { checkoutRoutes, ordersRoutes } from './routes/checkout';
import wasteLogRoutes from './routes/waste-log';

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  CORS_ORIGIN?: string
}

type Variables = {
  db: DrizzleD1Database<typeof schema>;
  userId?: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GLobal Middleware
app.use('*', logger());

// Batasi origin CORS. Set env CORS_ORIGIN (koma-separated) untuk production;
// fallback ke origin localhost dev apabila tidak diset.
app.use('*', cors({
  origin: (origin, c) => {
    const allowedOrigins = c.env.CORS_ORIGIN
      ?.split(',')
      .map((s: string) => s.trim())
      .filter(Boolean) ?? ['http://localhost:5173', 'http://localhost:3000'];
    return allowedOrigins.includes(origin) ? origin : undefined;
  },
}));

// Helper Drizzle ORM instance ke context (dibuat sekali per env.DB, lalu di-cache)
const dbCache = new WeakMap<D1Database, DrizzleD1Database<typeof schema>>();
app.use('*', async (c, next) => {
  let db = dbCache.get(c.env.DB);
  if (!db) {
    db = drizzle(c.env.DB, { schema });
    dbCache.set(c.env.DB, db);
  }
  c.set('db', db);
  await next()
});

// health check
app.get('/health', (c) => c.json({ ok: true }));

// products endpoints
app.route('/api/v1/products', productsRoutes);
app.route('/api/v1/recipes', recipesRoutes);
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/checkout', checkoutRoutes);
app.route('/api/v1/orders', ordersRoutes);
app.route('/api/v1/users/waste-log', wasteLogRoutes);

// GLobal error Middleware
app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`, err.stack);
  return c.json(fail('D1_EXECUTION_ERROR', 'Terjadi kesalahan pada server'), 500);
});

// penanganan route tidak ditemukan (404)
app.notFound((c) => {
  return c.json(fail('NOT_FOUND', 'Route API tidak ditemukan'), 404);
});

export default app
