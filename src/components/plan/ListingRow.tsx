import { Button } from '../ui/Button'
import type { Listing } from '../../lib/types'

interface Props {
  index: number
  listing: Listing
  onChange: (patch: Partial<Listing>) => void
  onRemove: () => void
}

const FIELDS: { key: keyof Listing; label: string; span: 2 | 3; placeholder: string; decimal?: boolean }[] = [
  { key: 'title', label: 'Title', span: 3, placeholder: '' },
  { key: 'url', label: 'URL', span: 3, placeholder: '' },
  { key: 'price', label: 'Price', span: 2, placeholder: '$39', decimal: true },
  { key: 'reviews', label: 'Reviews or sales shown', span: 2, placeholder: 'e.g. 240 reviews' },
  { key: 'updated', label: 'Last updated', span: 2, placeholder: 'e.g. Mar 2026' },
  { key: 'included', label: 'What is included', span: 3, placeholder: '' },
  { key: 'strength', label: 'Standout strength', span: 3, placeholder: '' },
]

export function ListingRow({ index, listing, onChange, onRemove }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-x-3 gap-y-2.5 py-3.5 border-t border-line">
      <div className="sm:col-span-6 flex items-center justify-between">
        <span className="font-display font-bold text-[15px]">Listing {index + 1}</span>
        <Button variant="quiet" onClick={onRemove} aria-label={`Remove listing ${index + 1}`}>
          Remove
        </Button>
      </div>
      {FIELDS.map(f => {
        const id = `l-${index}-${f.key}`
        return (
          <div key={f.key} className={f.span === 2 ? 'sm:col-span-2' : 'sm:col-span-3'}>
            <label className="block text-[13px] font-semibold text-muted mb-1.5" htmlFor={id}>
              {f.label}
            </label>
            <input
              id={id}
              type="text"
              inputMode={f.decimal ? 'decimal' : undefined}
              value={listing[f.key]}
              placeholder={f.placeholder}
              onChange={e => onChange({ [f.key]: e.target.value })}
              className="w-full text-base text-ink bg-field border border-line rounded-md px-2.5 py-2"
            />
          </div>
        )
      })}
    </div>
  )
}