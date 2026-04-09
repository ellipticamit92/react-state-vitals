// Zustand integration — only activates if zustand is installed in the consuming app.
// Users import { create } from 'react-state-vitals/zustand' as a drop-in replacement.

let zustandAvailable = false

export async function detectZustand(): Promise<boolean> {
  try {
    // Static string import so Vite/webpack can resolve it from the consuming
    // app's node_modules. Fails gracefully if zustand is not installed.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await import('zustand')
    zustandAvailable = true
    return true
  } catch {
    return false
  }
}

export function isZustandAvailable(): boolean {
  return zustandAvailable
}

// Patched create — auto-registers stores with memnitor
export { create } from './create'

// Middleware re-exports with name interception (drop-in for "zustand/middleware")
export { devtools, persist } from './middleware'

// Attach monitoring to any existing zustand store without changing its imports
export { monitorStore, unmonitorStore } from './monitor'
