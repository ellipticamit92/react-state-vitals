# react-state-vitals

Zero-config memory monitor for React apps — Zustand, React Context, React Query, and JS heap. Displays a live floating panel in development showing store sizes, re-render counts, and heap usage.

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
monitorQueryClient(queryClient, 'ReactQuery', 1024)           // TanStack Query
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

Keep your existing store unchanged. Call `monitorStore` once in your setup file:

```ts
import { monitorStore } from 'react-state-vitals/zustand'
import { useTodoStore } from '@/store/todo'

monitorStore('TodoStore', useTodoStore)
```

### Option B — `create` drop-in replacement

Replace zustand's `create` with the one from `react-state-vitals/zustand`. Stores are auto-named from `devtools({ name })` or `persist({ name })`:

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

### Option A — `patchContext` (no changes to provider files)

Call once in your setup file. Works on any context, including third-party ones:

```ts
import { patchContext } from 'react-state-vitals'
import { AuthContext } from '@/context/auth'

patchContext('Auth', AuthContext, { limitKB: 200 })
```

### Option B — `useContextMonitor` hook (inside your provider)

Add one line inside your existing provider component:

```tsx
import { useContextMonitor } from 'react-state-vitals'

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  useContextMonitor('Auth', state, { limitKB: 200 })          // ← one line

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
}
```

For `useMemo` derived values use the `getValue` option:

```tsx
const value = useMemo(() => computeExpensive(state), [state])
useContextMonitor('Product', value, { getValue: () => value, limitKB: 800 })
```

> **Warning:** using both `patchContext` and `useContextMonitor` for the same context will display a conflict warning in the panel. Pick one.

---

## React Query (TanStack Query)

```ts
import { monitorQueryClient } from 'react-state-vitals/react-query'
import { queryClient } from '@/lib/query-client'

monitorQueryClient(queryClient)                    // name defaults to 'ReactQuery'
monitorQueryClient(queryClient, 'MyQueries', 1024) // custom name + limit in KB
```

---

## Panel features

- **JS Heap** — used / limit with live progress bar (polled every 2 s)
- **Zustand stores** — size in KB, re-render count, green status bar
- **Context providers** — size in KB, re-render count, blue status bar
- **React Query** — total cache size, per-query status (fetching / stale / error / observers)
- **Total size** — footer showing sum of all monitored memory (stores + heap)
- **Conflict warnings** — yellow banner when the same context is double-monitored

---

## API reference

### `react-state-vitals`

| Export | Description |
|---|---|
| `init()` | Mount the panel. Call once before the React tree renders. |
| `patchContext(name, context, options?)` | Patch an existing Context to auto-monitor it. |
| `useContextMonitor(name, value, options?)` | Hook for monitoring a context value from inside its provider. |
| `createMonitoredContext(name, limitKB?)` | Create a new context + provider with monitoring built in. |
| `emitter` | Internal event bus (advanced use). |

#### `useContextMonitor` / `patchContext` options

```ts
interface UseContextMonitorOptions {
  limitKB?: number          // warning threshold in KB (default: 50)
  getValue?: () => unknown  // getter for derived/useMemo values
}
```

---

### `react-state-vitals/zustand`

| Export | Description |
|---|---|
| `monitorStore(name, store, limitKB?)` | Attach monitoring to an existing zustand store hook. |
| `unmonitorStore(name)` | Remove monitoring from a store. |
| `create` | Drop-in replacement for zustand's `create`. Auto-registers stores. |
| `devtools` | Drop-in replacement for zustand's `devtools` middleware. |
| `persist` | Drop-in replacement for zustand's `persist` middleware. |

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
