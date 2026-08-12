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

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

type Variables = {
  db: DrizzleD1Database<typeof schema>;
  userId?: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GLobal Middleware
app.use('*', logger());
app.use('*', cors());

// Helper Drizzle ORM instance ke context
app.use('*', async (c, next) => {
  const db = drizzle(c.env.DB, { schema })
  c.set('db', db)
  await next()
});

// health check
app.get('/health', (c) => c.json({ ok: true }));

// products endpoints
app.route('/api/v1/products', productsRoutes);
app.route('/api/v1/recipes', recipesRoutes);
app.route('/api/v1/auth', authRoutes);

// GLobal error Middleware
app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`);
  return c.json(fail('D1_EXECUTION_ERROR', 'Terjadi kesalahan pada server', [err.message]), 500);
});

// penanganan route tidak ditemukan (404)
app.notFound((c) => {
  return c.json(fail('NOT_FOUND', 'Route API tidak ditemukan'), 404);
});

export default app
