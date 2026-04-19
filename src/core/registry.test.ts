import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  registerStore,
  unregisterStore,
  getRegistry,
  clearRegistry,
} from './registry'
import type { RegistryEntry } from './registry'

function makeEntry(name: string, type: RegistryEntry['type'] = 'zustand'): RegistryEntry {
  return {
    name,
    type,
    snapshots: [],
    unsub: vi.fn(),
  }
}

beforeEach(() => {
  clearRegistry()
})

describe('registerStore', () => {
  it('adds an entry to the registry', () => {
    registerStore('A', makeEntry('A'))
    expect(getRegistry().has('A')).toBe(true)
  })

  it('overwrites an existing entry with the same name', () => {
    const first = makeEntry('A')
    const second = makeEntry('A', 'context')
    registerStore('A', first)
    registerStore('A', second)
    expect(getRegistry().get('A')?.type).toBe('context')
  })

  it('emits panel:conflict when the same name is registered twice', async () => {
    const { emitter } = await import('./emitter')
    const fn = vi.fn()
    const off = emitter.on('panel:conflict', fn)

    registerStore('Dup', makeEntry('Dup'))
    registerStore('Dup', makeEntry('Dup')) // second registration → conflict

    // Lazy import is async — wait one tick
    await new Promise((r) => setTimeout(r, 0))

    expect(fn).toHaveBeenCalledOnce()
    expect(fn.mock.calls[0][0]).toMatchObject({ name: 'Dup' })

    off()
  })

  it('does not emit conflict for a fresh name', async () => {
    const { emitter } = await import('./emitter')
    const fn = vi.fn()
    const off = emitter.on('panel:conflict', fn)

    registerStore('Fresh', makeEntry('Fresh'))
    await new Promise((r) => setTimeout(r, 0))

    expect(fn).not.toHaveBeenCalled()
    off()
  })
})

describe('unregisterStore', () => {
  it('removes the entry from the registry', () => {
    registerStore('B', makeEntry('B'))
    unregisterStore('B')
    expect(getRegistry().has('B')).toBe(false)
  })

  it('calls the entry unsub function', () => {
    const entry = makeEntry('C')
    registerStore('C', entry)
    unregisterStore('C')
    expect(entry.unsub).toHaveBeenCalledOnce()
  })

  it('does not throw when unregistering a non-existent key', () => {
    expect(() => unregisterStore('nonexistent')).not.toThrow()
  })
})

describe('getRegistry', () => {
  it('returns the live registry map', () => {
    registerStore('D', makeEntry('D'))
    const reg = getRegistry()
    expect(reg.size).toBe(1)
    expect(reg.get('D')?.name).toBe('D')
  })
})

describe('clearRegistry', () => {
  it('removes all entries', () => {
    registerStore('E', makeEntry('E'))
    registerStore('F', makeEntry('F'))
    clearRegistry()
    expect(getRegistry().size).toBe(0)
  })

  it('calls unsub on every entry', () => {
    const e1 = makeEntry('E')
    const e2 = makeEntry('F')
    registerStore('E', e1)
    registerStore('F', e2)
    clearRegistry()
    expect(e1.unsub).toHaveBeenCalledOnce()
    expect(e2.unsub).toHaveBeenCalledOnce()
  })
})
