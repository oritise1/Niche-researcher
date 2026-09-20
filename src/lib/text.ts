export function str(v: unknown, max: number): string {
  return typeof v === 'string'
    ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
    : ''
}

export function strList(a: unknown, max: number, limit: number): string[] {
  const out: string[] = []
  ;(Array.isArray(a) ? a : []).forEach(x => {
    const s = str(x, max)
    if (s && !out.includes(s)) out.push(s)
  })
  return out.slice(0, limit)
}

export const uniq = <T,>(v: T, i: number, a: T[]) => a.indexOf(v) === i

export function shortWords(s: string, n: number): string {
  return str(s, 200).split(' ').slice(0, n).join(' ')
}