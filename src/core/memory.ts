// Browser JS heap monitor via performance.memory (Chrome/Edge only)
export function isHeapAvailable(): boolean {
  return typeof performance !== 'undefined' && 'memory' in performance
}

export interface HeapSnapshot {
  usedMB: number
  totalMB: number
  limitMB: number
  timestamp: number
}

export function getHeapSnapshot(): HeapSnapshot | null {
  if (!isHeapAvailable()) return null

  // performance.memory is a non-standard Chrome API
  const mem = (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory

  return {
    usedMB: mem.usedJSHeapSize / 1_048_576,
    totalMB: mem.totalJSHeapSize / 1_048_576,
    limitMB: mem.jsHeapSizeLimit / 1_048_576,
    timestamp: Date.now(),
  }
}
