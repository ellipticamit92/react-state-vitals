import { Context, ReactElement, ReactNode } from 'react';

interface QueryInfo {
    key: string;
    sizeKB: number;
    status: 'pending' | 'error' | 'success';
    fetchStatus: 'fetching' | 'paused' | 'idle';
    isStale: boolean;
    observers: number;
    updatedAt: number;
}
interface ContextConsumerRender {
    component: string;
    renders: number;
}
interface StoreSnapshot {
    name: string;
    sizeKB: number;
    limitKB: number;
    keys: string[];
    updatedAt: number;
    renders?: number;
    consumerRenders?: number;
    consumers?: ContextConsumerRender[];
    queries?: QueryInfo[];
}
interface RegistryEntry {
    name: string;
    type: 'zustand' | 'context' | 'cache';
    snapshots: StoreSnapshot[];
    unsub: () => void;
}
declare function getRegistry(): Map<string, RegistryEntry>;
declare function clearRegistry(): void;

type Listener<T> = (data: T) => void;
declare class Emitter<EventMap extends Record<string, any>> {
    private listeners;
    on<K extends keyof EventMap>(event: K, fn: Listener<EventMap[K]>): () => void;
    off<K extends keyof EventMap>(event: K, fn: Listener<EventMap[K]>): void;
    emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void;
}
interface StateVitalsEvents {
    'store:update': {
        name: string;
        sizeKB: number;
        limitKB: number;
        keys: string[];
        renders?: number;
        consumerRenders?: number;
        consumers?: ContextConsumerRender[];
        queries?: QueryInfo[];
    };
    'store:warning': {
        name: string;
        sizeKB: number;
        limitKB: number;
    };
    'heap:update': {
        usedMB: number;
        totalMB: number;
        limitMB: number;
    };
    'integration:ready': {
        name: 'zustand' | 'context' | 'heap' | 'react-query';
    };
    'panel:conflict': {
        name: string;
        message: string;
    };
}
declare const emitter: Emitter<StateVitalsEvents>;

declare function isHeapAvailable(): boolean;
interface HeapSnapshot {
    usedMB: number;
    totalMB: number;
    limitMB: number;
    timestamp: number;
}
declare function getHeapSnapshot(): HeapSnapshot | null;

interface UseContextMonitorOptions {
    limitKB?: number;
    /**
     * Pass a getter when the value is derived (useMemo, selector, external state).
     * The getter is called on every render to capture the latest derived value
     * without adding it as an effect dependency.
     */
    getValue?: () => unknown;
    /**
     * Pass the Context object to enable automatic consumer component tracking.
     * When provided, every component that calls useContext(ctx) will be recorded
     * in the panel — no changes needed in consumer components.
     *
     * @example
     * useContextMonitor('Todo', value, { context: TodoContext })
     */
    context?: Context<unknown>;
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
declare function useContextMonitor(name: string, value: unknown, options?: UseContextMonitorOptions | number): void;
/**
 * Hook for context consumers to track which components re-render
 * when a specific context value changes.
 *
 * @example
 * const value = useTrackedContext('TodoContext', TodoContext, 'TodoList')
 */
declare function useTrackedContext<T>(name: string, context: Context<T>, componentName?: string): T;
/**
 * Creates a tracked context hook that can replace your existing app hook
 * in a single place (for example useTodoContext), without passing names
 * in every consumer component.
 *
 * @example
 * export const useTodoContextTracked = createTrackedContextHook(
 *   'TodoContext',
 *   TodoContext
 * )
 */
declare function createTrackedContextHook<T>(name: string, context: Context<T>): (componentName?: string) => T;
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
declare function monitorContext<T>(name: string, context: Context<T>, options?: UseContextMonitorOptions | number): (props: {
    children: ReactNode;
}) => ReactElement;
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
declare function patchContext<T>(name: string, context: Context<T>, options?: UseContextMonitorOptions | number): void;
interface MonitoredContext<T> {
    Context: Context<T>;
    Provider: (props: {
        value: T;
        children?: unknown;
    }) => ReactElement;
}
/**
 * Wraps React.createContext with automatic monitoring.
 * The returned Provider reports value size to the StateVitals panel on every change.
 */
declare function createMonitoredContext<T>(name: string, limitKB?: number): MonitoredContext<T>;

interface ActiveIntegrations {
    zustand: boolean;
    context: boolean;
    heap: boolean;
    reactQuery: boolean;
}

declare function init(): Promise<void>;

export { type ActiveIntegrations, type MonitoredContext, clearRegistry, createMonitoredContext, createTrackedContextHook, emitter, getHeapSnapshot, getRegistry, init, isHeapAvailable, monitorContext, patchContext, useContextMonitor, useTrackedContext };
