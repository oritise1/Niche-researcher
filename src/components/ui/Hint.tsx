import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  id?: string
  live?: boolean
}

export function Hint({ children, className = '', id, live }: Props) {
  return (
    <p
      id={id}
      role={live ? 'status' : undefined}
      aria-live={live ? 'polite' : undefined}
      className={`text-sm text-[var(--color-muted)] mt-1 ${className}`}
    >
      {children}
    </p>
  )
}