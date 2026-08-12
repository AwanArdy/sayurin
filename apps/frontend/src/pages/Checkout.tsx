import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createCheckout, type SubstitutionPolicy } from '../lib/api'
import { formatRupiah } from '../lib/format'
import { productImage } from '../lib/images'
import { useAppStore } from '../store/AppStore'
import { Icon } from '../components/Icon'
import { SubstitutionModal } from '../components/SubstitutionModal'

const DELIVERY_FEE = 15000

const POLICIES: { value: SubstitutionPolicy; title: string; desc: string }[] = [
  {
    value: 'auto_similar',
    title: 'Otomatis Ganti',
    desc: 'Kami akan mengganti dengan barang serupa berkualitas.',
  },
  {
    value: 'whatsapp_confirm',
    title: 'Konfirmasi via WA',
    desc: 'Tim kami akan menghubungi Anda untuk konfirmasi.',
  },
  {
    value: 'auto_refund',
    title: 'Refund Otomatis',
    desc: 'Dana akan dikembalikan untuk barang yang kosong.',
  },
]

export function Checkout() {
  const { cart, cartSubtotal, openCart } = useAppStore()
  const [policy, setPolicy] = useState<SubstitutionPolicy>('auto_similar')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const items = useMemo(
    () => cart.map((line) => ({ product_id: line.product.id, quantity: line.qty })),
    [cart],
  )
  const total = cartSubtotal + DELIVERY_FEE

  const pay = async () => {
    const token = localStorage.getItem('sayurin_token')
    if (token) {
      setSubmitting(true)
      setStatus('idle')
      try {
        await createCheckout(token, {
          items,
          substitution_policy: policy,
          shipping_address_id: 'addr-1',
        })
        setStatus('success')
      } catch (e) {
        setStatus('error')
        setErrorMsg(e instanceof Error ? e.message : 'Terjadi kesalahan')
      } finally {
        setSubmitting(false)
      }
    } else {
      // Tanpa login tetap bisa simulasi di frontend
      setStatus('success')
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-6 md:py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-[24px] font-bold leading-8 text-primary"
        >
          <Icon name="eco" size={20} filled />
          Sayurin <span className="hidden text-on-surface sm:inline">&middot;</span>
          <span className="hidden text-on-surface sm:inline">Checkout</span>
        </Link>
        <span className="flex items-center gap-1 text-[14px] font-semibold text-primary">
          <Icon name="lock" size={18} filled />
          Secure
        </span>
      </div>

      {/* Empty cart */}
      {cart.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-container text-primary-container">
            <Icon name="shopping_cart" size={40} />
          </span>
          <h1 className="text-[24px] font-semibold leading-8 text-primary">
            Keranjang belum ada isinya
          </h1>
          <p className="text-on-surface-variant">
            Tambahkan produk dulu sebelum lanjut ke checkout.
          </p>
          <button
            type="button"
            onClick={openCart}
            className="rounded-full bg-primary-container px-6 py-3 text-[14px] font-semibold text-on-primary"
          >
            Buka Keranjang
          </button>
        </div>
      )}

      {cart.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Left: shipping & payment */}
          <div className="flex flex-col gap-4 md:col-span-4">
            <section className="flex flex-col gap-3 rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-[24px] font-semibold leading-8 text-on-surface">
                  Alamat Pengiriman
                </h2>
                <button type="button" className="text-[14px] font-semibold text-primary-container hover:underline">
                  Ubah
                </button>
              </div>
              <div className="flex flex-col gap-1 text-[16px] leading-6 text-on-surface-variant">
                <span className="font-bold text-on-surface">Budi Santoso</span>
                <span>Jl. Sudirman No. 45, Kebayoran Baru</span>
                <span>Jakarta Selatan, DKI Jakarta 12190</span>
                <span>0812-3456-7890</span>
              </div>
            </section>

            <section className="flex flex-col gap-3 rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-[24px] font-semibold leading-8 text-on-surface">
                  Metode Pembayaran
                </h2>
                <button type="button" className="text-[14px] font-semibold text-primary-container hover:underline">
                  Ubah
                </button>
              </div>
              <div className="flex items-center gap-3 text-[16px] leading-6 text-on-surface-variant">
                <Icon name="account_balance_wallet" size={24} className="text-primary-container" />
                <span>GoPay - Saldo: Rp 500.000</span>
              </div>
            </section>
          </div>

          {/* Center: substitution policy */}
          <div className="flex flex-col gap-4 md:col-span-4">
            <section className="flex flex-col gap-4 rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <div>
                <h2 className="mb-1 text-[24px] font-semibold leading-8 text-on-surface">
                  Kebijakan Substitusi Otomatis
                </h2>
                <p className="mb-3 text-[16px] leading-6 text-on-surface-variant">
                  Pilih apa yang terjadi jika barang yang Anda pesan kosong.
                </p>
              </div>
              <fieldset className="flex flex-col gap-3">
                <legend className="sr-only">Opsi Substitusi</legend>
                {POLICIES.map((pol) => {
                  const selected = policy === pol.value
                  return (
                    <label
                      key={pol.value}
                      className={`relative cursor-pointer rounded-[24px] transition-all ${
                        selected
                          ? 'border-2 border-primary-container bg-[#EEF5F7] p-[19px] shadow-sm'
                          : 'border border-outline-variant bg-surface-container-lowest p-5 hover:bg-surface-container-low'
                      }`}
                    >
                      <input
                        type="radio"
                        name="substitution"
                        value={pol.value}
                        checked={selected}
                        onChange={() => setPolicy(pol.value)}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected ? 'border-primary-container' : 'border-outline'
                          }`}
                        >
                          {selected && <div className="h-2.5 w-2.5 rounded-full bg-primary-container" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[18px] font-semibold leading-7 text-on-surface">
                            {pol.title}
                          </span>
                          <span className="text-[16px] leading-6 text-on-surface-variant">
                            {pol.desc}
                          </span>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </fieldset>
              <button
                type="button"
                className="self-start text-[14px] font-semibold text-primary-container hover:underline"
              >
                Pelajari Lebih Lanjut
              </button>
            </section>
          </div>

          {/* Right: order summary */}
          <div className="flex flex-col gap-4 md:col-span-4">
            <section className="sticky top-[76px] flex flex-col gap-4 rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-sm md:top-[100px]">
              <h2 className="border-b border-outline-variant pb-2 text-[24px] font-semibold leading-8 text-on-surface">
                Ringkasan Pesanan
              </h2>

              <div className="flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-1">
                {cart.map((line) => (
                  <div key={line.product.id} className="flex items-center gap-3">
                    <img
                      className="h-16 w-16 rounded-lg bg-surface-container-low object-cover"
                      src={productImage(line.product)}
                      alt={line.product.name}
                    />
                    <div className="flex flex-1 flex-col">
                      <span className="text-[16px] font-semibold leading-6 text-on-surface">
                        {line.product.name}
                      </span>
                      <span className="text-[12px] leading-4 text-on-surface-variant">
                        {line.qty} x {formatRupiah(line.product.price)}
                      </span>
                    </div>
                    <span className="text-[16px] font-semibold leading-6 text-on-surface">
                      {formatRupiah(line.qty * line.product.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-1 border-t border-outline-variant" />

              <div className="flex flex-col gap-1 text-[16px] leading-6">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>{formatRupiah(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Ongkos Kirim</span>
                  <span>{formatRupiah(DELIVERY_FEE)}</span>
                </div>
                <div className="mt-2 flex justify-between text-[24px] font-semibold leading-8 text-on-surface">
                  <span>Total</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>

              {status === 'success' && (
                <div className="rounded-xl bg-primary-fixed p-3 text-center text-[14px] font-semibold text-primary">
                  Pesanan berhasil dibuat! Terima kasih sudah berbelanja di Sayurin.
                </div>
              )}
              {status === 'error' && (
                <div className="rounded-xl bg-error-container p-3 text-center text-[14px] font-semibold text-on-error-container">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                disabled={submitting}
                onClick={pay}
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary-container py-3 text-[16px] font-semibold leading-6 text-on-primary shadow-sm transition-all hover:bg-primary hover:shadow-md disabled:opacity-60"
              >
                {submitting ? 'Memproses…' : 'Bayar & Buat Pesanan'}
              </button>
            </section>
          </div>
        </div>
      )}

      <SubstitutionModal value={policy} onSave={setPolicy} />
    </main>
  )
}