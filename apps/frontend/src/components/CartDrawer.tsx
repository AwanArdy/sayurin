import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatRupiah } from '../lib/format'
import { productImage } from '../lib/images'
import { useAppStore } from '../store/AppStore'
import { Icon } from './Icon'
import { Stepper } from './Stepper'

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    closeCart,
    cartSubtotal,
    updateQty,
    removeFromCart,
  } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [cartOpen])

  if (!cartOpen) return null

  const goCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      <button
        aria-label="Tutup keranjang"
        className="absolute inset-0 bg-primary-container/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l-2 border-primary-container bg-surface-container-lowest shadow-2xl transition-transform">
        {/* Header */}
        <div className="z-10 flex items-center justify-between border-b border-primary-container bg-surface-container-lowest p-6">
          <div>
            <h2 className="text-[24px] font-semibold leading-8 text-primary-container">
              Keranjang Belanja
            </h2>
            <p className="mt-1 text-[12px] leading-4 text-secondary">Kelola sayuran segar Anda</p>
          </div>
          <button
            type="button"
            aria-label="Tutup keranjang"
            onClick={closeCart}
            className="group flex items-center justify-center rounded-full p-2 text-primary-container transition-colors hover:bg-surface-container-low"
          >
            <Icon name="close" size={24} className="transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-surface-bright p-6">
          {cart.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-primary-container">
                <Icon name="shopping_basket" size={32} />
              </span>
              <p className="text-[16px] leading-6 text-on-surface-variant">
                Keranjang masih kosong.
                <br />
                Yuk mulai belanja sayur segar.
              </p>
            </div>
          )}
          {cart.map((line) => (
            <div
              key={line.product.id}
              className="group flex gap-4 rounded-[24px] border border-primary/10 bg-surface-container-lowest p-4 shadow-sm transition-colors hover:border-primary-container"
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container-low">
                <img
                  className="h-full w-full object-cover"
                  src={productImage(line.product)}
                  alt={line.product.name}
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold leading-5 text-on-surface">
                      {line.product.name}
                    </h3>
                    <p className="mt-1 text-[12px] leading-4 text-secondary">{line.product.unit}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Hapus ${line.product.name}`}
                    onClick={() => removeFromCart(line.product.id)}
                    className="p-1 text-secondary transition-colors hover:text-error"
                  >
                    <Icon name="delete" size={20} />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[14px] font-semibold leading-5 text-primary-container">
                    {formatRupiah(line.product.price)}
                  </span>
                  <Stepper
                    value={line.qty}
                    min={1}
                    onChange={(qty) => updateQty(line.product.id, qty)}
                    className="h-8 w-auto rounded-lg border border-[#E2E4E9] px-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="z-10 flex flex-col gap-4 border-t border-primary-container bg-surface-container-lowest p-6 shadow-[0px_-4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[16px] leading-6 text-secondary">Subtotal</span>
              <span className="text-[24px] font-semibold leading-8 text-primary-container">
                {formatRupiah(cartSubtotal)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg bg-[#EEF5F7] p-2">
              <Icon name="eco" size={16} className="text-primary-container" />
              <span className="text-[12px] leading-4 text-primary-container">
                Hemat ±1.2 kg food waste minggu ini
              </span>
            </div>
            <button
              type="button"
              onClick={goCheckout}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary-container py-4 text-[14px] font-semibold text-surface-container-lowest shadow-md transition-all hover:bg-primary hover:shadow-lg active:scale-[0.98]"
            >
              Checkout Sekarang
              <Icon name="arrow_forward" size={16} />
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}