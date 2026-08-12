export interface Product {
  id: string
  name: string
  slug: string
  price: number
  unit: string
  stock: number | null
  shelfLifeRoomDays: number | null
  shelfLifeChillerDays: number | null
  nutritionTags: string | null
  storageTips: string | null
}

export interface Recipe {
  id: string
  title: string
  slug: string
  baseServings: number | null
  cookingTimeMins: number | null
  instructions: string | null
}

export interface RecipeIngredient {
  id: string
  amountPerServing: number
  unit: string | null
  isPantryStaple: boolean
  product: Product
}

export interface RecipeDetail extends Recipe {
  ingredients: RecipeIngredient[]
}

export interface CartItem {
  product_id: string
  product_name: string
  calculated_amount: number
  unit: string
  units_needed: number
  estimated_price: number
  price: number
}

export interface CalculateCartResult {
  target_servings: number
  items_to_buy: CartItem[]
  items_in_pantry_count: number
  total_estimated_price: number
}

export interface WasteLog {
  food_waste_saved_kg: number
  plastic_saved_pcs: number
  money_saved_idr: number
  user_level: string
}

const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8787'

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const body = (await res.json()) as {
    success?: boolean
    data?: T
    error?: { code: string; message: string }
  }

  if (!res.ok || !body.success) {
    throw new Error(body.error?.message ?? `Request gagal (${res.status})`)
  }

  return body.data as T
}

export function getProducts(params?: {
  search?: string
  nutrition?: string
  sort?: string
}): Promise<Product[]> {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.nutrition) qs.set('nutrition', params.nutrition)
  if (params?.sort) qs.set('sort', params.sort)
  const query = qs.toString()
  return fetchJson<Product[]>(`/api/v1/products${query ? `?${query}` : ''}`)
}

export function getProduct(idOrSlug: string): Promise<Product> {
  return fetchJson<Product>(`/api/v1/products/${idOrSlug}`)
}

export function getRecipes(): Promise<Recipe[]> {
  return fetchJson<Recipe[]>('/api/v1/recipes')
}

export function getRecipe(id: string): Promise<RecipeDetail> {
  return fetchJson<RecipeDetail>(`/api/v1/recipes/${id}`)
}

export function calculateCart(
  id: string,
  body: { servings: number; pantry_ingredient_ids: string[] },
): Promise<CalculateCartResult> {
  return fetchJson<CalculateCartResult>(`/api/v1/recipes/${id}/calculate-cart`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export interface AuthUser {
  id: string
  email: string
  name: string
}

export function loginRequest(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  return fetchJson<{ token: string; user: AuthUser }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getWasteLog(token: string | null): Promise<WasteLog> {
  return fetchJson<WasteLog>('/api/v1/users/waste-log', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export type SubstitutionPolicy = 'auto_similar' | 'whatsapp_confirm' | 'auto_refund'

export function createCheckout(
  token: string,
  body: {
    items: { product_id: string; quantity: number }[]
    substitution_policy: string
    shipping_address_id: string
  },
): Promise<unknown> {
  return fetchJson<unknown>('/api/v1/checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}