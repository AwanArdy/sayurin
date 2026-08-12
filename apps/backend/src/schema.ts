import { sqliteTable, text, integer, real, check, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
}); //[cite: 2]

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  price: integer('price').notNull(), 
  unit: text('unit').notNull(), 
  stock: integer('stock').default(0),
  shelfLifeRoomDays: integer('shelf_life_room_days'),
  shelfLifeChillerDays: integer('shelf_life_chiller_days'),
  nutritionTags: text('nutrition_tags'), 
  storageTips: text('storage_tips'),
}, (t) => [
  // Jaga stok tidak pernah negatif di level database (anti oversell).
  check('products_stock_non_negative', sql`${t.stock} >= 0`),
]); //[cite: 2]

export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  baseServings: integer('base_servings').default(2),
  cookingTimeMins: integer('cooking_time_mins'),
  instructions: text('instructions'), 
}); //[cite: 2]

export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id').notNull().references(() => recipes.id),
  productId: text('product_id').notNull().references(() => products.id),
  amountPerServing: real('amount_per_serving').notNull(),
  unit: text('unit'),
  isPantryStaple: integer('is_pantry_staple', { mode: 'boolean' }).default(false),
}, (t) => [
  index('recipe_ingredients_recipe_id_idx').on(t.recipeId),
  index('recipe_ingredients_product_id_idx').on(t.productId),
]); //[cite: 2]

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  totalPrice: integer('total_price').notNull(),
  substitutionPolicy: text('substitution_policy').notNull(), 
  status: text('status').notNull().default('pending'),
  foodWasteSavedKg: real('food_waste_saved_kg'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
}, (t) => [
  index('orders_user_id_idx').on(t.userId),
]); //[cite: 2]

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: integer('price_at_purchase').notNull(),
}, (t) => [
  index('order_items_order_id_idx').on(t.orderId),
  index('order_items_product_id_idx').on(t.productId),
]); //[cite: 2]

export const userWasteLogs = sqliteTable('user_waste_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  foodWasteSavedKg: real('food_waste_saved_kg').default(0),
  plasticSavedPcs: integer('plastic_saved_pcs').default(0),
  moneySavedIdr: integer('money_saved_idr').default(0),
}, (t) => [
  index('user_waste_logs_user_id_idx').on(t.userId),
]); //[cite: 2]
