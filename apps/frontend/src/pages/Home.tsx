import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getRecipes, type Product, type Recipe } from '../lib/api'
import { demoProducts, demoRecipes } from '../data/demo'
import { heroImageDesktop } from '../lib/images'
import { ProductCardCompact, ProductCardGrid } from '../components/ProductCard'
import { RecipeCardGrid, RecipeCardRow } from '../components/RecipeCard'
import { Icon } from '../components/Icon'

interface ProductTileProps {
  product: Product
}

function ProductTile({ product }: ProductTileProps) {
  return (
    <>
      <div className="hidden md:block">
        <ProductCardGrid product={product} />
      </div>
      <div className="md:hidden">
        <ProductCardCompact product={product} />
      </div>
    </>
  )
}

const NUTRITION_FILTERS = [
  { key: 'fiber', label: 'Kaya Serat' },
  { key: 'iron', label: 'Zat Besi' },
  { key: 'low_carb', label: 'Rendah Kalori' },
  { key: 'uric_acid_safe', label: 'Aman Asam Urat' },
]

export function Home() {
  const [products, setProducts] = useState<Product[]>(demoProducts)
  const [recipes, setRecipes] = useState<Recipe[]>(demoRecipes)
  const [activeNutrition, setActiveNutrition] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([getProducts(), getRecipes()])
      .then(([p, r]) => {
        if (cancelled) return
        if (p.length) setProducts(p)
        if (r.length) setRecipes(r)
      })
      .catch(() => {
        // fallback ke demo data
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const applyFilter = (key: string) => {
    setActiveNutrition(key)
  }

  const filteredProducts = activeNutrition
    ? products.filter((p) => {
        try {
          const tags = JSON.parse(p.nutritionTags ?? '[]') as string[]
          return tags.includes(activeNutrition)
        } catch {
          return false
        }
      })
    : products

  return (
    <>
      <main className="mx-auto w-full max-w-[1200px] space-y-[48px] px-6 pt-8 pb-[48px] md:pt-[48px]">
        {/* ===== Hero Banner ===== */}
        <section className="relative w-full overflow-hidden rounded-[24px] bg-surface-container-low">
          {/* Desktop hero (image background + card) */}
          <div className="relative hidden min-h-[400px] flex-col justify-center items-start p-8 md:flex md:p-16">
            <img
              className="absolute inset-0 h-full w-full object-cover opacity-60"
              src={heroImageDesktop}
              alt="Sayuran segar organik"
            />
            <div className="relative z-10 max-w-2xl rounded-xl bg-surface-container-lowest/80 p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md">
              <h1 className="mb-4 text-[32px] font-bold leading-[38px] tracking-[-0.02em] text-primary">
                Masak Lebih Sehat dengan Resep Pilihan
              </h1>
              <p className="mb-8 text-[18px] leading-7 text-on-surface-variant">
                Belanja bahan masakan segar langsung dari resep favorit Anda.
              </p>
              <Link
                to="/resep"
                className="inline-flex items-center gap-2 rounded-full bg-primary-container px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.05em] text-on-primary transition-colors hover:bg-primary"
              >
                Mulai Belanja
                <Icon name="arrow_forward" size={16} />
              </Link>
            </div>
          </div>

          {/* Mobile hero (green backdrop) */}
          <div className="md:hidden">
            <div className="relative flex h-72 flex-col justify-end bg-primary-container p-6 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url('${heroImageDesktop}')` }}
              />
              <div className="relative z-10">
                <h1 className="mb-2 text-[24px] font-bold leading-8 text-on-primary">
                  Masak Lebih Sehat
                </h1>
                <p className="mb-4 max-w-md text-[14px] leading-5 text-on-primary-container">
                  Bahan segar organik langsung dari kebun ke dapur Anda. Pesan sekarang untuk
                  pengiriman besok pagi.
                </p>
                <button
                  type="button"
                  className="self-start rounded-full bg-on-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.05em] text-primary-container transition-transform hover:scale-95"
                >
                  Belanja Sekarang
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Nutrition filter bar ===== */}
        <section>
          <h2 className="mb-4 text-[24px] font-semibold leading-8 text-on-surface">
            Pilih Kebutuhan Nutrisi
          </h2>
          <div className="hide-scrollbar flex snap-x gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => applyFilter('')}
              className={`shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.05em] transition-all ${
                activeNutrition === ''
                  ? 'border-transparent bg-primary-container text-on-primary'
                  : 'border-primary/20 bg-surface-container-lowest text-primary hover:bg-surface-container-low'
              }`}
            >
              Semua
            </button>
            {NUTRITION_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => applyFilter(f.key)}
                className={`shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.05em] transition-all ${
                  activeNutrition === f.key
                    ? 'border-transparent bg-primary-container text-on-primary'
                    : 'border-primary/20 bg-surface-container-lowest text-primary hover:bg-surface-container-low'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* ===== Recipes ===== */}
        <section>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-[24px] font-semibold leading-8 text-on-surface">
              Inspirasi Resep
            </h2>
            <Link
              to="/resep"
              className="flex items-center gap-1 text-[14px] font-semibold text-primary hover:underline"
            >
              Lihat Semua
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          {/* Desktop grid */}
          <div className="hidden grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 md:grid">
            {recipes.slice(0, 4).map((recipe) => (
              <RecipeCardGrid key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {/* Mobile rows */}
          <div className="flex flex-col gap-4 md:hidden">
            {recipes.slice(0, 4).map((recipe) => (
              <RecipeCardRow key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>

        {/* ===== Products ===== */}
        <section>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-[24px] font-semibold leading-8 text-on-surface">
              Sayur Segar Pilihan
            </h2>
            <Link
              to="/produk"
              className="flex items-center gap-1 text-[14px] font-semibold text-primary hover:underline"
            >
              Lihat Semua
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        </section>

        {loading && (
          <p className="sr-only" role="status">
            Memuat data…
          </p>
        )}
      </main>
    </>
  )
}