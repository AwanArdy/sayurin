import type { CSSProperties } from 'react'

interface IconProps {
  name: string
  size?: number | string
  filled?: boolean
  className?: string
  weight?: number
}

export function Icon({ name, size = 24, filled = false, className, weight = 400 }: IconProps) {
  const style: CSSProperties = {
    fontSize: typeof size === 'number' ? `${size}px` : size,
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
  }
  return (
    <span aria-hidden="true" className={`material-icons ${className ?? ''}`} style={style}>
      {name}
    </span>
  )
}