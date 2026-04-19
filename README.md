# react-state-vitals

Zero-config memory & render monitor for React apps — Zustand, React Context, React Query, and JS heap. Displays a live floating panel in development showing store sizes, re-render counts, consumer component breakdowns, and heap usage.

Supports **React 17, 18, and 19**.

---

## Installation

```bash
npm install react-state-vitals
```

---

## Quick start

Create a setup file that runs once before your React tree mounts:

```ts
// src/lib/state-vitals.setup.ts
import { init, patchContext } from 'react-state-vitals'
import { monitorStore } from 'react-state-vitals/zustand'
import { monitorQueryClient } from 'react-state-vitals/react-query'

import { useTodoStore } from '@/store/todo'
import { AuthContext } from '@/context/auth'
import { queryClient } from '@/lib/query-client'

init()                                                        // mounts the panel
monitorStore('TodoStore', useTodoStore)                       // Zustand store
patchContext('Auth', AuthContext, { limitKB: 200 })           // React Context
monitorQueryClient(queryClient, 'AppQueries')                 // TanStack Query
```

Import it as a side-effect inside a client component (Next.js App Router):

```tsx
// components/StateVitalsProvider.tsx
"use client"
import "@/lib/state-vitals.setup"

export function StateVitalsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

```tsx
// app/layout.tsx
import { StateVitalsProvider } from '@/components/StateVitalsProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <StateVitalsProvider />
        {children}
      </body>
    </html>
  )
}
```

The panel only mounts in development (`NODE_ENV !== 'production'`), so no changes are needed before shipping.

---

## Zustand

### Option A — `monitorStore` (no changes to store files)

```ts
import { monitorStore } from 'react-state-vitals/zustand'
import { useTodoStore } from '@/store/todo'

monitorStore('TodoStore', useTodoStore)
```

### Option B — `create` drop-in replacement

Replace Zustand's `create` with the one from `react-state-vitals/zustand`. Stores are auto-named from `devtools({ name })` or `persist({ name })`:

```ts
// store/todo.ts
import { create, devtools, persist } from 'react-state-vitals/zustand'

export const useTodoStore = create<TodoState>()(
  devtools(
    persist((set) => ({ ... }), { name: 'TodoStore' }),
    { name: 'TodoStore' }
  )
)
```

---

## React Context

### Option A — `patchContext` (zero changes to provider or consumer files)

Call once in your setup file. Works on any context — your own or third-party. Compatible with React 17, 18, and 19.

```ts
// state-vitals.setup.ts
import { patchContext } from 'react-state-vitals'
import { AuthContext } from '@/context/auth'

patchContext('Auth', AuthContext, { limitKB: 200 })
```

`patchContext` automatically:
- Wraps `Context.Provider` to track value size and provider re-renders
- Intercepts `context._currentValue` to track **which consumer components re-render** — no changes needed in consumers

### Option B — `useContextMonitor` (inside your provider)

Add one line inside your existing provider component:

```tsx
import { useContextMonitor } from 'react-state-vitals'

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useContextMonitor('Auth', state, { limitKB: 200 })   // ← one line

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
}
```

To also track which consumer components re-render, pass the context object:

```tsx
useContextMonitor('Auth', state, {
  limitKB: 200,
  context: AuthContext,   // ← enables consumer component tracking
})
```

For `useMemo` derived values, use `getValue`:

```tsx
const value = useMemo(() => computeExpensive(state), [state])
useContextMonitor('Auth', state, { getValue: () => value, limitKB: 800 })
```

### Option C — `monitorContext` (wrapper component, no provider changes)

Returns a wrapper component you place inside the provider. Useful when you cannot modify the provider file:

```tsx
// state-vitals.setup.ts
import { monitorContext } from 'react-state-vitals'
import { AuthContext } from '@/context/auth'

export const AuthMonitor = monitorContext('Auth', AuthContext, { limitKB: 200 })
```

```tsx
// layout.tsx
<AuthProvider>
  <AuthMonitor>
    <App />
  </AuthMonitor>
</AuthProvider>
```

### Option D — `createMonitoredContext` (new contexts)

Use instead of `React.createContext` when creating new contexts:

```tsx
import { createMonitoredContext } from 'react-state-vitals'

const { Context: AuthContext, Provider: AuthProvider } =
  createMonitoredContext<AuthState>('Auth', 200)

// Use AuthContext and AuthProvider exactly like normal React context
```

### Consumer tracking without modifying consumers

All context APIs automatically track which components call `useContext()` on a monitored context by intercepting `context._currentValue` — the internal property React reads during fiber rendering. No changes are needed in any consumer component. The panel lists every consumer component with its individual render count.

> **Note:** Using both `patchContext` and `useContextMonitor` for the same context name will show a conflict warning in the panel. Pick one.

---

## React Query (TanStack Query)

```ts
import { monitorQueryClient } from 'react-state-vitals/react-query'
import { queryClient } from '@/lib/query-client'

monitorQueryClient(queryClient)                     // name defaults to 'ReactQuery'
monitorQueryClient(queryClient, 'AppQueries', 1024) // custom name + limit in KB
```

---

## Panel features

| Section | What it shows |
|---|---|
| **Heap** | JS heap used / limit with live progress bar (polled every 2 s) |
| **Zustand** | Store size in KB, re-render count, green status bar |
| **Context** | Value size in KB, provider render count (violet), total consumer renders (cyan), every consumer component with its individual render count |
| **Cache** | Total React Query cache size, per-query status (fetching / stale / error), observer count |
| **Total size** | Footer sum of all monitored memory (stores + heap) |
| **Conflict warnings** | Yellow banner when the same context name is double-monitored |

The panel is draggable, resizable, and snaps to the nearest corner on release.

---

## API reference

### `react-state-vitals`

| Export | Signature | Description |
|---|---|---|
| `init` | `init(): Promise<void>` | Mount the floating panel. Call once before the React tree renders. |
| `patchContext` | `patchContext(name, context, options?)` | Patch an existing Context — wraps the Provider and enables consumer tracking. React 19 compatible. |
| `useContextMonitor` | `useContextMonitor(name, value, options?)` | Hook for monitoring context from inside a provider. |
| `monitorContext` | `monitorContext(name, context, options?)` | Returns a wrapper component that monitors context from outside the provider. |
| `createMonitoredContext` | `createMonitoredContext(name, limitKB?)` | Create a new monitored context with built-in tracking. |
| `useTrackedContext` | `useTrackedContext(name, context, componentName?)` | Consumer-side hook for explicit opt-in tracking. |
| `createTrackedContextHook` | `createTrackedContextHook(name, context)` | Creates a tracked replacement for your existing `useXxxContext` hook. |
| `emitter` | — | Internal event bus. Subscribe to `store:update`, `store:warning`, `panel:conflict`. |
| `getRegistry` | `getRegistry(): Map<string, RegistryEntry>` | Access the live store registry. |

#### `UseContextMonitorOptions`

```ts
interface UseContextMonitorOptions {
  limitKB?: number          // warning threshold in KB (default: 50)
  getValue?: () => unknown  // getter for derived / useMemo values
  context?: Context<unknown>  // pass the Context to enable consumer component tracking
}
```

---

### `react-state-vitals/zustand`

| Export | Description |
|---|---|
| `monitorStore(name, store, limitKB?)` | Attach monitoring to an existing Zustand store hook. |
| `unmonitorStore(name)` | Remove monitoring from a store. |
| `create` | Drop-in replacement for Zustand's `create`. Auto-registers stores. |
| `devtools` | Drop-in replacement for Zustand's `devtools` middleware. |
| `persist` | Drop-in replacement for Zustand's `persist` middleware. |

---

### `react-state-vitals/react-query`

| Export | Description |
|---|---|
| `monitorQueryClient(client, name?, limitKB?)` | Attach monitoring to a TanStack QueryClient. Returns an unsubscribe function. |

---

## Peer dependencies

All optional — only install what you use:

| Package | Version |
|---|---|
| `react` | `>=17.0.0` |
| `react-dom` | `>=17.0.0` |
| `zustand` | `>=4.0.0` |
| `@tanstack/react-query` | `>=4.0.0` |

---

## License

MIT
