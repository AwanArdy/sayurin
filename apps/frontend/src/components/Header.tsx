import { Link, NavLink } from 'react-router-dom'
import { useAppStore } from '../store/context'
import { Icon } from './Icon'

const NAV_LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/resep', label: 'Resep' },
  { to: '/produk', label: 'Produk' },
  { to: '/dashboard', label: 'Dashboard' },
]

export function Header() {
  const { cartCount, openCart } = useAppStore()

  return (
    <header className="sticky top-0 z-50 bg-surface shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4">
        {/* Mobile: hamburger */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            type="button"
            aria-label="Buka menu"
            className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low"
          >
            <Icon name="menu" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="font-headline text-[20px] font-bold text-primary">Sayurin</span>
          </Link>
        </div>

        {/* Brand */}
        <Link to="/" className="hidden items-center gap-2 md:flex">
          <span className="rounded-full bg-primary-container p-1.5 text-on-primary">
            <Icon name="eco" filled size={20} />
          </span>
          <span className="text-[24px] font-bold leading-8 text-primary">Sayurin</span>
        </Link>

        {/* Search (desktop) */}
        <div className="relative mx-0 hidden flex-1 max-w-md lg:block">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Cari sayuran atau resep..."
            className="w-full rounded-full border border-primary/10 bg-surface-container-lowest py-2 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.05em] transition-all ${
                  isActive
                    ? 'bg-primary-container font-bold text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Cari"
            className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low md:hidden"
          >
            <Icon name="search" />
          </button>
          <button
            type="button"
            aria-label="Keranjang belanja"
            onClick={openCart}
            className="relative rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low"
          >
            <Icon name="shopping_cart" filled />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}