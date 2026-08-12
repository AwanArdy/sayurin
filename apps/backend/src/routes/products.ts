import { Hono } from "hono";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { like, or, asc, desc, eq, and, type SQL } from "drizzle-orm";
import * as schema from '../schema';
import { success, fail } from "../lib/response";
import { parseLimit, parseOffset } from "../lib/pagination";

type Variables = {
  db: DrizzleD1Database<typeof schema>;
};

const productsRoutes = new Hono<{ Variables: Variables }>();

productsRoutes.get('/', async (c) => {
  const db = c.get('db');

  const search = c.req.query('search');
  const nutrition = c.req.query('nutrition');
  const sort = c.req.query('sort');
  const limit = parseLimit(c.req.query('limit'));
  const offset = parseOffset(c.req.query('offset'));

  const conditions: SQL[] = [];

  if (search) {
    const searchCondition = or(
      like(schema.products.name, `%${search}%`),
      like(schema.products.slug, `%${search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (nutrition) {
    conditions.push(like(schema.products.nutritionTags, `%${nutrition}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderByClause = undefined;
  if (sort === 'price_asc') {
    orderByClause = asc(schema.products.price);
  } else if (sort === 'price_desc') {
    orderByClause = desc(schema.products.price);
  } else if (sort === 'name') {
    orderByClause = asc(schema.products.name);
  }

  const allProducts = await db.select()
    .from(schema.products)
    .where(whereClause)
    .orderBy(orderByClause ? orderByClause : asc(schema.products.id))
    .limit(limit)
    .offset(offset);

  c.header('Cache-Control', 'public, max-age=60, s-maxage=60');
  return c.json(success(allProducts));
});

productsRoutes.get('/:id', async (c) => {
  const db = c.get('db');
  const idOrSlug = c.req.param('id');
  
  const product = await db.select()
    .from(schema.products)
    .where(
      or(
        eq(schema.products.id, idOrSlug),
        eq(schema.products.slug, idOrSlug)
      )
    )
    .get();

  if (!product) {
    return c.json(fail('NOT_FOUND', 'Produk tidak ditemukan'), 404);
  }

  return c.json(success(product));
});

export default productsRoutes;
