// Lightweight event bus — connects integrations to the panel
type Listener<T> = (data: T) => void

class Emitter<EventMap extends Record<string, any>> {
  private listeners = new Map<keyof EventMap, Set<Listener<unknown>>>()

  on<K extends keyof EventMap>(event: K, fn: Listener<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(fn as Listener<unknown>)
    return () => this.off(event, fn)
  }

  off<K extends keyof EventMap>(event: K, fn: Listener<EventMap[K]>): void {
    this.listeners.get(event)?.delete(fn as Listener<unknown>)
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(data))
  }
}

export interface StateVitalsEvents {
  'store:update': { name: string; sizeKB: number; limitKB: number; keys: string[]; renders?: number; queries?: import('../core/registry').QueryInfo[] }
  'store:warning': { name: string; sizeKB: number; limitKB: number }
  'heap:update': { usedMB: number; totalMB: number; limitMB: number }
  'integration:ready': { name: 'zustand' | 'context' | 'heap' | 'react-query' }
  'panel:conflict': { name: string; message: string }
}

export const emitter = new Emitter<StateVitalsEvents>()
