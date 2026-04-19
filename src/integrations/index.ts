import { detectZustand } from './zustand'
import { detectReactQuery } from './react-query'
import { emitter } from '../core/emitter'

export interface ActiveIntegrations {
  zustand: boolean
  context: boolean
  heap: boolean
  reactQuery: boolean
}

export async function detectIntegrations(): Promise<ActiveIntegrations> {
  const [zustand, reactQuery] = await Promise.all([
    detectZustand(),
    detectReactQuery(),
  ])

  const heap = typeof performance !== 'undefined' && 'memory' in performance

  if (zustand)    emitter.emit('integration:ready', { name: 'zustand' })
                  emitter.emit('integration:ready', { name: 'context' })
  if (heap)       emitter.emit('integration:ready', { name: 'heap' })
  if (reactQuery) emitter.emit('integration:ready', { name: 'react-query' })

  return { zustand, context: true, heap, reactQuery }
}
