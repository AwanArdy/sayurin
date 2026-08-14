import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../lib/api'
import { AppStoreContext, type CartLine } from './context'

interface UIState {
  cartOpen: boolean
  nutritionProduct: Product | null
  substitutionOpen: boolean
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([])
  const [ui, setUi] = useState<UIState>({
    cartOpen: false,
    nutritionProduct: null,
    substitutionOpen: false,
  })

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id)
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, qty: l.qty + qty } : l,
        )
      }
      return [...prev, { product, qty }]
    })
  }, [])

  const updateQty = useCallback((productId: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((l) => l.product.id !== productId)
      return prev.map((l) => (l.product.id === productId ? { ...l, qty } : l))
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.product.id !== productId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const { cartCount, cartSubtotal } = useMemo(() => {
    const count = cart.reduce((sum, l) => sum + l.qty, 0)
    const subtotal = cart.reduce((sum, l) => sum + l.qty * l.product.price, 0)
    return { cartCount: count, cartSubtotal: subtotal }
  }, [cart])

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartSubtotal,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      cartOpen: ui.cartOpen,
      openCart: () => setUi((s) => ({ ...s, cartOpen: true })),
      closeCart: () => setUi((s) => ({ ...s, cartOpen: false })),
      nutritionProduct: ui.nutritionProduct,
      openNutrition: (product: Product) => setUi((s) => ({ ...s, nutritionProduct: product })),
      closeNutrition: () => setUi((s) => ({ ...s, nutritionProduct: null })),
      substitutionOpen: ui.substitutionOpen,
      openSubstitution: () => setUi((s) => ({ ...s, substitutionOpen: true })),
      closeSubstitution: () => setUi((s) => ({ ...s, substitutionOpen: false })),
    }),
    [
      cart,
      cartCount,
      cartSubtotal,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      ui,
    ],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}