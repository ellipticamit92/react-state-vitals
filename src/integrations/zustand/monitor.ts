// monitorStore — register any existing zustand store with memnitor.
// Consumers keep their original zustand/zustand-middleware imports unchanged.
//
// Usage (single store):
//   import { monitorStore } from 'react-state-vitals/zustand'
//   export const useTodoStore = monitorStore('TodoStore', useTodoStore)
//
// Usage (all stores in one setup file — no changes to store files at all):
//   import { monitorStore } from 'react-state-vitals/zustand'
//   import { useTodoStore } from './stores/todo'
//   import { useUserStore } from './stores/user'
//   monitorStore('TodoStore', useTodoStore)
//   monitorStore('UserStore', useUserStore)

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

// Only the parts of the store we actually call — avoids $$storeMutators conflicts
// caused by middleware (devtools, persist) adding their own mutator tuples.
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

  // Step 1: monitoring subscription — before wrapping, so it isn't counted as a render
  const unsub = store.subscribe((state: unknown) => {
    const sizeKB = measureKB(state)
    const keys = keysOf(state)
    snapshots.push({ name, sizeKB, limitKB, keys, updatedAt: Date.now(), renders: renderCount })
    emitter.emit('store:update', { name, sizeKB, limitKB, keys, renders: renderCount })
    if (sizeKB > limitKB * 0.8) {
      emitter.emit('store:warning', { name, sizeKB, limitKB })
    }
  })

  // Step 2: wrap subscribe to count React component re-renders
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

  // Emit initial state immediately
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
