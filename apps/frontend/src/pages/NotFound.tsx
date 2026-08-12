import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="text-[96px] font-bold leading-none text-primary-container">404</p>
      <h1 className="text-[24px] font-bold text-primary">Halaman tidak ditemukan</h1>
      <p className="text-on-surface-variant">
        Halaman yang kamu cari sudah dipanen atau tidak tersedia.
      </p>
      <Link
        to="/"
        className="mt-4 rounded-full bg-primary-container px-8 py-3 text-[14px] font-semibold text-on-primary transition-colors hover:bg-primary"
      >
        Kembali ke Beranda
      </Link>
    </main>
  )
}