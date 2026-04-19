import { create as zustandCreate } from 'zustand'
import type {
  StateCreator,
  StoreMutatorIdentifier,
  Mutate,
  StoreApi,
} from 'zustand'
import { registerStore } from '../../core/registry'
import { emitter } from '../../core/emitter'
import type { StoreSnapshot } from '../../core/registry'
import { takeNameContext } from './name-context'

const DEFAULT_LIMIT_KB = 50
let storeCount = 0

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

type UseBoundStore<S extends StoreApi<unknown>> = {
  (): ExtractState<S>
  <U>(selector: (state: ExtractState<S>) => U): U
} & S

type ExtractState<S> = S extends { getState: () => infer T } ? T : never

export function create<T>(
  name: string,
  limitKB?: number,
): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
  initializer: StateCreator<T, [], Mos>
) => UseBoundStore<Mutate<StoreApi<T>, Mos>>

export function create<T>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
  initializer: StateCreator<T, [], Mos>
) => UseBoundStore<Mutate<StoreApi<T>, Mos>>

export function create<
  T,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<T, [], Mos>
): UseBoundStore<Mutate<StoreApi<T>, Mos>>

export function create<T>(
  nameOrInitializer?: string | StateCreator<T, [], []>,
  limitKB = DEFAULT_LIMIT_KB,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (typeof nameOrInitializer === 'string') {
    const name = nameOrInitializer
    return (initializer: StateCreator<T, [], []>) =>
      buildStore(name, initializer, limitKB)
  }

  if (nameOrInitializer === undefined) {
    return (initializer: StateCreator<T, [], []>) => {
      const name = takeNameContext() ?? `store${++storeCount}`
      return buildStore(name, initializer, limitKB)
    }
  }

  const name = takeNameContext() ?? `store${++storeCount}`
  return buildStore(name, nameOrInitializer, limitKB)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildStore<T>(name: string, initializer: any, limitKB: number): UseBoundStore<StoreApi<T>> {
  const snapshots: StoreSnapshot[] = []
  let renderCount = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store: StoreApi<T> = (zustandCreate as any)(initializer)

  const unsub = store.subscribe((state) => {
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

  return store as UseBoundStore<StoreApi<T>>
}
