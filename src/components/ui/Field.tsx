import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Hint } from './Hint'

interface BaseProps {
  label: string
  hint?: ReactNode
  labelClass?: string
  id: string
}

export function TextField({
  label, hint, id, labelClass = 'text-[15px] font-semibold block mb-1.5', ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>{label}</label>
      <input
        id={id}
        className="w-full text-base text-[var(--color-ink)] bg-[var(--color-field)] border border-[var(--color-line)] rounded-md px-2.5 py-2"
        {...rest}
      />
      {hint && <Hint>{hint}</Hint>}
    </div>
  )
}

export function TextArea({
  label, hint, id, labelClass = 'text-[15px] font-semibold block mb-1.5', ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>{label}</label>
      <textarea
        id={id}
        className="w-full text-base text-[var(--color-ink)] bg-[var(--color-field)] border border-[var(--color-line)] rounded-md px-2.5 py-2 min-h-[84px] resize-y"
        {...rest}
      />
      {hint && <Hint>{hint}</Hint>}
    </div>
  )
}

export function SelectField({
  label, hint, id, children, labelClass = 'text-[15px] font-semibold block mb-1.5', ...rest
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>{label}</label>
      <select
        id={id}
        className="w-full text-base text-[var(--color-ink)] bg-[var(--color-field)] border border-[var(--color-line)] rounded-md px-2.5 py-2 min-h-[42px]"
        {...rest}
      >
        {children}
      </select>
      {hint && <Hint>{hint}</Hint>}
    </div>
  )
}