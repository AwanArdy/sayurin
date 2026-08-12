import { Hono } from "hono";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import * as schema from '../schema';
import { success, fail, formatZodError } from "../lib/response";
import { calculateCartSchema } from "../validators/schema";
import { parseLimit, parseOffset } from "../lib/pagination";

type Variables = {
  db: DrizzleD1Database<typeof schema>;
}

const recipesRoutes = new Hono<{ Variables: Variables }>();

// GET /api/v1/recipes (Phase 5.1) - List semua resep (opsional pagination)
recipesRoutes.get('/', async (c) => {
  const db = c.get('db');
  const limit = parseLimit(c.req.query('limit'));
  const offset = parseOffset(c.req.query('offset'));

  const allRecipes = await db.select().from(schema.recipes).limit(limit).offset(offset);

  c.header('Cache-Control', 'public, max-age=60, s-maxage=60');
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
recipesRoutes.post('/:id/calculate-cart', zValidator('json', calculateCartSchema, (result, c) => {
  if (!result.success) return c.json(formatZodError(result.error), 400);
}), async (c) => {
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
      productUnit: schema.products.unit,
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

  // Packing Rule V1: `products.price` adalah harga per SKU/kemasan,
  // ukuran kemasan tercantum pada `products.unit` (mis. "500 gram", "ikat", "pcs").
  // Estimasi = price * jumlah kemasan yang dibutuhkan = ceil(bahan / ukuran per kemasan).

  // Ekstrak besaran referensi dari unit produk, mis. "500 gram" -> 500; "ikat" -> 1.
  const parsePackSize = (productUnit: string | null): number => {
    const match = (productUnit ?? '').match(/(\d+(?:[.,]\d+)?)/);
    return match ? parseFloat(match[0].replace(',', '.')) : 1;
  };

  // Ingredient dalam satuan berat (gram/kg) bisa disamakan dengan unit produk berat.
  const isMassUnit = (unit: string | null): boolean => /g\b|gram|kg|kilo/i.test(unit ?? '');

  for (const ing of ingredients) {
    const calculated_amount = ing.amountPerServing * servings;
    
    // Cek apakah bahan/produk sudah ada di daftar pantry[cite: 3]
    if (pantry_ingredient_ids.includes(ing.ingredientId) || pantry_ingredient_ids.includes(ing.productId)) {
      items_in_pantry_count++;
      continue; // Lewati, tidak perlu dibeli
    }

    // Satuan bahan & produk kompatibel (mis. ikat == ikat) atau sama-sama berat
    const sameUnit = ing.unit === ing.productUnit;
    const bothMass = isMassUnit(ing.unit) && isMassUnit(ing.productUnit);
    const canScale = sameUnit || bothMass;

    const units_needed = canScale
      ? Math.max(1, Math.ceil(calculated_amount / parsePackSize(ing.productUnit)))
      : 1; // Unit tidak dapat dikonversi -> asumsikan 1 kemasan

    const estimated_price = ing.price * units_needed;

    // Masukkan ke keranjang belanja
    items_to_buy.push({
      product_id: ing.productId,
      product_name: ing.productName,
      calculated_amount,
      unit: ing.unit,
      units_needed,
      estimated_price,
      price: ing.price,
    });

    total_estimated_price += estimated_price;
  }

  return c.json(success({
    target_servings: servings,
    items_to_buy,
    items_in_pantry_count,
    total_estimated_price
  }));
});

export default recipesRoutes;
