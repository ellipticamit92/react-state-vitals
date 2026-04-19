import * as ReactNs from "react";
import {
  createContext,
  createElement,
  Fragment,
  useRef,
  useEffect,
  useContext,
} from "react";
import type { Context, ReactNode, ReactElement } from "react";
import {
  getRegistry,
  registerStore,
  unregisterStore,
} from "../../core/registry";
import { emitter } from "../../core/emitter";
import type { StoreSnapshot } from "../../core/registry";

const DEFAULT_LIMIT_KB = 50;
const consumerRenderStore = new Map<string, Map<string, number>>();
const trackedContexts = new WeakMap<object, string>();
let isUseContextPatched = false;

export interface ContextConsumerRender {
  component: string;
  renders: number;
}

function getConsumerStats(name: string): ContextConsumerRender[] {
  const stats = consumerRenderStore.get(name);
  if (!stats) return [];
  return Array.from(stats.entries())
    .map(([component, renders]) => ({ component, renders }))
    .sort((a, b) => b.renders - a.renders);
}

function inferComponentNameFromStack(): string {
  const fallback = "AnonymousConsumer";
  const stack = new Error().stack;
  if (!stack) return fallback;

  const lines = stack.split("\n");
  const ignored = new Set([
    "useTrackedContext",
    "patchedUseContext",
    "Object.patchedUseContext",
    "notify",
  ]);
  const ignoredFragments = [
    "node_modules",
    "react-dom",
    "scheduler",
    "__webpack",
    "next/dist",
  ];

  const normalizeComponentName = (rawName: string): string | null => {
    const cleaned = rawName
      .replace(/^Object\./, "")
      .replace(/^Module\./, "")
      .replace(/^exports\./, "")
      .replace(/^eval at .+$/, "")
      .replace(/^\[as .+\]\s*/, "")
      .replace(/\$+/g, "")
      .replace(/^bound\s+/, "")
      .trim();

    if (!cleaned) return null;
    if (!/^[A-Z]/.test(cleaned)) return null;
    if (ignored.has(cleaned)) return null;
    if (
      cleaned === "renderWithHooks" ||
      cleaned === "beginWork" ||
      cleaned === "commitRoot"
    ) {
      return null;
    }
    return cleaned;
  };

  for (const line of lines) {
    if (ignoredFragments.some((fragment) => line.includes(fragment))) continue;
    const match = line.match(/at\s+([A-Za-z0-9_$\.]+)/);
    if (!match) continue;
    const raw = match[1];
    const fnName = raw.includes(".") ? raw.split(".").pop() ?? raw : raw;
    if (!fnName || fnName.startsWith("use")) continue;
    const normalized = normalizeComponentName(fnName);
    if (normalized) return normalized;
  }

  return fallback;
}

function recordConsumerRender(name: string, componentName?: string): void {
  const nextComponentName =
    componentName && componentName.trim().length > 0
      ? componentName
      : inferComponentNameFromStack();

  if (!consumerRenderStore.has(name)) {
    consumerRenderStore.set(name, new Map());
  }
  const contextConsumers = consumerRenderStore.get(name)!;
  contextConsumers.set(
    nextComponentName,
    (contextConsumers.get(nextComponentName) ?? 0) + 1
  );
}

function emitConsumerUpdate(name: string): void {
  const entry = getRegistry().get(name);
  if (!entry) return;
  const last = entry.snapshots[entry.snapshots.length - 1];
  if (!last) return;

  const consumers = getConsumerStats(name);
  const consumerRenders = consumers.reduce((sum, c) => sum + c.renders, 0);
  emitter.emit("store:update", {
    name,
    sizeKB: last.sizeKB,
    limitKB: last.limitKB,
    keys: last.keys,
    renders: last.renders,
    consumerRenders,
    consumers,
  });
}

function ensureUseContextPatched(): void {
  if (isUseContextPatched || process.env.NODE_ENV !== "development") return;

  const descriptor = Object.getOwnPropertyDescriptor(ReactNs, "useContext");
  if (!descriptor || descriptor.configurable !== true) {
    // Some runtimes (e.g. Next SSR bundles) expose a non-configurable export.
    // In that case we skip global patching to avoid runtime crashes.
    return;
  }

  const originalUseContext = ReactNs.useContext;
  const patchedUseContext = function <T>(context: Context<T>): T {
    const value = originalUseContext(context);
    const trackedName = trackedContexts.get(context as unknown as object);
    if (trackedName) {
      recordConsumerRender(trackedName);
      // Defer emit to avoid calling setState during another component's render
      Promise.resolve().then(() => emitConsumerUpdate(trackedName));
    }
    return value;
  } as typeof ReactNs.useContext;

  try {
    Object.defineProperty(ReactNs, "useContext", {
      value: patchedUseContext,
      configurable: true,
      writable: true,
    });
    isUseContextPatched = true;
  } catch {
    // Non-fatal: context size monitoring still works even if hook patching is blocked.
  }
}

/**
 * Intercepts context._currentValue with a getter so every useContext() call
 * — regardless of bundler or module system — is tracked.
 *
 * React reads _currentValue inside its fiber renderer when executing useContext(ctx).
 * By owning the getter we infer which component is rendering from the call stack.
 * Falls back to patching React.useContext if _currentValue is not interceptable.
 */
function setupConsumerTracking(name: string, context: Context<unknown>): void {
  if (process.env.NODE_ENV !== "development") return;

  const ctx = context as unknown as Record<string, unknown>;
  const valueProp = "_currentValue";

  if (!(valueProp in ctx)) {
    // No _currentValue — try the React.useContext patch as fallback
    trackedContexts.set(context as unknown as object, name);
    ensureUseContextPatched();
    return;
  }

  const desc = Object.getOwnPropertyDescriptor(ctx, valueProp);
  // Already intercepted (getter present) — nothing to do
  if (desc && typeof desc.get === "function") return;

  let internalValue: unknown = desc?.value;
  let flushPending = false;

  try {
    Object.defineProperty(ctx, valueProp, {
      enumerable: desc?.enumerable ?? true,
      configurable: true,
      get(): unknown {
        const componentName = inferComponentNameFromStack();
        // Skip React-internal reads that don't originate from a user component
        if (componentName !== "AnonymousConsumer") {
          recordConsumerRender(name, componentName);
          if (!flushPending) {
            flushPending = true;
            Promise.resolve().then(() => {
              flushPending = false;
              emitConsumerUpdate(name);
            });
          }
        }
        return internalValue;
      },
      set(v: unknown) {
        internalValue = v;
      },
    });
  } catch {
    // _currentValue not interceptable — fall back to useContext patching
    trackedContexts.set(context as unknown as object, name);
    ensureUseContextPatched();
  }
}

function measureKB(value: unknown): number {
  try {
    const seen = new WeakSet<object>();
    const json = JSON.stringify(value, (_key, nextValue) => {
      if (typeof nextValue === "bigint") {
        return `${nextValue.toString()}n`;
      }
      if (typeof nextValue === "function") {
        return "[Function]";
      }
      if (typeof nextValue === "symbol") {
        return nextValue.toString();
      }
      if (nextValue && typeof nextValue === "object") {
        if (seen.has(nextValue)) return "[Circular]";
        seen.add(nextValue);
      }
      return nextValue;
    });
    return new Blob([json ?? ""]).size / 1024;
  } catch {
    return 0;
  }
}

function keysOf(value: unknown): string[] {
  return value !== null && typeof value === "object" ? Object.keys(value) : [];
}

function notify(
  name: string,
  getValue: () => unknown,
  snapshots: StoreSnapshot[],
  limitKB: number,
  renders: number
): void {
  const current = getValue();
  const sizeKB = measureKB(current);
  const keys = keysOf(current);
  const consumers = getConsumerStats(name);
  const consumerRenders = consumers.reduce((sum, c) => sum + c.renders, 0);

  snapshots.push({
    name,
    sizeKB,
    limitKB,
    keys,
    updatedAt: Date.now(),
    renders,
    consumerRenders,
    consumers,
  });
  emitter.emit("store:update", {
    name,
    sizeKB,
    limitKB,
    keys,
    renders,
    consumerRenders,
    consumers,
  });

  if (sizeKB > limitKB * 0.8) {
    emitter.emit("store:warning", { name, sizeKB, limitKB });
  }
}

export interface UseContextMonitorOptions {
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
export function useContextMonitor(
  name: string,
  value: unknown,
  options: UseContextMonitorOptions | number = {}
): void {
  const opts: UseContextMonitorOptions =
    typeof options === "number" ? { limitKB: options } : options;
  const { limitKB = DEFAULT_LIMIT_KB, getValue, context } = opts;

  if (context !== undefined && process.env.NODE_ENV === "development") {
    setupConsumerTracking(name, context);
  }

  const valueRef = useRef<unknown>(value);
  const getterRef = useRef<(() => unknown) | undefined>(getValue);
  const snapshotsRef = useRef<StoreSnapshot[]>([]);
  const renderCountRef = useRef(0);
  valueRef.current = value;
  getterRef.current = getValue;
  renderCountRef.current += 1;

  const stableGetter = useRef(() =>
    getterRef.current ? getterRef.current() : valueRef.current
  ).current;

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    snapshotsRef.current = [];

    registerStore(name, {
      name,
      type: "context",
      snapshots: snapshotsRef.current,
      unsub: () => {},
    });

    return () => {
      consumerRenderStore.delete(name);
      unregisterStore(name);
    };
  }, [name, limitKB]); // intentionally omits stableGetter — it never changes identity

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    notify(
      name,
      stableGetter,
      snapshotsRef.current,
      limitKB,
      renderCountRef.current
    );
  });
}

/**
 * Hook for context consumers to track which components re-render
 * when a specific context value changes.
 *
 * @example
 * const value = useTrackedContext('TodoContext', TodoContext, 'TodoList')
 */
export function useTrackedContext<T>(
  name: string,
  context: Context<T>,
  componentName?: string
): T {
  const value = useContext(context);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    recordConsumerRender(name, componentName);
    emitConsumerUpdate(name);
  });

  return value;
}

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
export function createTrackedContextHook<T>(
  name: string,
  context: Context<T>
): (componentName?: string) => T {
  return function useTrackedContextHook(componentName?: string): T {
    return useTrackedContext(name, context, componentName);
  };
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
  options: UseContextMonitorOptions | number = {}
): (props: { children: ReactNode }) => ReactElement {
  if (process.env.NODE_ENV === "development") {
    setupConsumerTracking(name, context as unknown as Context<unknown>);
  }

  // Lowercase name so inferComponentNameFromStack skips this internal wrapper
  // when recording consumer components (only uppercase names are treated as components)
  function monitor({ children }: { children: ReactNode }): ReactElement {
    const value = useContext(context);
    useContextMonitor(name, value, options);
    return createElement(Fragment, null, children);
  }
  monitor.displayName = `Monitor(${name})`;
  return monitor as (props: { children: ReactNode }) => ReactElement;
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
  options: UseContextMonitorOptions | number = {}
): void {
  if (process.env.NODE_ENV !== "development") return;

  setupConsumerTracking(name, context as unknown as Context<unknown>);

  // Read the Provider before patching.
  // React 17/18: Provider is { $$typeof: REACT_PROVIDER_TYPE, _context: ctx }
  // React 19:    Provider is the context object itself (Context IS the provider)
  const ctx = context as unknown as Record<string, unknown>;
  const OriginalProvider = ctx["Provider"];

  function MonitoredProvider({
    value,
    children,
  }: {
    value: T;
    children?: unknown;
  }): ReactElement {
    useContextMonitor(name, value, options);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createElement(OriginalProvider as any, { value }, children as ReactNode);
  }
  MonitoredProvider.displayName = `Monitor(${name})`;

  // Use Object.defineProperty so this works in both React 18 (plain data property)
  // and React 19 (getter-only property — direct assignment throws in strict mode).
  try {
    Object.defineProperty(ctx, "Provider", {
      value: MonitoredProvider,
      configurable: true,
      writable: true,
    });
  } catch {
    console.warn(
      `[react-state-vitals] patchContext: could not patch "${name}" context Provider. ` +
        `Use monitorContext() or useContextMonitor() instead.`
    );
  }
}

export interface MonitoredContext<T> {
  Context: Context<T>;
  Provider: (props: { value: T; children?: unknown }) => ReactElement;
}

/**
 * Wraps React.createContext with automatic monitoring.
 * The returned Provider reports value size to the StateVitals panel on every change.
 */
export function createMonitoredContext<T>(
  name: string,
  limitKB = DEFAULT_LIMIT_KB
): MonitoredContext<T> {
  const Context = createContext<T>(undefined as unknown as T);

  if (process.env.NODE_ENV === "development") {
    setupConsumerTracking(name, Context as unknown as Context<unknown>);
  }

  function Provider({ value, children }: { value: T; children?: unknown }) {
    useContextMonitor(name, value, { limitKB });
    return createElement(Context.Provider, { value }, children as ReactNode);
  }

  Provider.displayName = `Monitor(${name})`;

  return { Context, Provider };
}
