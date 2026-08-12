import { useEffect, useState } from 'react'
import { getWasteLog, type WasteLog } from '../lib/api'
import { demoWasteLog } from '../data/demo'
import { avatarImage } from '../lib/images'
import { formatNumber, formatRupiah } from '../lib/format'
import { Icon } from '../components/Icon'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun']
const BARS = [30, 45, 60, 80, 50, 90]

const ORDER_LOGS = [
  { date: '24 Okt 2025', items: '5 items', text: '1.2 kg sayuran diselamatkan dari pantry Anda minggu ini.' },
  { date: '18 Okt 2025', items: '8 items', text: '0.8 kg buah-buahan dimanfaatkan optimal.' },
  { date: '10 Okt 2025', items: '3 items', text: '0.5 kg bahan makanan berhasil diolah kembali.' },
]

const SIDENAV = [
  { icon: 'person', label: 'Profil' },
  { icon: 'receipt_long', label: 'Riwayat Pesanan' },
  { icon: 'recycling', label: 'Waste Log Saya', active: true },
]

export function Dashboard() {
  const [log, setLog] = useState<WasteLog>(demoWasteLog)
  const [period, setPeriod] = useState<'Mingguan' | 'Bulanan'>('Bulanan')

  useEffect(() => {
    const token = localStorage.getItem('sayurin_token')
    if (!token) return
    getWasteLog(token)
      .then(setLog)
      .catch(() => {})
  }, [])

  const metrics = [
    {
      icon: 'delete_sweep',
      label: 'Sampah Makanan Dicegah',
      value: `${formatNumber(log.food_waste_saved_kg)} kg`,
    },
    {
      icon: 'takeout_dining',
      label: 'Kemasan Plastik Dihemat',
      value: `${formatNumber(log.plastic_saved_pcs)} pcs`,
    },
    {
      icon: 'savings',
      label: 'Estimasi Hemat Belanja',
      value: formatRupiah(log.money_saved_idr),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop) */}
        <aside className="z-40 hidden w-80 shrink-0 flex-col bg-surface-container-lowest p-6 shadow-md md:flex">
          <div className="mb-10 flex flex-col items-center">
            <div className="mb-3 overflow-hidden rounded-full border-2 border-primary-container p-1">
              <img
                className="h-24 w-24 rounded-full object-cover"
                src={avatarImage}
                alt="Avatar"
              />
            </div>
            <h2 className="text-[20px] font-bold leading-6 text-primary">Budi Santoso</h2>
            <span className="mt-2 flex items-center gap-1 rounded-full bg-primary-container px-3 py-1 text-[12px] leading-4 text-on-primary">
              <Icon name="eco" size={16} filled />
              {log.user_level}
            </span>
          </div>
          <nav className="flex flex-col gap-2">
            {SIDENAV.map((item) => (
              <a
                key={item.label}
                href="/dashboard"
                className={`flex items-center gap-4 rounded-xl p-4 text-[14px] font-semibold leading-5 transition-colors ${
                  item.active
                    ? 'border-l-4 border-primary-container bg-secondary-container text-on-secondary-container'
                    : 'text-secondary hover:bg-surface-container-high'
                }`}
              >
                <Icon name={item.icon} filled={item.active} />
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          <header className="mb-6">
            <h1 className="mb-1 text-[32px] font-bold leading-10 text-primary">
              Dampak Hijau &amp; Jejak Pangan
            </h1>
            <p className="text-[18px] leading-7 text-secondary">
              Akumulasi penghematan bahan pangan Anda bersama Sayurin Botanical.
            </p>
          </header>

          {/* Metrics */}
          <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex flex-col items-start rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed">
                  <Icon name={m.icon} className="text-primary-container" />
                </div>
                <p className="mb-1 text-[14px] font-semibold text-secondary">{m.label}</p>
                <h3 className="text-[32px] font-bold leading-10 text-primary">{m.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Chart */}
            <div className="rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[24px] font-semibold leading-8 text-primary">
                  Tren Penghematan Pangan
                </h3>
                <div className="flex gap-2">
                  {(['Mingguan', 'Bulanan'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={`rounded-full px-3 py-1 text-[12px] leading-4 ${
                        period === p
                          ? 'bg-primary-container text-on-primary shadow-sm'
                          : 'bg-surface-container-low text-secondary hover:bg-surface-variant'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative flex h-64 w-full items-end justify-between gap-2 pt-8">
                {/* Y labels */}
                <div className="absolute left-0 top-0 flex h-full flex-col justify-between pb-6 text-[12px] leading-4 text-secondary">
                  <span>5kg</span>
                  <span>2.5kg</span>
                  <span>0kg</span>
                </div>
                {/* gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-6 pl-10">
                  <div className="w-full border-t border-dashed border-outline-variant opacity-50" />
                  <div className="w-full border-t border-dashed border-outline-variant opacity-50" />
                  <div className="w-full border-t border-outline-variant" />
                </div>
                {/* bars */}
                <div className="relative z-10 flex h-full w-full items-end justify-around pb-6 pl-10">
                  {BARS.map((height, i) => (
                    <div
                      key={MONTHS[i]}
                      className="group flex h-full w-1/6 flex-col items-center justify-end"
                    >
                      <div
                        className="w-full max-w-[40px] rounded-t-md bg-primary-container transition-opacity hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                      <span className="mt-2 text-[12px] leading-4 text-secondary">{MONTHS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order logs */}
            <div className="flex flex-col rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
              <h3 className="mb-4 text-[24px] font-semibold leading-8 text-primary">
                Log Pesanan Terakhir
              </h3>
              <div className="flex flex-col gap-4 overflow-y-auto pr-2" style={{ maxHeight: 300 }}>
                {ORDER_LOGS.map((order) => (
                  <div key={order.date} className="flex flex-col gap-2 border-b border-surface-variant pb-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <span className="text-[14px] font-semibold leading-5 text-secondary">
                        {order.date}
                      </span>
                      <span className="rounded-full border border-outline-variant bg-surface-container-low px-2 py-0.5 text-[12px] leading-4 text-primary-container">
                        {order.items}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon
                        name="check_circle"
                        size={20}
                        className="mt-0.5 shrink-0 text-primary-container"
                        filled
                      />
                      <p className="text-[16px] leading-6 text-on-surface">{order.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-auto pt-4 w-full text-center text-[14px] font-bold text-primary-container hover:underline"
              >
                Lihat Semua Log
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}