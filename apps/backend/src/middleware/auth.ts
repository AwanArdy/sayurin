import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { fail } from '../lib/response';

export const authRequired = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(fail('UNAUTHORIZED', 'Token otentikasi tidak ditemukan'), 401); //[cite: 3]
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set('userId', payload.id); // Simpan userId ke context[cite: 3]
    await next();
  } catch (error) {
    return c.json(fail('UNAUTHORIZED', 'Token tidak valid atau sudah kedaluwarsa'), 401); //[cite: 3]
  }
});
