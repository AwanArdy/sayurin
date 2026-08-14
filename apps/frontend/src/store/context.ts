import { createContext, useContext } from 'react'
import type { Product } from '../lib/api'

export interface CartLine {
  product: Product
  qty: number
  fromRecipe?: boolean
}

export interface AppStoreValue {
  cart: CartLine[]
  cartCount: number
  cartSubtotal: number
  addToCart: (product: Product, qty?: number) => void
  updateQty: (productId: string, qty: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
  nutritionProduct: Product | null
  openNutrition: (product: Product) => void
  closeNutrition: () => void
  substitutionOpen: boolean
  openSubstitution: () => void
  closeSubstitution: () => void
}

export const AppStoreContext = createContext<AppStoreValue | null>(null)

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore harus dipakai di dalam <AppStoreProvider>')
  return ctx
}