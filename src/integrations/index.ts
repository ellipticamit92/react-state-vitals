import { detectZustand } from './zustand'
import { detectReact } from './context'
import { emitter } from '../core/emitter'

export interface ActiveIntegrations {
  zustand: boolean
  context: boolean
  heap: boolean
}

export async function detectIntegrations(): Promise<ActiveIntegrations> {
  const [zustand, context] = await Promise.all([
    detectZustand(),
    detectReact(),
  ])

  const heap = typeof performance !== 'undefined' && 'memory' in performance

  if (zustand) emitter.emit('integration:ready', { name: 'zustand' })
  if (context) emitter.emit('integration:ready', { name: 'context' })
  if (heap)    emitter.emit('integration:ready', { name: 'heap' })

  return { zustand, context, heap }
}
