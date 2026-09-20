import { useEffect, useRef, useState } from 'react'
import type { AppState } from '../lib/types'
import { persist } from '../lib/storage'

export function useAutosave(state: AppState) {
  const [ok, setOk] = useState(true)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setOk(persist(state))
    }, 250)

    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [state])

  return ok
}