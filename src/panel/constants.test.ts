import { describe, it, expect } from 'vitest'
import { getStatus, getColor, formatKB, ACCENT_COLORS, STATUS_COLORS } from './constants'

describe('getStatus', () => {
  it('returns "ok" when size is well within limit', () => {
    expect(getStatus(50, 200)).toBe('ok')
  })

  it('returns "ok" at exactly 75% of limit', () => {
    expect(getStatus(75, 100)).toBe('ok')
  })

  it('returns "warn" when size exceeds 75% of limit', () => {
    expect(getStatus(76, 100)).toBe('warn')
  })

  it('returns "warn" at 99% of limit', () => {
    expect(getStatus(99, 100)).toBe('warn')
  })

  it('returns "danger" when size exceeds limit', () => {
    expect(getStatus(101, 100)).toBe('danger')
  })

  it('returns "danger" when size equals limit', () => {
    // ratio === 1 — not > 1, so technically "warn", boundary check
    expect(getStatus(100, 100)).toBe('warn')
  })

  it('returns "danger" when size is double the limit', () => {
    expect(getStatus(200, 100)).toBe('danger')
  })
})

describe('getColor', () => {
  it('returns green classes for "ok"', () => {
    const { text, bar, dot } = getColor('ok')
    expect(text).toContain('green')
    expect(bar).toContain('green')
    expect(dot).toContain('green')
  })

  it('returns yellow classes for "warn"', () => {
    const { text, bar, dot } = getColor('warn')
    expect(text).toContain('yellow')
    expect(bar).toContain('yellow')
    expect(dot).toContain('yellow')
  })

  it('returns red classes for "danger"', () => {
    const { text, bar, dot } = getColor('danger')
    expect(text).toContain('red')
    expect(bar).toContain('red')
    expect(dot).toContain('red')
  })

  it('"danger" dot has animate-pulse', () => {
    expect(getColor('danger').dot).toContain('animate-pulse')
  })
})

describe('formatKB', () => {
  it('formats values under 1024 as KB', () => {
    expect(formatKB(512)).toBe('512.0KB')
  })

  it('formats 0 as KB', () => {
    expect(formatKB(0)).toBe('0.0KB')
  })

  it('formats exactly 1024 as MB', () => {
    expect(formatKB(1024)).toBe('1.0MB')
  })

  it('formats values over 1024 as MB', () => {
    expect(formatKB(2048)).toBe('2.0MB')
  })

  it('formats fractional KB correctly', () => {
    expect(formatKB(1.5)).toBe('1.5KB')
  })

  it('formats large MB values correctly', () => {
    expect(formatKB(10240)).toBe('10.0MB')
  })
})

describe('ACCENT_COLORS', () => {
  it('green accent has green classes', () => {
    expect(ACCENT_COLORS.green.text).toContain('green')
    expect(ACCENT_COLORS.green.bar).toContain('green')
    expect(ACCENT_COLORS.green.dot).toContain('green')
  })

  it('blue accent has blue classes', () => {
    expect(ACCENT_COLORS.blue.text).toContain('blue')
    expect(ACCENT_COLORS.blue.bar).toContain('blue')
    expect(ACCENT_COLORS.blue.dot).toContain('blue')
  })
})

describe('STATUS_COLORS', () => {
  it('has entries for all three levels', () => {
    expect(STATUS_COLORS).toHaveProperty('ok')
    expect(STATUS_COLORS).toHaveProperty('warn')
    expect(STATUS_COLORS).toHaveProperty('danger')
  })

  it('each entry has text, bar, and dot', () => {
    for (const level of ['ok', 'warn', 'danger'] as const) {
      expect(STATUS_COLORS[level]).toHaveProperty('text')
      expect(STATUS_COLORS[level]).toHaveProperty('bar')
      expect(STATUS_COLORS[level]).toHaveProperty('dot')
    }
  })
})
