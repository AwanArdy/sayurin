import { useEffect, useState } from 'react'
import { getProducts, type Product } from '../lib/api'
import { demoProducts } from '../data/demo'
import { ProductCardCompact, ProductCardGrid } from '../components/ProductCard'
import { Icon } from '../components/Icon'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(demoProducts)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')

  useEffect(() => {
    let cancelled = false
    getProducts()
      .then((p) => {
        if (!cancelled && p.length) setProducts(p)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = products
    .filter((p) => (search ? p.name.toLowerCase().includes(search.toLowerCase()) : true))
    .sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      if (sort === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-[48px]">
      <header className="mb-8">
        <h1 className="text-[32px] font-bold leading-10 text-primary">Katalog Sayur Segar</h1>
        <p className="mt-1 text-[18px] leading-7 text-on-surface-variant">
          Semua produk langsung dari kebun mitra petani lokal.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari sayuran…"
            className="w-full rounded-full border border-primary/10 bg-surface-container-lowest py-2 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 rounded-full border border-primary/20 bg-surface-container-lowest px-4 text-sm text-on-surface outline-none focus:border-primary"
        >
          <option value="">Urutkan</option>
          <option value="price_asc">Harga Termurah</option>
          <option value="price_desc">Harga Tertinggi</option>
          <option value="name">Nama A-Z</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <div key={product.id}>
            <div className="hidden md:block">
              <ProductCardGrid product={product} />
            </div>
            <div className="md:hidden">
              <ProductCardCompact product={product} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}