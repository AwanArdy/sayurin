import { Link } from 'react-router-dom'
import { Icon } from './Icon'

export function Footer() {
  return (
    <footer className="mt-[48px] w-full bg-surface-container-low py-[48px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-8 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-[20px] font-bold leading-8 text-primary opacity-80">Sayurin</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-[12px] font-semibold uppercase tracking-[0.05em]">
          <Link to="/" className="text-on-surface-variant transition-all hover:text-primary hover:underline">
            Tentang Kami
          </Link>
          <Link to="/" className="text-on-surface-variant transition-all hover:text-primary hover:underline">
            Kebijakan Privasi
          </Link>
          <Link to="/" className="text-on-surface-variant transition-all hover:text-primary hover:underline">
            Syarat &amp; Ketentuan
          </Link>
          <Link to="/" className="text-on-surface-variant transition-all hover:text-primary hover:underline">
            Hubungi Kami
          </Link>
        </nav>
        <p className="flex items-center gap-1.5 text-[14px] leading-6 text-on-surface-variant">
          <Icon name="eco" size={18} className="text-primary-container" />
          © 2025 Sayurin. Kesegaran dari Kebun ke Dapur.
        </p>
      </div>
    </footer>
  )
}