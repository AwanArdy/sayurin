import { Hono } from "hono";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import * as schema from '../schema';
import { success, fail } from "../lib/response";
import { calculateCartSchema } from "../validators/schema";

type Variables = {
  db: DrizzleD1Database<typeof schema>;
}

const recipesRoutes = new Hono<{ Variables: Variables }>();

// GET /api/v1/recipes (Phase 5.1) - List semua resep
recipesRoutes.get('/', async (c) => {
  const db = c.get('db');
  const allRecipes = await db.select().from(schema.recipes);
  
  return c.json(success(allRecipes));
});

// GET /api/v1/recipes/:id (Phase 5.2) - Detail resep + ingredients
recipesRoutes.get('/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const recipe = await db.select().from(schema.recipes).where(eq(schema.recipes.id, id)).get();
  
  if (!recipe) {
    return c.json(fail('NOT_FOUND', 'Resep tidak ditemukan'), 404);
  }

  // Join table recipe_ingredients dan products[cite: 3]
  const ingredients = await db
    .select({
      id: schema.recipeIngredients.id,
      amountPerServing: schema.recipeIngredients.amountPerServing,
      unit: schema.recipeIngredients.unit,
      isPantryStaple: schema.recipeIngredients.isPantryStaple,
      product: schema.products,
    })
    .from(schema.recipeIngredients)
    .innerJoin(schema.products, eq(schema.recipeIngredients.productId, schema.products.id))
    .where(eq(schema.recipeIngredients.recipeId, id));

  return c.json(success({ ...recipe, ingredients }));
});

// POST /api/v1/recipes/:id/calculate-cart (Phase 5.3 - 5.8) - Kalkulator belanja
recipesRoutes.post('/:id/calculate-cart', zValidator('json', calculateCartSchema), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { servings, pantry_ingredient_ids } = c.req.valid('json');

  const recipe = await db.select().from(schema.recipes).where(eq(schema.recipes.id, id)).get();
  
  if (!recipe) {
    return c.json(fail('NOT_FOUND', 'Resep tidak ditemukan'), 404);
  }

  // Ambil data bahan beserta harga produk[cite: 3]
  const ingredients = await db
    .select({
      ingredientId: schema.recipeIngredients.id,
      productId: schema.products.id,
      productName: schema.products.name,
      price: schema.products.price,
      amountPerServing: schema.recipeIngredients.amountPerServing,
      unit: schema.recipeIngredients.unit,
    })
    .from(schema.recipeIngredients)
    .innerJoin(schema.products, eq(schema.recipeIngredients.productId, schema.products.id))
    .where(eq(schema.recipeIngredients.recipeId, id));

  const items_to_buy = [];
  let items_in_pantry_count = 0;
  let total_estimated_price = 0;

  // Algoritma pengecekan keranjang belanja[cite: 3]
  for (const ing of ingredients) {
    const calculated_amount = ing.amountPerServing * servings;
    
    // Cek apakah bahan/produk sudah ada di daftar pantry[cite: 3]
    if (pantry_ingredient_ids.includes(ing.ingredientId) || pantry_ingredient_ids.includes(ing.productId)) {
      items_in_pantry_count++;
      continue; // Lewati, tidak perlu dibeli
    }

    // Masukkan ke keranjang belanja
    items_to_buy.push({
      product_id: ing.productId,
      product_name: ing.productName,
      calculated_amount,
      unit: ing.unit,
      price: ing.price // Asumsi Packing Rule V1: 1 unit harga per bahan[cite: 3]
    });

    total_estimated_price += ing.price;
  }

  return c.json(success({
    target_servings: servings,
    items_to_buy,
    items_in_pantry_count,
    total_estimated_price
  }));
});

export default recipesRoutes;
