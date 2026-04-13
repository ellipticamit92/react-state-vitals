import { describe, it, expect, vi } from 'vitest'
import { emitter } from './emitter'

// Reset listeners between tests by re-importing would be complex;
// we use explicit off() cleanup instead.

describe('emitter.on / emit', () => {
  it('calls listener when event is emitted', () => {
    const fn = vi.fn()
    const off = emitter.on('store:warning', fn)

    emitter.emit('store:warning', { name: 'A', sizeKB: 100, limitKB: 50 })
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith({ name: 'A', sizeKB: 100, limitKB: 50 })

    off()
  })

  it('calls multiple listeners for the same event', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    const off1 = emitter.on('store:warning', fn1)
    const off2 = emitter.on('store:warning', fn2)

    emitter.emit('store:warning', { name: 'B', sizeKB: 80, limitKB: 50 })
    expect(fn1).toHaveBeenCalledOnce()
    expect(fn2).toHaveBeenCalledOnce()

    off1(); off2()
  })

  it('does not call listeners for other events', () => {
    const fn = vi.fn()
    const off = emitter.on('store:warning', fn)

    emitter.emit('heap:update', { usedMB: 1, totalMB: 2, limitMB: 4 })
    expect(fn).not.toHaveBeenCalled()

    off()
  })
})

describe('emitter.off / unsubscribe', () => {
  it('stops calling listener after off()', () => {
    const fn = vi.fn()
    const off = emitter.on('store:warning', fn)

    off()
    emitter.emit('store:warning', { name: 'C', sizeKB: 10, limitKB: 50 })
    expect(fn).not.toHaveBeenCalled()
  })

  it('returned unsubscribe function is idempotent', () => {
    const fn = vi.fn()
    const off = emitter.on('store:warning', fn)

    off(); off() // calling twice should not throw
    emitter.emit('store:warning', { name: 'D', sizeKB: 10, limitKB: 50 })
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('emitter — panel:conflict', () => {
  it('emits conflict event with name and message', () => {
    const fn = vi.fn()
    const off = emitter.on('panel:conflict', fn)

    emitter.emit('panel:conflict', { name: 'Auth', message: 'duplicate monitoring' })
    expect(fn).toHaveBeenCalledWith({ name: 'Auth', message: 'duplicate monitoring' })

    off()
  })
})
