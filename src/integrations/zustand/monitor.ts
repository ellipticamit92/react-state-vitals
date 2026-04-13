import { registerStore, unregisterStore } from '../../core/registry'
import { emitter } from '../../core/emitter'
import type { StoreSnapshot } from '../../core/registry'

const DEFAULT_LIMIT_KB = 50

function measureKB(state: unknown): number {
  try {
    return new Blob([JSON.stringify(state)]).size / 1024
  } catch {
    return 0
  }
}

function keysOf(state: unknown): string[] {
  return state !== null && typeof state === 'object' ? Object.keys(state) : []
}

interface MonitorableStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe: (listener: (state: any) => void) => () => void
  getState: () => unknown
}

/**
 * Attaches react-state-vitals monitoring to an existing zustand store hook.
 * Returns the same hook unchanged — fully transparent.
 *
 * @param name   Display name shown in the StateVitals panel
 * @param store  The hook returned by zustand's create()
 * @param limitKB  Warning threshold in KB (default 50)
 */
export function monitorStore<S extends MonitorableStore>(
  name: string,
  store: S,
  limitKB = DEFAULT_LIMIT_KB,
): S {
  const snapshots: StoreSnapshot[] = []
  let renderCount = 0

  const unsub = store.subscribe((state: unknown) => {
    const sizeKB = measureKB(state)
    const keys = keysOf(state)
    snapshots.push({ name, sizeKB, limitKB, keys, updatedAt: Date.now(), renders: renderCount })
    emitter.emit('store:update', { name, sizeKB, limitKB, keys, renders: renderCount })
    if (sizeKB > limitKB * 0.8) {
      emitter.emit('store:warning', { name, sizeKB, limitKB })
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _subscribe = store.subscribe.bind(store) as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(store as any).subscribe = (listener: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapped = (...args: any[]) => {
      renderCount += 1
      const last = snapshots[snapshots.length - 1]
      if (last) {
        last.renders = renderCount
        emitter.emit('store:update', {
          name,
          sizeKB: last.sizeKB,
          limitKB,
          keys: last.keys,
          renders: renderCount,
        })
      }
      return listener(...args)
    }
    return _subscribe(wrapped)
  }

  registerStore(name, { name, type: 'zustand', snapshots, unsub })

  const initial = store.getState()
  const initSizeKB = measureKB(initial)
  const initKeys = keysOf(initial)
  snapshots.push({ name, sizeKB: initSizeKB, limitKB, keys: initKeys, updatedAt: Date.now(), renders: 0 })
  emitter.emit('store:update', { name, sizeKB: initSizeKB, limitKB, keys: initKeys, renders: 0 })

  return store
}

/**
 * Remove react-state-vitals monitoring from a store registered via monitorStore().
 */
export function unmonitorStore(name: string): void {
  unregisterStore(name)
}
