import { detectIntegrations } from './integrations'
import { mountPanel } from './panel'

export interface MemnitorConfig {
  defaultLimitKB?: number
}

export async function init(config: MemnitorConfig = {}): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return

  const integrations = await detectIntegrations()

  console.log('[react-state-vitals] Active integrations:', integrations)

  mountPanel()
}

// Re-exports for consumers
export { emitter } from './core/emitter'
export { getRegistry, clearRegistry } from './core/registry'
export { getHeapSnapshot, isHeapAvailable } from './core/memory'
export { createMonitoredContext, useContextMonitor, monitorContext, patchContext } from './integrations/context'
export type { MonitoredContext } from './integrations/context'
export type { ActiveIntegrations } from './integrations'
