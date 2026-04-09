export interface QueryInfo {
  key: string
  sizeKB: number
  status: 'pending' | 'error' | 'success'
  fetchStatus: 'fetching' | 'paused' | 'idle'
  isStale: boolean
  observers: number
  updatedAt: number
}

export interface StoreSnapshot {
  name: string
  sizeKB: number
  limitKB: number
  keys: string[]
  updatedAt: number
  renders?: number
  queries?: QueryInfo[]
}

export interface RegistryEntry {
  name: string
  type: 'zustand' | 'context' | 'cache'
  snapshots: StoreSnapshot[]
  unsub: () => void
}

// Central store registry — all integrations write here
const registry = new Map<string, RegistryEntry>()

export function registerStore(name: string, entry: RegistryEntry): void {
  if (registry.has(name) && process.env.NODE_ENV !== 'production') {
    const message =
      `"${name}" is monitored by both patchContext() and useContextMonitor(). ` +
      `Pick one to avoid duplicate updates.`
    // Lazy import to avoid circular dep at module load time
    import('./emitter').then(({ emitter }) => {
      emitter.emit('panel:conflict', { name, message })
    })
  }
  registry.set(name, entry)
}

export function unregisterStore(name: string): void {
  registry.get(name)?.unsub()
  registry.delete(name)
}

export function getRegistry(): Map<string, RegistryEntry> {
  return registry
}

export function clearRegistry(): void {
  registry.forEach((entry) => entry.unsub())
  registry.clear()
}
