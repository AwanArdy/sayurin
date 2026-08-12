import { Hono } from 'hono';
import { type DrizzleD1Database } from 'drizzle-orm/d1';
import { type BatchItem } from 'drizzle-orm/batch';
import { zValidator } from '@hono/zod-validator';
import { eq, inArray, sql } from 'drizzle-orm';
import * as schema from '../schema';
import { success, fail, formatZodError } from '../lib/response';
import { checkoutSchema } from '../validators/schema';
import { authRequired } from '../middleware/auth';

// Formula dampak waste V1 (dokumentasi: PRD Phase 8.4). Dihitung dari isi order.
// - food waste: 0.5 kg per unit item yang dibeli
// - plastik   : 2 pcs kemasan per unit item yang dibeli
// - uang      : estimasi hemat 10% dari subtotal order
const FOOD_WASTE_PER_UNIT_KG = 0.5;
const PLASTIC_PER_UNIT_PCS = 2;
const SAVINGS_RATE = 0.1;

type Variables = {
  db: DrizzleD1Database<typeof schema>;
  userId: string;
};

// --- ROUTER CHECKOUT (/api/v1/checkout) ---
export const checkoutRoutes = new Hono<{ Variables: Variables }>();

// Wajib login untuk checkout
checkoutRoutes.use('*', authRequired);

checkoutRoutes.post('/', zValidator('json', checkoutSchema, (result, c) => {
  if (!result.success) return c.json(formatZodError(result.error), 400);
}), async (c) => {
  const db = c.get('db');
  const userId = c.get('userId'); // Didapat dari middleware JWT[cite: 3]
  const { items, substitution_policy } = c.req.valid('json');

  const productIds = items.map(item => item.product_id);
  const uniqueProductIds = Array.from(new Set(productIds));

  if (uniqueProductIds.length !== productIds.length) {
    return c.json(fail('VALIDATION_ERROR', 'Terdapat produk duplikat dalam pesanan'), 400);
  }

  let totalPrice = 0;
  const mappedOrderItems: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    priceAtPurchase: number;
  }> = [];
  const orderId = crypto.randomUUID();

  try {
    // Baca produk di luar batch (D1 batch hanya boleh berisi statement write)
    const freshProducts = await db.select()
      .from(schema.products)
      .where(inArray(schema.products.id, uniqueProductIds));

    if (freshProducts.length !== uniqueProductIds.length) {
      return c.json(fail('NOT_FOUND', 'Ada produk yang tidak ditemukan di sistem'), 404);
    }

    // Validasi ketersediaan stok (jalur cepat; guard akhir oleh CHECK stock >= 0)
    const stockOutIds: string[] = [];
    for (const item of items) {
      const product = freshProducts.find(p => p.id === item.product_id);

      if (!product) {
        return c.json(fail('NOT_FOUND', 'Ada produk yang tidak ditemukan di sistem'), 404);
      }

      if ((product.stock ?? 0) < item.quantity) {
        stockOutIds.push(product.id);
      }

      totalPrice += product.price * item.quantity;
      mappedOrderItems.push({
        id: crypto.randomUUID(),
        orderId,
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    if (stockOutIds.length > 0) {
      return c.json(fail('STOCK_OUT', 'Ada produk dengan stok tidak mencukupi', stockOutIds), 409);
    }

    // Siapkan statement write untuk dikelompokkan dalam satu batch atomik.
    // D1 tidak mendukung BEGIN TRANSACTION; batch dieksekusi all-or-nothing.
    const existingLog = await db.select()
      .from(schema.userWasteLogs)
      .where(eq(schema.userWasteLogs.userId, userId))
      .get();

    // Hitung dampak waste berdasarkan isi order aktual
    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
    const foodWasteSavedKg = FOOD_WASTE_PER_UNIT_KG * totalUnits;
    const plasticSavedPcs = PLASTIC_PER_UNIT_PCS * totalUnits;
    const moneySavedIdr = Math.round(totalPrice * SAVINGS_RATE);

    const statements: BatchItem<'sqlite'>[] = [];

    statements.push(db.insert(schema.orders).values({
      id: orderId,
      userId,
      totalPrice,
      substitutionPolicy: substitution_policy,
      status: 'pending',
      foodWasteSavedKg,
      createdAt: new Date().toISOString(),
    }));

    statements.push(db.insert(schema.orderItems).values(mappedOrderItems));

    // Kurangi stok. Jika hasilnya negatif, trigger/CHECK (stock >= 0) menolak dan
    // seluruh batch di-rollback.
    for (const item of items) {
      statements.push(db.update(schema.products)
        .set({ stock: sql`${schema.products.stock} - ${item.quantity}` })
        .where(eq(schema.products.id, item.product_id)));
    }

    if (existingLog) {
      statements.push(db.update(schema.userWasteLogs)
        .set({
          foodWasteSavedKg: (existingLog.foodWasteSavedKg || 0) + foodWasteSavedKg,
          plasticSavedPcs: (existingLog.plasticSavedPcs || 0) + plasticSavedPcs,
          moneySavedIdr: (existingLog.moneySavedIdr || 0) + moneySavedIdr,
        })
        .where(eq(schema.userWasteLogs.userId, userId)));
    } else {
      statements.push(db.insert(schema.userWasteLogs).values({
        id: crypto.randomUUID(),
        userId,
        foodWasteSavedKg,
        plasticSavedPcs,
        moneySavedIdr,
      }));
    }

    await db.batch(statements as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]]);

    return c.json(success({ orderId, totalPrice, status: 'pending' })); //[cite: 3]
  } catch (error: unknown) {
    // Kegagalan CHECK (stock >= 0) menandakan oversell yang lolos validasi awal.
    if (isCheckConstraintError(error)) {
      return c.json(fail('STOCK_OUT', 'Stok produk tidak mencukupi saat pemrosesan'), 409);
    }

    console.error('[CHECKOUT] Gagal memproses transaksi:', error);
    return c.json(fail('D1_EXECUTION_ERROR', 'Gagal memproses transaksi checkout'), 500);
  }
});

// Deteksi kegagalan constraint CHECK saat batch dijalankan.
const isCheckConstraintError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return /products_stock_non_negative|check constraint|constraint.+check|CHECK\s*\(/i.test(message)
    || (/(constraint|check)/i.test(message) && /stock/i.test(message));
};


// --- ROUTER ORDERS (/api/v1/orders) ---
export const ordersRoutes = new Hono<{ Variables: Variables }>();

// Wajib login untuk melihat order[cite: 3]
ordersRoutes.use('*', authRequired);

// List semua order milik user[cite: 3]
ordersRoutes.get('/', async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');

  const userOrders = await db.select().from(schema.orders).where(eq(schema.orders.userId, userId));
  return c.json(success(userOrders));
});

// Detail satu order beserta itemnya[cite: 3]
ordersRoutes.get('/:id', async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  const orderId = c.req.param('id');

  const order = await db.select().from(schema.orders)
    .where(sql`${schema.orders.id} = ${orderId} AND ${schema.orders.userId} = ${userId}`)
    .get();

  if (!order) {
    return c.json(fail('NOT_FOUND', 'Pesanan tidak ditemukan'), 404);
  }

  const items = await db.select({
    productName: schema.products.name,
    quantity: schema.orderItems.quantity,
    priceAtPurchase: schema.orderItems.priceAtPurchase
  })
  .from(schema.orderItems)
  .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
  .where(eq(schema.orderItems.orderId, orderId));

  return c.json(success({ ...order, items }));
});