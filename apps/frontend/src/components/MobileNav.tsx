import { NavLink } from 'react-router-dom'
import { useAppStore } from '../store/AppStore'
import { Icon } from './Icon'

export function MobileNav() {
  const { cartCount, openCart } = useAppStore()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between bg-surface-container-lowest px-6 py-3 shadow-[0px_-5px_20px_rgba(0,0,0,0.05)] md:hidden">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div
              className={`flex items-center justify-center rounded-full px-4 py-1 transition-all ${
                isActive ? 'bg-primary-container text-on-primary' : ''
              }`}
            >
              <Icon name="home" size={22} filled={isActive} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.05em]">Beranda</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/resep"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        <div className="flex items-center justify-center rounded-full px-4 py-1 transition-all">
          <Icon name="menu_book" size={22} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.05em]">Resep</span>
      </NavLink>

      <button
        type="button"
        onClick={openCart}
        className="relative flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary"
      >
        <div className="relative flex items-center justify-center rounded-full px-4 py-1 transition-all">
          <Icon name="shopping_cart" size={22} />
          {cartCount > 0 && (
            <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.05em]">Keranjang</span>
      </button>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        <div className="flex items-center justify-center rounded-full px-4 py-1 transition-all">
          <Icon name="person" size={22} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.05em]">Akun</span>
      </NavLink>
    </nav>
  )
}