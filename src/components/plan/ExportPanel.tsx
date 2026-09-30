import { useState } from 'react'
import { Button } from '../ui/Button'
import { Hint } from '../ui/Hint'
import { toMarkdown, today } from '../../lib/export'
import type { Intake, Notes, Plan } from '../../lib/types'

interface Props {
  plan: Plan
  notes: Notes
  intake: Intake
}

export function ExportPanel({ plan, notes, intake }: Props) {
  const [msg, setMsg] = useState('')
  const [showFallback, setShowFallback] = useState(false)

  const md = toMarkdown(plan, notes, intake)

  async function copy() {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(md)
        setMsg('Copied to clipboard.')
        setShowFallback(false)
        return
      } catch {
        /* fall through */
      }
    }
    setShowFallback(true)
    setMsg('Press Ctrl or Cmd + C to copy the selected text.')
  }

  function save() {
    try {
      const blob = new Blob([md], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `niche-research-${today()}.md`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setMsg('Saved.')
    } catch {
      setMsg('Could not save. Use Copy as Markdown instead.')
    }
  }

  return (
    <div className="mt-8 pt-5 border-t border-line">
      <h3 className="font-display text-[22px] font-bold">Keep your research</h3>
      <Hint>Export the whole log as Markdown to store in Notion or a doc.</Hint>
      <div className="flex flex-wrap gap-2 mt-3">
        <Button onClick={save}>Save as Markdown file</Button>
        <Button variant="ghost" onClick={copy}>Copy as Markdown</Button>
      </div>
      <Hint live>{msg}</Hint>
      {showFallback && (
        <textarea
          readOnly
          value={md}
          aria-label="Markdown export"
          onFocus={e => e.currentTarget.select()}
          className="mt-3 w-full min-h-50 font-mono text-[13px] leading-snug text-ink bg-field border border-line rounded-md p-2.5"
        />
      )}
    </div>
  )
}