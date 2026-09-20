import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'solid' | 'ghost' | 'quiet'
type Size = 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const base =
  'font-semibold rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] disabled:opacity-45 disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  solid: 'border border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)] hover:opacity-90',
  ghost: 'border border-[var(--color-ink)] bg-transparent text-[var(--color-ink)] hover:bg-[color-mix(in_srgb,var(--color-ink)_8%,transparent)]',
  quiet:
    'border border-transparent bg-transparent text-[var(--color-muted)] underline hover:text-[var(--color-ink)]',
}

const sizes: Record<Size, string> = {
  md: 'text-sm px-4 py-2.5 min-h-10',
  lg: 'text-base px-5 py-3.5 min-h-12',
}

export function Button({ variant = 'solid', size = 'md', className = '', children, ...rest }: Props) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  )
}