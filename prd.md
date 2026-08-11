# PRODUCT REQUIREMENT DOCUMENT (PRD.MD)
## Backend API Specifications: E-Commerce Sayur Online (Cloudflare D1 & Hono)

---

## 1. Executive Summary & Tech Stack

Dokumen ini berisi spesifikasi teknis dan fungsional khusus **Backend Service** untuk platform e-commerce sayur online. Service ini dibangun dengan arsitektur modern yang *ultra-lightweight*, berjalan di **Cloudflare Workers / Pages** menggunakan **Cloudflare D1** sebagai *native edge relational database*.

### Tech Stack Details
- **Language**: TypeScript (`^5.0.0`)
- **Web Framework**: Hono (`hono` - Edge-first, web standards-based framework)
- **Runtime Environment**: Cloudflare Workers / Pages (`workerd`)
- **Database Engine**: **Cloudflare D1** (Serverless SQL Database based on SQLite)
- **Database ORM / Query Builder**: Drizzle ORM (`drizzle-orm/cloudflare-d1`)
- **Validation Library**: Zod (`@hono/zod-validator`)
- **Authentication**: JWT (JSON Web Token via `hono/jwt`)

---

## 2. Cloudflare D1 & Drizzle Schema Definitions

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

## 3. Cloudflare Environment & Binding Setup (`wrangler.toml`)

Agar Hono dapat mengakses database Cloudflare D1, binding D1 harus disetup pada konfigurasi Wrangler:

```toml
# wrangler.toml
name = "sayur-backend-api"
main = "src/index.ts"
compatibility_date = "2026-01-01"

[[d1_databases]]
binding = "DB" # Diakses via env.DB di Hono
database_name = "sayur-ecommerce-db"
database_id = "your-cloudflare-d1-database-id"
```

---

## 4. Endpoints & API Route Specifications

### 4.1 Products Endpoints (`/api/v1/products`)

#### GET `/api/v1/products`
- **Description**: Mengambil katalog produk sayur dengan filter nutrisi dari D1.
- **Query Parameters**:
  - `nutrition`: `fiber` | `iron` | `low_carb` | `uric_acid_safe` (Optional)
  - `search`: `string` (Optional)

---

### 4.2 Recipe Smart Shopping Endpoints (`/api/v1/recipes`)

#### GET `/api/v1/recipes/:id`
- **Description**: Mengambil detail resep beserta daftar bahan baku standar dari D1.

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

### 4.3 Cart & Checkout Endpoints (`/api/v1/checkout`)

#### POST `/api/v1/checkout`
- **Description**: Memproses checkout pesanan dan menetapkan aturan substitusi otomatis pada D1 via Drizzle Transaction.
- **Request Body**:
```json
{
  "items": [
    { "product_id": "prod-uuid-1", "quantity": 2 }
  ],
  "substitution_policy": "auto_similar", // "auto_similar" | "whatsapp_confirm" | "auto_refund"
  "shipping_address_id": "addr-uuid-123"
}
```

---

### 4.4 Impact & Waste Tracker Endpoints (`/api/v1/users/waste-log`)

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

## 5. Hono Context & D1 Access Architecture

### 5.1 Cloudflare Binding Type Definition

```typescript
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Definisi Environment Bindings Cloudflare
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Helper Drizzle ORM Instance
app.use('*', async (c, next) => {
  const db = drizzle(c.env.DB, { schema });
  c.set('db', db); // Menyimpan instance Drizzle ke Context
  await next();
});

// Example Route Accessing D1
app.get('/api/v1/products', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const allProducts = await db.select().from(schema.products);
  return c.json({ success: true, data: allProducts });
});

export default app;
```

### 5.2 Standardized Error Response Structure

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR", // "UNAUTHORIZED" | "NOT_FOUND" | "STOCK_OUT" | "D1_EXECUTION_ERROR"
    "message": "Input porsi harus lebih dari 0",
    "details": []
  }
}
```
