import { Icon } from './Icon'

interface StepperProps {
  value: number
  min?: number
  onChange: (value: number) => void
  className?: string
}

export function Stepper({ value, min = 0, onChange, className = '' }: StepperProps) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(value + 1)

  return (
    <div
      className={`flex items-center justify-between rounded-full border border-primary/20 bg-surface-container-lowest px-2 transition-colors ${
        className || 'h-12 w-32 md:w-40'
      }`}
    >
      <button
        type="button"
        aria-label="Kurangi jumlah"
        onClick={dec}
        disabled={value <= min}
        className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low disabled:opacity-40"
      >
        <Icon name="remove" size={20} />
      </button>
      <span className="text-[16px] font-bold leading-6 text-on-surface">{value}</span>
      <button
        type="button"
        aria-label="Tambah jumlah"
        onClick={inc}
        className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low"
      >
        <Icon name="add" size={20} />
      </button>
    </div>
  )
}