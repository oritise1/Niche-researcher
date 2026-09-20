import type { ReactNode } from 'react'

interface Props {
  label: string
  href: string
  color?: string
  children?: ReactNode
}

export function Chip({ label, href, color = 'var(--color-line)' }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-full border px-3 py-1 text-sm no-underline bg-[var(--color-field)] hover:bg-[color-mix(in_srgb,var(--color-ink)_10%,var(--color-field))]"
      style={{ borderColor: color }}
    >
      {label}
    </a>
  )
}