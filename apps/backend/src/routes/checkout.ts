import { Hono } from 'hono';
import { type DrizzleD1Database } from 'drizzle-orm/d1';
import { zValidator } from '@hono/zod-validator';
import { eq, inArray, sql } from 'drizzle-orm';
import * as schema from '../schema';
import { success, fail } from '../lib/response';
import { checkoutSchema } from '../validators/schema';
import { authRequired } from '../middleware/auth';

type Variables = {
  db: DrizzleD1Database<typeof schema>;
  userId: string;
};

// --- ROUTER CHECKOUT (/api/v1/checkout) ---
export const checkoutRoutes = new Hono<{ Variables: Variables }>();

// Wajib login untuk checkout
checkoutRoutes.use('*', authRequired);

checkoutRoutes.post('/', zValidator('json', checkoutSchema), async (c) => {
  const db = c.get('db');
  const userId = c.get('userId'); // Didapat dari middleware JWT[cite: 3]
  const { items, substitution_policy } = c.req.valid('json');

  const productIds = items.map(item => item.product_id);

  // Ambil data produk berdasarkan ID yang dikirim[cite: 3]
  const products = await db.select().from(schema.products).where(inArray(schema.products.id, productIds));

  if (products.length !== productIds.length) {
    return c.json(fail('NOT_FOUND', 'Ada produk yang tidak ditemukan di sistem'), 404); //[cite: 3]
  }

  let totalPrice = 0;
  const orderItemsData = [];

  // Validasi ketersediaan stok[cite: 3]
  for (const item of items) {
    const product = products.find(p => p.id === item.product_id);
    
    if (product!.stock < item.quantity) {
      return c.json(fail('STOCK_OUT', `Stok ${product!.name} tidak mencukupi (Sisa: ${product!.stock})`, [product!.id]), 409); //[cite: 3]
    }
    
    totalPrice += product!.price * item.quantity;

    orderItemsData.push({
      id: crypto.randomUUID(),
      productId: product!.id,
      quantity: item.quantity,
      priceAtPurchase: product!.price
    });
  }

  const orderId = crypto.randomUUID();

  try {
    // Jalankan transaksi Atomic Drizzle/D1[cite: 3]
    await db.transaction(async (tx) => {
      // 1. Buat data pesanan[cite: 3]
      await tx.insert(schema.orders).values({
        id: orderId,
        userId,
        totalPrice,
        substitutionPolicy: substitution_policy,
        status: 'pending',
        foodWasteSavedKg: 0.5 // Estimasi statis untuk V1[cite: 3]
      });

      // 2. Masukkan rincian item pesanan[cite: 3]
      const mappedOrderItems = orderItemsData.map(oi => ({ ...oi, orderId }));
      await tx.insert(schema.orderItems).values(mappedOrderItems);

      // 3. Kurangi stok produk[cite: 3]
      for (const item of items) {
        await tx.update(schema.products)
          .set({ stock: sql`${schema.products.stock} - ${item.quantity}` })
          .where(eq(schema.products.id, item.product_id));
      }

      // 4. Update Waste Log (Phase 8.4)[cite: 3]
      const existingLog = await tx.select().from(schema.userWasteLogs).where(eq(schema.userWasteLogs.userId, userId)).get();
      
      if (existingLog) {
        // Jika sudah ada log, tambahkan valuenya
        await tx.update(schema.userWasteLogs)
          .set({
            foodWasteSavedKg: (existingLog.foodWasteSavedKg || 0) + 0.5,
            plasticSavedPcs: (existingLog.plasticSavedPcs || 0) + 2,
            moneySavedIdr: (existingLog.moneySavedIdr || 0) + 5000
          })
          .where(eq(schema.userWasteLogs.userId, userId));
      } else {
        // Jika pengguna baru pertama kali belanja
        await tx.insert(schema.userWasteLogs).values({
          id: crypto.randomUUID(),
          userId,
          foodWasteSavedKg: 0.5,
          plasticSavedPcs: 2,
          moneySavedIdr: 5000
        });
      }
    });

    return c.json(success({ orderId, totalPrice, status: 'pending' })); //[cite: 3]
  } catch (error: any) {
    return c.json(fail('D1_EXECUTION_ERROR', 'Gagal memproses transaksi checkout', [error.message]), 500); //[cite: 3]
  }
});


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
