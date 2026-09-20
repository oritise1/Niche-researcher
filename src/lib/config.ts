export const WEBHOOK_URL: string = import.meta.env.VITE_N8N_WEBHOOK_URL ?? ''
export const TIMEOUT_MS: number = Number(import.meta.env.VITE_N8N_TIMEOUT_MS ?? 45_000)
export const HAS_AI: boolean = WEBHOOK_URL.length > 0