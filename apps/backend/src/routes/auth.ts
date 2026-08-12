import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { type DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../schema';
import { success, fail, formatZodError } from '../lib/response';
import { registerSchema, loginSchema } from '../validators/schema';
import { hashPassword, verifyPassword } from '../lib/hash';

type Bindings = {
  JWT_SECRET: string;
};

type Variables = {
  db: DrizzleD1Database<typeof schema>;
};

const authRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// POST /api/v1/auth/register (Phase 6.2)
authRoutes.post('/register', zValidator('json', registerSchema, (result, c) => {
  if (!result.success) return c.json(formatZodError(result.error), 400);
}), async (c) => {
  const db = c.get('db');
  const { email, password, name } = c.req.valid('json');

  // Cek apakah email sudah terdaftar
  const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, email)).get();
  
  if (existingUser) {
    return c.json(fail('VALIDATION_ERROR', 'Email sudah digunakan'), 400); //[cite: 3]
  }

  // Buat ID acak dan hash password
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  // Simpan ke database
  await db.insert(schema.users).values({
    id,
    email,
    passwordHash,
    name,
    createdAt: new Date().toISOString(),
  });

  return c.json(success({ id, email, name }));
});

// POST /api/v1/auth/login (Phase 6.3)
authRoutes.post('/login', zValidator('json', loginSchema, (result, c) => {
  if (!result.success) return c.json(formatZodError(result.error), 400);
}), async (c) => {
  const db = c.get('db');
  const { email, password } = c.req.valid('json');

  const user = await db.select().from(schema.users).where(eq(schema.users.email, email)).get();
  
  if (!user) {
    return c.json(fail('UNAUTHORIZED', 'Email atau password salah'), 401); //[cite: 3]
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    return c.json(fail('UNAUTHORIZED', 'Email atau password salah'), 401); //[cite: 3]
  }

  // Buat JWT Token dengan masa berlaku 7 hari
  const token = await sign(
    {
      id: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    c.env.JWT_SECRET
  );

  return c.json(success({ 
    token, 
    user: { id: user.id, email: user.email, name: user.name } 
  })); //[cite: 3]
});

export default authRoutes;
