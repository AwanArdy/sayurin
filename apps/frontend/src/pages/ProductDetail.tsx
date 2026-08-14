import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProduct, type Product } from '../lib/api'
import { demoProducts } from '../data/demo'
import { formatRupiah, nutritionLabel, parseNutritionTags } from '../lib/format'
import { productImage } from '../lib/images'
import { useAppStore } from '../store/context'
import { Icon } from '../components/Icon'
import { Stepper } from '../components/Stepper'

export function ProductDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { addToCart, openNutrition, openCart } = useAppStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getProduct(id)
      .then((p) => {
        if (!cancelled) setProduct(p)
      })
      .catch(() => {
        const demo = demoProducts.find(
          (p) => p.id === id || p.slug === id,
        )
        if (!cancelled) setProduct(demo ?? null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-6 py-[48px] text-center text-on-surface-variant">
        Memuat produk…
      </main>
    )
  }

  if (!product) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-6 py-[48px] text-center">
        <h1 className="text-[24px] font-bold text-primary">Produk tidak ditemukan</h1>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 rounded-full bg-primary-container px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.05em] text-on-primary"
        >
          Kembali ke Beranda
        </button>
      </main>
    )
  }

  const tags = parseNutritionTags(product.nutritionTags)
  const addAndOpenCart = () => {
    addToCart(product, qty)
    openCart()
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 pt-6 pb-32 md:py-[48px]">
      {/* Breadcrumbs */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[14px] leading-6 text-secondary">
        <Link to="/" className="transition-colors hover:text-primary-container">
          Beranda
        </Link>
        <Icon name="chevron_right" size={16} />
        <Link to="/produk" className="transition-colors hover:text-primary-container">
          Produk
        </Link>
        <Icon name="chevron_right" size={16} />
        <span className="font-bold text-primary">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
        {/* Left: imagery */}
        <div className="flex flex-col gap-4">
          <div className="group aspect-square overflow-hidden rounded-[24px] bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <img
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={productImage(product)}
              alt={product.name}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-primary bg-surface-container-lowest">
              <img className="h-full w-full object-cover" src={productImage(product)} alt="" />
            </div>
            <div className="aspect-square cursor-pointer overflow-hidden rounded-lg border border-primary/10 bg-surface-container-lowest opacity-70 transition-all hover:border-primary/50 hover:opacity-100">
              <div className="flex h-full w-full items-center justify-center p-2">
                <img className="h-full w-full object-cover" src={productImage(product)} alt="" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: details */}
        <div className="flex flex-col">
          <h1 className="mb-2 text-[24px] font-bold leading-8 text-on-surface md:text-[32px] md:leading-10">
            {product.name}
          </h1>
          <p className="mb-6 text-[24px] font-semibold leading-8 text-primary">
            {formatRupiah(product.price)}{' '}
            <span className="text-[14px] font-normal leading-6 text-secondary">
              / {product.unit}
            </span>
          </p>

          {tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => openNutrition(product)}
                  className="rounded-full border-2 border-primary bg-surface-container-lowest px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-primary transition-colors hover:bg-primary hover:text-on-primary"
                >
                  {nutritionLabel(tag)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => openNutrition(product)}
                className="flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-primary-container transition-colors hover:bg-surface-container"
              >
                <Icon name="info" size={14} />
                Info Gizi Lengkap
              </button>
            </div>
          )}

          <div className="mb-8 text-[16px] leading-6 text-on-surface-variant">
            <p>
              {product.name} segar yang dipanen langsung dari mitra petani lokal kami setiap pagi.
              Ditanam sepenuhnya tanpa pestisida sintetis, menjaga kualitas nutrisi alami dan rasa
              yang lebih manis serta tekstur yang renyah.
            </p>
          </div>

          {/* Freshness tracker */}
          <div className="mb-8 rounded-xl border-2 border-primary bg-surface-container-lowest p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex items-center gap-3">
              <Icon name="schedule" size={24} className="text-primary" />
              <h3 className="text-[24px] font-semibold leading-8 text-primary">
                Indikator Kesegaran &amp; Masa Simpan
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-lg border border-primary/20 bg-surface p-4 text-center">
                <Icon name="device_thermostat" size={24} className="mb-2 text-secondary" />
                <span className="mb-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-secondary">
                  Suhu Ruang
                </span>
                <span className="text-[16px] font-bold leading-6 text-primary">
                  {product.shelfLifeRoomDays ? `${product.shelfLifeRoomDays} Hari` : '1-2 Hari'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-primary/20 bg-surface p-4 text-center">
                <Icon name="ac_unit" size={24} className="mb-2 text-secondary" />
                <span className="mb-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-secondary">
                  Kulkas / Chiller
                </span>
                <span className="text-[16px] font-bold leading-6 text-primary">
                  {product.shelfLifeChillerDays
                    ? `${product.shelfLifeChillerDays} Hari`
                    : '5-7 Hari'}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 border-t border-primary/10 pt-4 text-[14px] leading-6 text-on-surface-variant">
              <Icon name="info" size={16} className="mt-0.5 shrink-0 text-primary" />
              <p>
                <strong>Saran Penyimpanan:</strong>{' '}
                {product.storageTips ??
                  'Simpan di kulkas dalam wadah tertutup agar tetap segar lebih lama.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar (mobile) / inline (desktop) */}
      <div className="fixed inset-x-0 bottom-[76px] z-40 flex items-center justify-between border-t border-primary/10 bg-surface-container-lowest px-6 py-4 shadow-[0px_-10px_30px_rgba(0,0,0,0.05)] md:static md:bottom-0 md:mt-8 md:mx-auto md:max-w-[1200px] md:border-none md:bg-transparent md:p-0 md:shadow-none">
        <div className="flex w-full items-center gap-4 md:justify-end md:ml-auto">
          <Stepper value={qty} min={1} onChange={setQty} />
          <button
            type="button"
            onClick={addAndOpenCart}
            className="flex flex-grow items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-[16px] font-bold text-on-primary shadow-[0px_4px_20px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:opacity-90 active:scale-95 md:flex-grow-0"
          >
            <Icon name="add_shopping_cart" size={20} />
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </main>
  )
}