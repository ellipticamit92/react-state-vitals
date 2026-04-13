import { createContext, createElement, Fragment, useRef, useEffect, useContext } from 'react'
import type { Context, ReactNode, ReactElement } from 'react'
import { registerStore, unregisterStore } from '../../core/registry'
import { emitter } from '../../core/emitter'
import type { StoreSnapshot } from '../../core/registry'

const DEFAULT_LIMIT_KB = 50

function measureKB(value: unknown): number {
  try {
    return new Blob([JSON.stringify(value)]).size / 1024
  } catch {
    return 0
  }
}

function keysOf(value: unknown): string[] {
  return value !== null && typeof value === 'object' ? Object.keys(value) : []
}

function notify(
  name: string,
  getValue: () => unknown,
  snapshots: StoreSnapshot[],
  limitKB: number,
  renders: number,
): void {
  const current = getValue()
  const sizeKB = measureKB(current)
  const keys = keysOf(current)

  snapshots.push({ name, sizeKB, limitKB, keys, updatedAt: Date.now(), renders })
  emitter.emit('store:update', { name, sizeKB, limitKB, keys, renders })

  if (sizeKB > limitKB * 0.8) {
    emitter.emit('store:warning', { name, sizeKB, limitKB })
  }
}

export interface UseContextMonitorOptions {
  limitKB?: number
  /**
   * Pass a getter when the value is derived (useMemo, selector, external state).
   * The getter is called on every render to capture the latest derived value
   * without adding it as an effect dependency.
   */
  getValue?: () => unknown
}

/**
 * Drop-in hook — add one call inside any existing Provider component.
 *
 * @example
 * // Basic — tracks useState/useReducer value
 * useContextMonitor('Auth', state)
 *
 * // With size limit
 * useContextMonitor('Auth', state, 200)
 * useContextMonitor('Auth', state, { limitKB: 200 })
 *
 * // Derived / useMemo value
 * const computed = useMemo(() => expensiveDerived(state), [state])
 * useContextMonitor('Auth', state, { getValue: () => computed })
 */
export function useContextMonitor(
  name: string,
  value: unknown,
  options: UseContextMonitorOptions | number = {},
): void {
  const opts: UseContextMonitorOptions =
    typeof options === 'number' ? { limitKB: options } : options
  const { limitKB = DEFAULT_LIMIT_KB, getValue } = opts

  const valueRef = useRef<unknown>(value)
  const getterRef = useRef<(() => unknown) | undefined>(getValue)
  const snapshotsRef = useRef<StoreSnapshot[]>([])
  const renderCountRef = useRef(0)
  valueRef.current = value
  getterRef.current = getValue
  renderCountRef.current += 1

  const stableGetter = useRef(() =>
    getterRef.current ? getterRef.current() : valueRef.current
  ).current

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    snapshotsRef.current = []

    registerStore(name, {
      name,
      type: 'context',
      snapshots: snapshotsRef.current,
      unsub: () => unregisterStore(name),
    })

    notify(name, stableGetter, snapshotsRef.current, limitKB, renderCountRef.current)

    return () => unregisterStore(name)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, limitKB])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    notify(name, stableGetter, snapshotsRef.current, limitKB, renderCountRef.current)
  })
}

/**
 * Monitor an existing React Context from outside the provider.
 * Returns a wrapper component that reads the context value via useContext
 * and forwards it to useContextMonitor — no changes needed in the provider.
 *
 * Place the returned component *inside* the context's Provider in your tree.
 *
 * @example
 * // monitor.setup.ts
 * export const AuthMonitor = monitorContext('Auth', AuthContext, { limitKB: 200 })
 *
 * // root layout
 * <AuthProvider>
 *   <AuthMonitor>
 *     <App />
 *   </AuthMonitor>
 * </AuthProvider>
 */
export function monitorContext<T>(
  name: string,
  context: Context<T>,
  options: UseContextMonitorOptions | number = {},
): (props: { children: ReactNode }) => ReactElement {
  function Monitor({ children }: { children: ReactNode }): ReactElement {
    const value = useContext(context)
    useContextMonitor(name, value, options)
    return createElement(Fragment, null, children)
  }
  Monitor.displayName = `Monitor(${name})`
  return Monitor
}

/**
 * Patch an existing React Context so every <Context.Provider> automatically
 * reports to react-state-vitals — no changes needed in provider files or the component tree.
 *
 * Call once in your react-state-vitals setup file before the React tree mounts.
 * The warning system will alert you in dev if you also have useContextMonitor
 * for the same name, so double-monitoring is caught immediately.
 *
 * Best for: third-party contexts you can't modify, or teams that prefer
 * all monitoring config in one central file.
 *
 * @example
 * // monitor.setup.ts
 * import { init, patchContext } from 'react-state-vitals'
 * import { AuthContext } from '@/contexts/auth'
 *
 * init()
 * patchContext('Auth', AuthContext, { limitKB: 200 })
 */
export function patchContext<T>(
  name: string,
  context: Context<T>,
  options: UseContextMonitorOptions | number = {},
): void {
  if (process.env.NODE_ENV !== 'development') return

  const OriginalProvider = (context as any).Provider

  function MonitoredProvider({
    value,
    children,
  }: {
    value: T
    children: ReactNode
  }): ReactElement {
    useContextMonitor(name, value, options)
    return createElement(OriginalProvider, { value }, children)
  }
  MonitoredProvider.displayName = `Monitor(${name})`

  ;(context as any).Provider = MonitoredProvider
}

export interface MonitoredContext<T> {
  Context: Context<T>
  Provider: (props: { value: T; children: ReactNode }) => React.ReactElement
}

/**
 * Wraps React.createContext with automatic monitoring.
 * The returned Provider reports value size to the StateVitals panel on every change.
 */
export function createMonitoredContext<T>(
  name: string,
  limitKB = DEFAULT_LIMIT_KB,
): MonitoredContext<T> {
  const Context = createContext<T>(undefined as unknown as T)

  function Provider({ value, children }: { value: T; children: ReactNode }) {
    useContextMonitor(name, value, { limitKB })
    return createElement(Context.Provider, { value }, children)
  }

  Provider.displayName = `Monitor(${name})`

  return { Context, Provider }
}
