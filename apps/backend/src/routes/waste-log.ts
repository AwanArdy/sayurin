import { Hono } from 'hono';
import { type DrizzleD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';
import { success } from '../lib/response';
import { authRequired } from '../middleware/auth';

// Threshold level V1 (dokumentasi PRD Phase 8.3)
const USER_LEVELS: Array<{ minKg: number; level: string }> = [
  { minKg: 10, level: 'Eco Legend' },
  { minKg: 3, level: 'Eco Warrior' },
  { minKg: 1, level: 'Eco Saver' },
];
const DEFAULT_USER_LEVEL = 'Eco Starter';

const getUserLevel = (foodWasteSavedKg: number): string =>
  USER_LEVELS.find((lvl) => foodWasteSavedKg >= lvl.minKg)?.level ?? DEFAULT_USER_LEVEL;

type Variables = {
  db: DrizzleD1Database<typeof schema>;
  userId: string;
};

const wasteLogRoutes = new Hono<{ Variables: Variables }>();

// Wajib login
wasteLogRoutes.use('*', authRequired);

// GET /api/v1/users/waste-log
wasteLogRoutes.get('/', async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');

  // Cari log berdasarkan userId[cite: 3]
  let log = await db.select().from(schema.userWasteLogs).where(eq(schema.userWasteLogs.userId, userId)).get();

  // Kalau pengguna belum pernah checkout, kita kembalikan data default 0
  if (!log) {
    log = {
      id: '',
      userId: userId,
      foodWasteSavedKg: 0,
      plasticSavedPcs: 0,
      moneySavedIdr: 0
    };
  }

  // Hitung user_level berdasarkan thresholds v1[cite: 3]
  const kg = log.foodWasteSavedKg || 0;
  const user_level = getUserLevel(kg);

  return c.json(success({
    food_waste_saved_kg: kg,
    plastic_saved_pcs: log.plasticSavedPcs || 0,
    money_saved_idr: log.moneySavedIdr || 0,
    user_level
  }));
});

export default wasteLogRoutes;
