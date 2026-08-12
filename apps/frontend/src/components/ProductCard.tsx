import { Link } from 'react-router-dom'
import type { Product } from '../lib/api'
import { formatRupiah } from '../lib/format'
import { productImage } from '../lib/images'
import { useAppStore } from '../store/AppStore'
import { Icon } from './Icon'

export function ProductCardGrid({ product }: { product: Product }) {
  const { addToCart } = useAppStore()

  return (
    <article className="flex h-full cursor-pointer flex-col items-center rounded-[24px] bg-surface-container-lowest p-4 text-center shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)]">
      <Link to={`/produk/${product.slug}`} className="flex w-full flex-col items-center">
        <div className="mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-surface-container-low p-2">
          <img
            className="h-full w-full object-contain"
            src={productImage(product)}
            alt={product.name}
            loading="lazy"
          />
        </div>
        <h3 className="mb-1 text-[18px] font-bold leading-7 text-on-surface">{product.name}</h3>
        <p className="mb-4 text-[14px] leading-6 text-on-surface-variant">{product.unit}</p>
        <p className="mb-4 text-[20px] font-bold text-primary">{formatRupiah(product.price)}</p>
      </Link>
      <button
        type="button"
        onClick={() => addToCart(product)}
        className="w-full rounded-full border-2 border-primary-container py-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-primary-container transition-colors hover:bg-primary-container hover:text-on-primary"
      >
        Beli Cepat
      </button>
    </article>
  )
}

export function ProductCardCompact({ product }: { product: Product }) {
  const { addToCart } = useAppStore()

  return (
    <div className="flex flex-col rounded-[20px] bg-surface-container-lowest p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)]">
      <Link to={`/produk/${product.slug}`} className="group">
        <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-surface-container-low">
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={productImage(product)}
            alt={product.name}
            loading="lazy"
          />
        </div>
        <h3 className="mb-1 line-clamp-2 text-[14px] font-bold leading-5 text-on-surface">
          {product.name}
        </h3>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant">
          {product.unit}
        </p>
      </Link>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-[18px] font-bold leading-7 text-primary">
          {formatRupiah(product.price)}
        </span>
        <button
          type="button"
          aria-label={`Tambah ${product.name} ke keranjang`}
          onClick={() => addToCart(product)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-sm transition-transform hover:scale-95"
        >
          <Icon name="add" size={18} />
        </button>
      </div>
    </div>
  )
}