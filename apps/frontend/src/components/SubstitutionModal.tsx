import { useState } from 'react'
import type { SubstitutionPolicy } from '../lib/api'
import { useAppStore } from '../store/context'
import { Icon } from './Icon'

const POLICIES: { value: string; title: string; desc: string }[] = [
  {
    value: 'auto_similar',
    title: 'Ganti Otomatis dengan Sayur Setara',
    desc: 'Kami akan memilihkan sayuran dengan kualitas dan tipe yang serupa (mis. bayam diganti dengan kale).',
  },
  {
    value: 'whatsapp_confirm',
    title: 'Konfirmasi via WhatsApp',
    desc: 'Kami akan menghubungi Anda. Jika tidak ada respons dalam 15 menit, dana akan otomatis direfund.',
  },
  {
    value: 'auto_refund',
    title: 'Refund Otomatis ke Saldo E-Wallet',
    desc: 'Dana untuk item yang kosong akan langsung dikembalikan ke Sayurin Balance Anda.',
  },
]

interface SubstitutionModalProps {
  value: SubstitutionPolicy
  onSave: (value: SubstitutionPolicy) => void
}

export function SubstitutionModal({ value, onSave }: SubstitutionModalProps) {
  const { substitutionOpen, closeSubstitution } = useAppStore()
  const [selected, setSelected] = useState<SubstitutionPolicy>(value)

  if (!substitutionOpen) return null

  const save = () => {
    onSave(selected)
    closeSubstitution()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        aria-label="Tutup modal"
        className="absolute inset-0 bg-primary-container/40"
        onClick={closeSubstitution}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-[520px] flex-col rounded-[24px] bg-surface-container-lowest shadow-[0px_12px_40px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <header className="z-10 flex items-center justify-between border-b border-primary-container bg-surface-container-lowest px-6 py-4">
          <h2 className="text-[24px] font-semibold leading-8 text-primary-container">
            Kebijakan Substitusi Otomatis
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={closeSubstitution}
            className="rounded-full p-2 text-primary-container transition-colors hover:bg-surface-container-low"
          >
            <Icon name="close" size={24} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="mb-6 text-[16px] leading-6 text-primary-container">
            Tentukan bagaimana kami menangani pesanan Anda jika produk segar yang Anda inginkan
            sedang kosong.
          </p>

          <div className="flex flex-col gap-4">
            {POLICIES.map((pol) => {
              const isSelected = selected === pol.value
              return (
                <label
                  key={pol.value}
                  className={`relative flex cursor-pointer rounded-xl transition-all ${
                    isSelected
                      ? 'border-2 border-primary-container bg-[#EEF5F7] p-[19px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)]'
                      : 'border border-[#E2E4E9] bg-surface-container-lowest p-5 hover:bg-[#EEF5F7]/50 hover:shadow-[0px_4px_20px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="substitution-policy"
                    value={pol.value}
                    checked={isSelected}
                    onChange={() => setSelected(pol.value as SubstitutionPolicy)}
                    className="sr-only"
                  />
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary-container">
                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary-container" />}
                  </div>
                  <div className="ml-4">
                    <span className="mb-1 block text-[14px] font-semibold leading-5 text-primary-container">
                      {pol.title}
                    </span>
                    <span className="block text-[13px] leading-5 text-primary-container/90">
                      {pol.desc}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-[#EEF5F7] p-4">
            <Icon name="eco" size={20} filled className="text-primary-container" />
            <p className="text-[12px] leading-4 text-primary-container">
              Anda bisa mengubah pengaturan ini kapan saja sebelum pesanan diproses.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="z-10 flex justify-end gap-3 border-t border-primary-container bg-surface-container-lowest px-6 py-4">
          <button
            type="button"
            onClick={closeSubstitution}
            className="rounded-xl border-2 border-primary-container bg-surface-container-lowest px-6 py-2 text-[14px] font-semibold text-primary-container transition-colors hover:bg-[#EEF5F7]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-xl bg-primary-container px-6 py-2 text-[14px] font-semibold text-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-colors hover:bg-primary"
          >
            Simpan Pengaturan
          </button>
        </footer>
      </div>
    </div>
  )
}