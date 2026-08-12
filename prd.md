# PRODUCT REQUIREMENT DOCUMENT (PRD.MD)
## Backend API Specifications: E-Commerce Sayur Online (Cloudflare D1 & Hono)

---

## 1. Executive Summary & Tech Stack

Dokumen ini berisi spesifikasi teknis, fungsional, dan **roadmap pembangunan Backend Service** untuk platform e-commerce sayur online. Service ini dibangun dengan arsitektur modern yang *ultra-lightweight*, berjalan di **Cloudflare Workers / Pages** menggunakan **Cloudflare D1** sebagai *native edge relational database*.

### Tech Stack Details
- **Language**: TypeScript (`^5.0.0`)
- **Web Framework**: Hono (`hono` - Edge-first, web standards-based framework)
- **Runtime Environment**: Cloudflare Workers / Pages (`workerd`)
- **Database Engine**: **Cloudflare D1** (Serverless SQL Database based on SQLite)
- **Database ORM / Query Builder**: Drizzle ORM (`drizzle-orm/d1`)
- **Validation Library**: Zod (`@hono/zod-validator`)
- **Authentication**: JWT (JSON Web Token via `hono/jwt`)
- **Config**: `wrangler.jsonc` (bukan `wrangler.toml`)
- **Package path**: `apps/backend/`

### Project Layout (target)

```
apps/backend/
├── src/
│   ├── index.ts              # App entry + route mount
│   ├── schema.ts             # Drizzle table definitions
│   ├── db/
│   │   └── client.ts         # (opsional) helper drizzle factory
│   ├── middleware/
│   │   ├── db.ts             # inject Drizzle ke context
│   │   ├── auth.ts           # JWT middleware
│   │   └── error.ts          # standardized error handler
│   ├── routes/
│   │   ├── products.ts
│   │   ├── recipes.ts
│   │   ├── checkout.ts
│   │   ├── auth.ts
│   │   └── waste-log.ts
│   ├── services/
│   │   ├── products.service.ts
│   │   ├── recipes.service.ts
│   │   ├── checkout.service.ts
│   │   └── waste.service.ts
│   ├── validators/
│   │   └── schemas.ts        # Zod request schemas
│   └── lib/
│       ├── errors.ts         # error codes + helpers
│       ├── jwt.ts
│       └── response.ts       # success/error JSON helpers
├── drizzle/                  # generated SQL migrations
├── seeds/                    # seed data SQL/TS
├── wrangler.jsonc
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

> **Catatan**: Pada tahap awal (Phase 0–2) boleh monolit di `index.ts`. Mulai Phase 3, pecah ke `routes/` + `services/` agar terarah.

---

## 2. Backend Build Roadmap (Step-by-Step)

Bangun backend **berurutan per fase**. Jangan loncat ke fitur kompleks sebelum fondasi (D1, schema, migration, seed, response contract) stabil.

### Status legend
- `[ ]` belum
- `[~]` partial / scaffold ada
- `[x]` selesai

---

### Phase 0 — Project Foundation
**Tujuan**: Worker Hono bisa dijalankan lokal, type-safe, dan terhubung ke D1 binding.

| Step | Task | Deliverable | Status |
|------|------|-------------|--------|
| 0.1 | Inisialisasi Hono + Wrangler di `apps/backend` | `npm run dev` jalan | `[x]` |
| 0.2 | Install deps: `hono`, `drizzle-orm`, `zod`, `@hono/zod-validator`, `drizzle-kit`, `@cloudflare/workers-types` | `package.json` lengkap | `[x]` |
| 0.3 | Setup `tsconfig.json` + types Cloudflare Workers | `tsc --noEmit` lulus | `[x]` |
| 0.4 | Buat D1 database & binding di `wrangler.jsonc` (`DB`) | `wrangler.jsonc` berisi `d1_databases` | `[x]` |
| 0.5 | Generate types binding: `npm run cf-typegen` | `worker-configuration.d.ts` / CloudflareBindings | `[ ]` |
| 0.6 | Definisikan `Bindings` + `Variables` di Hono | `c.env.DB`, `c.set('db')` type-safe | `[~]` |
| 0.7 | Healthcheck endpoint | `GET /health` → `{ ok: true }` | `[ ]` |

**Acceptance criteria Phase 0**
- [ ] `npm run dev -w backend` start tanpa error
- [ ] `GET /health` 200
- [ ] Typecheck clean

**Commands**
```bash
# dari root monorepo
npm install
npm run dev -w backend

# buat D1 (sekali, jika belum)
npx wrangler d1 create sayurin
# salin database_id ke wrangler.jsonc
```

---

### Phase 1 — Database Schema & Migrations
**Tujuan**: Schema Drizzle = source of truth; D1 punya tabel lewat migration.

| Step | Task | Deliverable | Status |
|------|------|-------------|--------|
| 1.1 | Tulis schema Drizzle di `src/schema.ts` (users, products, recipes, recipe_ingredients, orders, order_items, user_waste_logs) | `schema.ts` | `[x]` |
| 1.2 | Setup `drizzle.config.ts` untuk D1 | config generate/migrate | `[ ]` |
| 1.3 | Generate migration SQL (`drizzle-kit generate`) | folder `drizzle/*.sql` | `[ ]` |
| 1.4 | Apply migration ke D1 local | `wrangler d1 migrations apply sayurin --local` | `[ ]` |
| 1.5 | Apply migration ke D1 remote (saat siap staging) | `wrangler d1 migrations apply sayurin --remote` | `[ ]` |
| 1.6 | Verifikasi tabel | `wrangler d1 execute sayurin --local --command "SELECT name FROM sqlite_master WHERE type='table';"` | `[ ]` |

**Acceptance criteria Phase 1**
- [ ] Semua tabel di Section 3 ada di D1 local
- [ ] Re-run migration idempotent / tidak merusak data

**Commands**
```bash
cd apps/backend
npx drizzle-kit generate
npx wrangler d1 migrations apply sayurin --local
```

---

### Phase 2 — Seed Data & Response Contract
**Tujuan**: Data contoh tersedia; format response API konsisten.

| Step | Task | Deliverable | Status |
|------|------|-------------|--------|
| 2.1 | Buat seed products (min. 8–12 SKU sayur) | `seeds/products.sql` atau seed script | `[ ]` |
| 2.2 | Buat seed recipes + recipe_ingredients (min. 2 resep) | relasi product ↔ ingredient valid | `[ ]` |
| 2.3 | Buat 1 user dummy + waste log | untuk test JWT & waste-log | `[ ]` |
| 2.4 | Implement helper response | `success()` / `fail()` di `lib/response.ts` | `[ ]` |
| 2.5 | Standard error codes | `VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`, `STOCK_OUT`, `D1_EXECUTION_ERROR` | `[ ]` |
| 2.6 | Global error middleware Hono | uncaught error → JSON standard | `[ ]` |

**Acceptance criteria Phase 2**
- [ ] Query products di D1 local mengembalikan rows
- [ ] Error format selalu:
```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "...", "details": [] }
}
```

---

### Phase 3 — Core App Architecture (Hono Context)
**Tujuan**: Pola akses DB & validasi seragam; routing mulai dipisah.

| Step | Task | Deliverable | Status |
|------|------|-------------|--------|
| 3.1 | Middleware inject Drizzle: `c.set('db', drizzle(...))` | semua route pakai `c.get('db')` | `[~]` |
| 3.2 | Mount router modular (`app.route('/api/v1/products', productsRoutes)`) | `routes/*.ts` | `[ ]` |
| 3.3 | Zod schemas terpusat di `validators/schemas.ts` | reusable validators | `[~]` |
| 3.4 | CORS middleware (frontend local) | `hono/cors` | `[ ]` |
| 3.5 | Logger request sederhana | method, path, status, duration | `[ ]` |

**Acceptance criteria Phase 3**
- [ ] Tidak ada `drizzle(c.env.DB)` di dalam handler (hanya lewat middleware)
- [ ] Route file terpisah per domain

---

### Phase 4 — Products API (read)
**Tujuan**: Katalog produk dari D1 dengan filter.

| Step | Task | Deliverable | Status |
|------|------|-------------|--------|
| 4.1 | `GET /api/v1/products` list semua | JSON `{ success, data }` | `[~]` (belum filter) |
| 4.2 | Filter `?nutrition=` (cari di `nutrition_tags` JSON string) | fiber / iron / low_carb / uric_acid_safe | `[ ]` |
| 4.3 | Filter `?search=` (LIKE name/slug) | case-insensitive search | `[ ]` |
| 4.4 | `GET /api/v1/products/:id` atau `/:slug` detail | 404 jika tidak ada | `[ ]` |
| 4.5 | Sorting opsional (`?sort=price_asc|price_desc|name`) | query param | `[ ]` |

**Acceptance criteria Phase 4**
- [ ] Tanpa query → semua produk
- [ ] `?nutrition=fiber` hanya produk bertag fiber
- [ ] `?search=bayam` cocok nama/slug
- [ ] Product tidak ketemu → `NOT_FOUND`

**Urutan implementasi handler**
1. Select all
2. Tambah `search` dengan `like()` / `sql\`...\``
3. Tambah `nutrition` (parse/tag match)
4. Detail by id/slug

---

### Phase 5 — Recipes & Smart Cart Calculator
**Tujuan**: Resep + kalkulasi belanja berdasarkan porsi & pantry.

| Step | Task | Deliverable | Status |
|------|------|-------------|--------|
| 5.1 | `GET /api/v1/recipes` list resep (opsional pagination) | list ringkas | `[ ]` |
| 5.2 | `GET /api/v1/recipes/:id` detail + ingredients join products | 404 handling | `[~]` (detail tanpa ingredients) |
| 5.3 | Zod validate body `calculate-cart` | servings ≥ 1, pantry ids array | `[x]` |
| 5.4 | Logic: load ingredients resep | join `recipe_ingredients` + `products` | `[ ]` |
| 5.5 | Logic: scale amount = `amountPerServing * servings` | calculated_amount | `[ ]` |
| 5.6 | Logic: exclude `pantry_ingredient_ids` dari items_to_buy | filter pantry | `[ ]` |
| 5.7 | Logic: hitung `total_estimated_price` | sum price (perlu aturan unit/qty) | `[ ]` |
| 5.8 | Ganti mock response dengan data D1 real | no hardcoded ayam | `[ ]` |

**Acceptance criteria Phase 5**
- [ ] Servings 2 vs 4 → gramasi proporsional
- [ ] Item di pantry tidak muncul di `items_to_buy`
- [ ] `items_in_pantry_count` = jumlah id pantry yang valid cocok ingredients
- [ ] Resep tidak ada → `NOT_FOUND`

**Algoritma `calculate-cart` (wajib ikuti)**
```
1. Ambil recipe by id → 404 jika null
2. Ambil ingredients + product (join)
3. Untuk tiap ingredient:
   a. amount = amountPerServing * servings
   b. jika ingredient.id ATAU product.id ada di pantry_ingredient_ids → skip (hitung pantry)
   c. else push ke items_to_buy { product_id, product_name, calculated_amount, unit, price }
4. total_estimated_price = sum(price * ceil packing rule)  # dokumentasikan packing rule
5. return target_servings, items_to_buy, items_in_pantry_count, total_estimated_price
```

> **Keputusan desain packing**: tentukan apakah `price` di products adalah harga per unit stock (mis. per 100g) atau per SKU. Catat di PRD/service comment sebelum implementasi Phase 5.7.

---

### Phase 6 — Auth (JWT)
**Tujuan**: User bisa register/login; endpoint protected mengenali user.

| Step | Task | Deliverable | Status |
|------|------|-------------|--------|
| 6.1 | Env secret `JWT_SECRET` di wrangler / `.dev.vars` | binding secret | `[ ]` |
| 6.2 | `POST /api/v1/auth/register` | email unique, hash password | `[ ]` |
| 6.3 | `POST /api/v1/auth/login` | return JWT | `[ ]` |
| 6.4 | Middleware `authRequired` | Bearer token → `c.set('userId', ...)` | `[ ]` |
| 6.5 | Password hashing (Web Crypto / bcrypt-compatible edge-safe) | no plain text | `[ ]` |

**Acceptance criteria Phase 6**
- [ ] Register email duplikat → error jelas
- [ ] Login salah password → `UNAUTHORIZED`
- [ ] Protected route tanpa token → 401
- [ ] Token valid → handler dapat `userId`

**Minimal auth endpoints**
```
POST /api/v1/auth/register  { email, password, name }
POST /api/v1/auth/login     { email, password } → { token }
```

---

### Phase 7 — Checkout & Orders (transaction)
**Tujuan**: Checkout atomic: cek stock, buat order + items, update stock.

| Step | Task | Deliverable | Status |
|------|------|-------------|--------|
| 7.1 | Zod `checkoutSchema` | items, substitution_policy, shipping_address_id | `[x]` |
| 7.2 | Auth required pada checkout | JWT | `[ ]` |
| 7.3 | Validasi product exists + stock cukup | `STOCK_OUT` jika kurang | `[ ]` |
| 7.4 | Drizzle/D1 transaction: insert orders + order_items | atomic | `[ ]` |
| 7.5 | Decrement stock | race-safe sebaik mungkin di D1 | `[ ]` |
| 7.6 | Simpan `substitution_policy` di order | enum 3 opsi | `[ ]` |
| 7.7 | Hitung & simpan `food_waste_saved_kg` (estimasi sederhana) | optional v1 | `[ ]` |
| 7.8 | Response order id + total + status | bukan mock message only | `[ ]` |
| 7.9 | `GET /api/v1/orders` / `GET /api/v1/orders/:id` (user sendiri) | list/detail | `[ ]` |

**Acceptance criteria Phase 7**
- [ ] Stock 0 → checkout gagal, order tidak terbuat
- [ ] Sukses → order + items di D1, stock berkurang
- [ ] `substitution_policy` tersimpan

**Alur checkout**
```
1. Auth → userId
2. Validate body
3. Load products for all product_ids
4. Jika ada product hilang → NOT_FOUND
5. Jika stock < quantity → STOCK_OUT (details: product_id)
6. totalPrice = sum(price * quantity)  # sesuai packing rule
7. BEGIN transaction:
   - insert orders
   - insert order_items (price_at_purchase snapshot)
   - update products.stock
   - upsert/update user_waste_logs (jika ada formula)
8. COMMIT → return order summary
```

---

### Phase 8 — Waste / Impact Tracker
**Tujuan**: User melihat dampak hemat food waste.

| Step | Task | Deliverable | Status |
|------|------|-------------|--------|
| 8.1 | `GET /api/v1/users/waste-log` protected | JWT required | `[~]` (masih mock) |
| 8.2 | Baca dari `user_waste_logs` by userId | real D1 | `[ ]` |
| 8.3 | Hitung `user_level` dari thresholds | e.g. Eco Newbie → Eco Warrior | `[ ]` |
| 8.4 | Update waste log saat checkout sukses | formula v1 didokumentasikan | `[ ]` |

**Level thresholds (usulan v1)**
| Level | food_waste_saved_kg |
|-------|---------------------|
| Eco Starter | 0 – < 1 |
| Eco Saver | 1 – < 3 |
| Eco Warrior | 3 – < 10 |
| Eco Legend | ≥ 10 |

---

### Phase 9 — Hardening, Test & Deploy
**Tujuan**: Siap staging/production.

| Step | Task | Deliverable | Status |
|------|------|-------------|--------|
| 9.1 | Rate limit dasar / abuse guard (opsional) | middleware | `[ ]` |
| 9.2 | Input sanitization & max body size | Zod refine | `[ ]` |
| 9.3 | Integration smoke tests (curl / vitest) | script `test:api` | `[ ]` |
| 9.4 | Migration remote apply | D1 production | `[ ]` |
| 9.5 | Set secrets production (`JWT_SECRET`) | `wrangler secret put` | `[ ]` |
| 9.6 | `npm run deploy -w backend` | Worker live | `[ ]` |
| 9.7 | Dokumentasi endpoint final (OpenAPI opsional) | README atau `/doc` | `[ ]` |

**Smoke test checklist**
```bash
# health
curl -s http://127.0.0.1:8787/health

# products
curl -s "http://127.0.0.1:8787/api/v1/products?search=bayam"

# recipe detail
curl -s http://127.0.0.1:8787/api/v1/recipes/<id>

# calculate-cart
curl -s -X POST http://127.0.0.1:8787/api/v1/recipes/<id>/calculate-cart \
  -H 'content-type: application/json' \
  -d '{"servings":4,"pantry_ingredient_ids":[]}'

# register + login + waste-log + checkout
# ... (setelah Phase 6–7)
```

---

### Recommended Build Order (ringkas)

```
Phase 0  Foundation
   ↓
Phase 1  Schema + Migration
   ↓
Phase 2  Seed + Error contract
   ↓
Phase 3  Middleware + Route structure
   ↓
Phase 4  Products API          ← value cepat untuk frontend
   ↓
Phase 5  Recipes + calculate-cart  ← diferensiator produk
   ↓
Phase 6  Auth JWT
   ↓
Phase 7  Checkout transaction
   ↓
Phase 8  Waste tracker (real data)
   ↓
Phase 9  Harden + Deploy
```

**Jangan** kerjakan checkout (Phase 7) sebelum products + auth siap.  
**Jangan** deploy remote (Phase 9) sebelum migration + seed local lulus smoke test.

### Definition of Done (Backend v1)
- [ ] Semua endpoint Section 5 terimplementasi non-mock
- [ ] Auth melindungi checkout & waste-log
- [ ] Migration + seed reproducible di mesin baru
- [ ] Error response seragam
- [ ] Typecheck + smoke test lulus
- [ ] Deploy Workers sukses

---

## 3. Cloudflare D1 & Drizzle Schema Definitions

```
+------------------------------------------------------------------------------------+
|                               DATABASE ERD OVERVIEW                                |
+------------------------------------------------------------------------------------+
|  [ Users ]                                                                         |
|     └── [ Recipes ] ─── (1:N) ───> [ RecipeIngredients ] ─── (N:1) ───> [ Products]|
|     └── [ Orders ]  ─── (1:N) ───> [ OrderItems ]                                  |
|     └── [ UserWasteLogs ]                                                          |
+------------------------------------------------------------------------------------+
```

### Table Definitions (Drizzle ORM for Cloudflare D1)

```typescript
// schema.ts (Drizzle D1 Schema Example)
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  price: integer('price').notNull(), // dalam IDR
  unit: text('unit').notNull(), // e.g. "gram", "kg", "ikat"
  stock: integer('stock').default(0),
  shelfLifeRoomDays: integer('shelf_life_room_days'),
  shelfLifeChillerDays: integer('shelf_life_chiller_days'),
  nutritionTags: text('nutrition_tags'), // JSON Stringified array e.g. '["fiber", "iron"]'
  storageTips: text('storage_tips'),
});

export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  baseServings: integer('base_servings').default(2),
  cookingTimeMins: integer('cooking_time_mins'),
  instructions: text('instructions'), // JSON Stringified Array
});

export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id').notNull().references(() => recipes.id),
  productId: text('product_id').notNull().references(() => products.id),
  amountPerServing: real('amount_per_serving').notNull(),
  unit: text('unit'),
  isPantryStaple: integer('is_pantry_staple', { mode: 'boolean' }).default(false),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  totalPrice: integer('total_price').notNull(),
  substitutionPolicy: text('substitution_policy').notNull(), // 'auto_similar' | 'whatsapp_confirm' | 'auto_refund'
  status: text('status').notNull().default('pending'),
  foodWasteSavedKg: real('food_waste_saved_kg'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: integer('price_at_purchase').notNull(),
});

export const userWasteLogs = sqliteTable('user_waste_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  foodWasteSavedKg: real('food_waste_saved_kg').default(0),
  plasticSavedPcs: integer('plastic_saved_pcs').default(0),
  moneySavedIdr: integer('money_saved_idr').default(0),
});
```

---

## 4. Cloudflare Environment & Binding Setup (`wrangler.jsonc`)

Agar Hono dapat mengakses database Cloudflare D1, binding D1 harus disetup pada konfigurasi Wrangler:

```jsonc
// wrangler.jsonc
{
  "name": "backend",
  "main": "src/index.ts",
  "compatibility_date": "2026-08-11",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "sayurin",
      "database_id": "your-cloudflare-d1-database-id"
    }
  ]
  // JWT_SECRET: taruh di .dev.vars (local) / wrangler secret (prod)
}
```

**Local secrets** (`.dev.vars`, jangan commit):
```
JWT_SECRET=dev-secret-change-me
```

---

## 5. Endpoints & API Route Specifications

### 5.1 Products Endpoints (`/api/v1/products`)

#### GET `/api/v1/products`
- **Description**: Mengambil katalog produk sayur dengan filter nutrisi dari D1.
- **Query Parameters**:
  - `nutrition`: `fiber` | `iron` | `low_carb` | `uric_acid_safe` (Optional)
  - `search`: `string` (Optional)
  - `sort`: `price_asc` | `price_desc` | `name` (Optional, Phase 4.5)

#### GET `/api/v1/products/:id`
- **Description**: Detail satu produk.
- **Errors**: `NOT_FOUND`

---

### 5.2 Recipe Smart Shopping Endpoints (`/api/v1/recipes`)

#### GET `/api/v1/recipes`
- **Description**: List resep (ringkas).

#### GET `/api/v1/recipes/:id`
- **Description**: Mengambil detail resep beserta daftar bahan baku standar dari D1 (join ingredients + products).

#### POST `/api/v1/recipes/:id/calculate-cart`
- **Description**: Menghitung takaran gramasi dan memfilter bahan baku berdasarkan kalkulator porsi & centangan pantry.
- **Request Body (Zod Schema)**:
```json
{
  "servings": 4,
  "pantry_ingredient_ids": ["ingredient-uuid-bawang-putih", "ingredient-uuid-bawang-merah"]
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "target_servings": 4,
    "items_to_buy": [
      {
        "product_id": "prod-uuid-daging-ayam",
        "product_name": "Daging Ayam Fillet",
        "calculated_amount": 500,
        "unit": "gram",
        "price": 38500
      }
    ],
    "items_in_pantry_count": 2,
    "total_estimated_price": 38500
  }
}
```

---

### 5.3 Auth Endpoints (`/api/v1/auth`)

#### POST `/api/v1/auth/register`
```json
{ "email": "user@mail.com", "password": "secret123", "name": "Ardy" }
```

#### POST `/api/v1/auth/login`
```json
{ "email": "user@mail.com", "password": "secret123" }
```
**Response**: `{ "success": true, "data": { "token": "<jwt>", "user": { "id", "email", "name" } } }`

---

### 5.4 Cart & Checkout Endpoints (`/api/v1/checkout`)

#### POST `/api/v1/checkout`
- **Authentication**: Required (JWT Bearer)
- **Description**: Memproses checkout pesanan dan menetapkan aturan substitusi otomatis pada D1 via Drizzle/D1 Transaction.
- **Request Body**:
```json
{
  "items": [
    { "product_id": "prod-uuid-1", "quantity": 2 }
  ],
  "substitution_policy": "auto_similar",
  "shipping_address_id": "addr-uuid-123"
}
```
- **Errors**: `UNAUTHORIZED` | `NOT_FOUND` | `STOCK_OUT` | `VALIDATION_ERROR`

---

### 5.5 Impact & Waste Tracker Endpoints (`/api/v1/users/waste-log`)

#### GET `/api/v1/users/waste-log`
- **Authentication**: Required (JWT Bearer)
- **Response**:
```json
{
  "success": true,
  "data": {
    "food_waste_saved_kg": 4.2,
    "plastic_saved_pcs": 18,
    "money_saved_idr": 125000,
    "user_level": "Eco Warrior"
  }
}
```

---

## 6. Hono Context & D1 Access Architecture

### 6.1 Cloudflare Binding Type Definition

```typescript
import { Hono } from 'hono';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  db: DrizzleD1Database<typeof schema>;
  userId?: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Helper Drizzle ORM Instance
app.use('*', async (c, next) => {
  const db = drizzle(c.env.DB, { schema });
  c.set('db', db);
  await next();
});

// Example Route Accessing D1
app.get('/api/v1/products', async (c) => {
  const db = c.get('db');
  const allProducts = await db.select().from(schema.products);
  return c.json({ success: true, data: allProducts });
});

export default app;
```

### 6.2 Standardized Error Response Structure

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input porsi harus lebih dari 0",
    "details": []
  }
}
```

**Error codes**
| Code | HTTP | Kapan |
|------|------|-------|
| `VALIDATION_ERROR` | 400 | Zod / business validation gagal |
| `UNAUTHORIZED` | 401 | Token hilang/invalid |
| `NOT_FOUND` | 404 | Resource tidak ada |
| `STOCK_OUT` | 409 | Stok tidak cukup |
| `D1_EXECUTION_ERROR` | 500 | Query/transaction gagal |

### 6.3 Success Response Structure

```json
{
  "success": true,
  "data": {}
}
```

---

## 7. Current Implementation Snapshot

Ringkasan status kode di `apps/backend` (update saat fase selesai):

| Area | Status | Catatan |
|------|--------|---------|
| Hono app + D1 binding | `[x]` | `wrangler.jsonc` + middleware db |
| `schema.ts` | `[x]` | 7 tabel |
| Migrations / drizzle-kit | `[ ]` | belum generate/apply |
| Seed data | `[ ]` | — |
| Products list | `[~]` | tanpa filter nutrition/search |
| Recipe detail | `[~]` | tanpa join ingredients |
| calculate-cart | `[~]` | masih mock |
| Auth JWT | `[ ]` | — |
| Checkout real transaction | `[ ]` | mock message |
| Waste log real | `[ ]` | mock numbers |
| Deploy | `[ ]` | — |

**Next recommended step**: **Phase 1.2–1.4** (drizzle config + migration local), lalu **Phase 2 seed**, lalu selesaikan **Phase 4 filter products**.

---

## 8. Working Agreement (agar tetap terarah)

1. **Satu fase aktif** — selesaikan acceptance criteria fase sebelum pindah.
2. **Update checklist status** di Section 2 setiap PR/commit berarti.
3. **Mock hanya sementara** — ganti mock sebelum menganggap fase done.
4. **Schema dulu, endpoint kemudian** — ubah tabel lewat migration, bukan ad-hoc SQL di handler.
5. **Contract response tetap** — frontend mengandalkan `{ success, data | error }`.
6. **Local first** — semua fitur harus lulus di `wrangler dev` + D1 `--local` sebelum remote.
