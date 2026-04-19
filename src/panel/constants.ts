/* ------------------ THRESHOLDS ------------------ */

export const WARN_RATIO = 0.75
export const HEAP_POLL_MS = 2000

/* ------------------ ACCENT COLORS ------------------ */

export const ACCENT_COLORS = {
  green: {
    text: 'text-green-400',
    bar: 'bg-green-500',
    dot: 'bg-green-400',
  },
  blue: {
    text: 'text-blue-400',
    bar: 'bg-blue-500',
    dot: 'bg-blue-400',
  },
  purple: {
    text: 'text-purple-400',
    bar: 'bg-purple-500',
    dot: 'bg-purple-400',
  },
} as const

export type Accent = keyof typeof ACCENT_COLORS

/* ------------------ STATUS COLORS ------------------ */

export const STATUS_COLORS = {
  ok: {
    text: 'text-green-400',
    bar: 'bg-green-400',
    dot: 'bg-green-400',
  },
  warn: {
    text: 'text-yellow-400',
    bar: 'bg-yellow-400',
    dot: 'bg-yellow-400',
  },
  danger: {
    text: 'text-red-400',
    bar: 'bg-red-500',
    dot: 'bg-red-400 animate-pulse',
  },
} as const

export type StatusLevel = keyof typeof STATUS_COLORS

/* ------------------ UTILS ------------------ */

export const getStatus = (size: number, limit: number): StatusLevel => {
  const ratio = size / limit
  if (ratio > 1) return 'danger'
  if (ratio > WARN_RATIO) return 'warn'
  return 'ok'
}

export const getColor = (level: StatusLevel) => STATUS_COLORS[level]

export const formatKB = (kb: number): string =>
  kb >= 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb.toFixed(1)}KB`
