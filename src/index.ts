import { detectIntegrations } from './integrations'
import { mountPanel } from './panel'

export async function init(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return

  await detectIntegrations()

  mountPanel()
}

// Re-exports for consumers
export { emitter } from './core/emitter'
export { getRegistry, clearRegistry } from './core/registry'
export { getHeapSnapshot, isHeapAvailable } from './core/memory'
export {
  createMonitoredContext,
  createTrackedContextHook,
  useContextMonitor,
  useTrackedContext,
  monitorContext,
  patchContext,
} from './integrations/context'
export type { MonitoredContext } from './integrations/context'
export type { ActiveIntegrations } from './integrations'
