export async function detectReactQuery(): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await import(/* webpackIgnore: true */ /* @vite-ignore */ '@tanstack/react-query')
    return true
  } catch {
    return false
  }
}

// React Query (TanStack Query v4/v5) integration.
// Subscribes to the QueryCache event bus — fully reactive, no polling needed.
//
// Usage:
//   import { monitorQueryClient } from 'react-state-vitals/react-query'
//   monitorQueryClient(queryClient)              // name defaults to 'ReactQuery'
//   monitorQueryClient(queryClient, 'MyQueries') // custom name

import { registerStore, unregisterStore } from '../../core/registry'
import { emitter } from '../../core/emitter'
import type { QueryInfo, StoreSnapshot } from '../../core/registry'

const DEFAULT_LIMIT_KB = 1024 // 1 MB default for query caches

function measureKB(value: unknown): number {
  try {
    return new Blob([JSON.stringify(value)]).size / 1024
  } catch {
    return 0
  }
}

function serializeKey(queryKey: unknown): string {
  try {
    return JSON.stringify(queryKey)
  } catch {
    return String(queryKey)
  }
}

// Minimal shape we need from QueryClient — avoids hard dep on @tanstack/react-query types
interface MinimalQuery {
  queryKey: unknown
  state: {
    data: unknown
    status: string
    fetchStatus?: string
    dataUpdatedAt?: number
  }
  // v4/v5 both expose observers as an array
  observers: unknown[]
  isStale: () => boolean
}

interface MinimalQueryClient {
  getQueryCache: () => {
    getAll: () => MinimalQuery[]
    subscribe: (listener: (event: unknown) => void) => () => void
  }
}

function buildSnapshot(
  name: string,
  client: MinimalQueryClient,
  limitKB: number,
  snapshots: StoreSnapshot[],
): void {
  const queries = client.getQueryCache().getAll()

  const queryInfos: QueryInfo[] = queries.map((q) => {
    const sizeKB = measureKB(q.state.data)
    const rawStatus = q.state.status
    const status: QueryInfo['status'] =
      rawStatus === 'success' ? 'success'
      : rawStatus === 'error' ? 'error'
      : 'pending'

    const rawFetch = q.state.fetchStatus ?? 'idle'
    const fetchStatus: QueryInfo['fetchStatus'] =
      rawFetch === 'fetching' ? 'fetching'
      : rawFetch === 'paused' ? 'paused'
      : 'idle'

    return {
      key: serializeKey(q.queryKey),
      sizeKB,
      status,
      fetchStatus,
      isStale: q.isStale(),
      observers: q.observers.length,
      updatedAt: q.state.dataUpdatedAt ?? Date.now(),
    }
  })

  const totalSizeKB = queryInfos.reduce((sum, q) => sum + q.sizeKB, 0)
  const keys = queryInfos.map((q) => q.key)

  const snapshot: StoreSnapshot = {
    name,
    sizeKB: totalSizeKB,
    limitKB,
    keys,
    updatedAt: Date.now(),
    queries: queryInfos,
  }

  snapshots.push(snapshot)

  emitter.emit('store:update', {
    name,
    sizeKB: totalSizeKB,
    limitKB,
    keys,
    queries: queryInfos,
  })

  if (totalSizeKB > limitKB * 0.8) {
    emitter.emit('store:warning', { name, sizeKB: totalSizeKB, limitKB })
  }
}

/**
 * Attach memnitor monitoring to a TanStack QueryClient.
 * Subscribes to the QueryCache event bus — reactive, no polling.
 *
 * @param client   The QueryClient instance
 * @param name     Label shown in the panel (default: 'ReactQuery')
 * @param limitKB  Warning threshold in KB (default: 1024)
 * @returns        Unsubscribe function
 */
export function monitorQueryClient(
  client: MinimalQueryClient,
  name = 'ReactQuery',
  limitKB = DEFAULT_LIMIT_KB,
): () => void {
  const snapshots: StoreSnapshot[] = []

  // Subscribe to QueryCache events (added, removed, updated, observerAdded…)
  const unsubCache = client.getQueryCache().subscribe(() => {
    buildSnapshot(name, client, limitKB, snapshots)
  })

  registerStore(name, {
    name,
    type: 'cache',
    snapshots,
    unsub: unsubCache,
  })

  // Emit initial state immediately
  buildSnapshot(name, client, limitKB, snapshots)

  emitter.emit('integration:ready', { name: 'react-query' })

  return () => unregisterStore(name)
}
