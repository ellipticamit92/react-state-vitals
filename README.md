# react-state-vitals

🚀 **Zero-config memory & render monitor for React apps**

Track re-renders, monitor memory usage, and debug state behavior in real-time — across **Zustand, React Context, React Query, and JS heap**.

Displays a live floating panel in development showing:

* store sizes
* re-render counts
* consumer component breakdowns
* heap usage

Supports **React 17, 18, and 19**.

---

![npm](https://img.shields.io/npm/v/react-state-vitals)
![downloads](https://img.shields.io/npm/dw/react-state-vitals)
![license](https://img.shields.io/npm/l/react-state-vitals)

---

## 🎥 Demo

> Add your demo GIF here (this will massively improve adoption)

```md
![demo](./demo.gif)
```

---

## ✨ Why this exists

While working on production React apps, I kept hitting the same questions:

* Why is this component re-rendering?
* Why is memory usage increasing?
* Which state is actually causing the issue?

Existing tools like React DevTools help — but they don’t give **real-time visibility into memory + state behavior together**.

👉 So I built **react-state-vitals**

---

## ⚡ What you get

* 🧠 **Memory monitoring (JS heap)**
* 🔁 **Render tracking (components & providers)**
* 🧩 **Zustand store size tracking**
* ⚛️ **React Context consumer tracking**
* 🔄 **React Query cache insights**
* 📦 **Zero configuration**
* 🪟 **Floating draggable panel**
* ⚡ **Real-time updates**

---

## 📦 Installation

```bash
npm install react-state-vitals
```

---

## 🚀 Quick start

Create a setup file that runs once before your React tree mounts:

```ts
// src/lib/state-vitals.setup.ts
import { init, patchContext } from 'react-state-vitals'
import { monitorStore } from 'react-state-vitals/zustand'
import { monitorQueryClient } from 'react-state-vitals/react-query'

import { useTodoStore } from '@/store/todo'
import { AuthContext } from '@/context/auth'
import { queryClient } from '@/lib/query-client'

init()
monitorStore('TodoStore', useTodoStore)
patchContext('Auth', AuthContext, { limitKB: 200 })
monitorQueryClient(queryClient, 'AppQueries')
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

## 🧩 Zustand

### Option A — `monitorStore`

```ts
import { monitorStore } from 'react-state-vitals/zustand'
import { useTodoStore } from '@/store/todo'

monitorStore('TodoStore', useTodoStore)
```

---

### Option B — `create` drop-in replacement

```ts
import { create, devtools, persist } from 'react-state-vitals/zustand'

export const useTodoStore = create<TodoState>()(
  devtools(
    persist((set) => ({ ... }), { name: 'TodoStore' }),
    { name: 'TodoStore' }
  )
)
```

---

## ⚛️ React Context

### Option A — `patchContext`

```ts
import { patchContext } from 'react-state-vitals'
import { AuthContext } from '@/context/auth'

patchContext('Auth', AuthContext, { limitKB: 200 })
```

Automatically:

* tracks provider renders
* measures value size
* tracks **which consumer components re-render**

---

### Option B — `useContextMonitor`

```tsx
import { useContextMonitor } from 'react-state-vitals'

useContextMonitor('Auth', state, { limitKB: 200 })
```

---

### Option C — `monitorContext`

```tsx
import { monitorContext } from 'react-state-vitals'

export const AuthMonitor = monitorContext('Auth', AuthContext)
```

---

### Option D — `createMonitoredContext`

```tsx
import { createMonitoredContext } from 'react-state-vitals'

const { Context, Provider } = createMonitoredContext('Auth', 200)
```

---

## 🔄 React Query

```ts
import { monitorQueryClient } from 'react-state-vitals/react-query'
import { queryClient } from '@/lib/query-client'

monitorQueryClient(queryClient)
```

---

## 📊 Panel Features

| Section | What it shows                            |
| ------- | ---------------------------------------- |
| Heap    | JS heap usage (live)                     |
| Zustand | Store size + re-renders                  |
| Context | Value size + provider + consumer renders |
| Cache   | Query cache size + status                |
| Total   | Combined memory footprint                |

---

## ⚔️ Comparison

| Feature              | React DevTools | react-state-vitals |
| -------------------- | -------------- | ------------------ |
| Render tracking      | ✅              | ✅                  |
| Memory monitoring    | ❌              | ✅                  |
| Zustand tracking     | ❌              | ✅                  |
| React Query insights | ❌              | ✅                  |
| Floating panel       | ❌              | ✅                  |

---

## 🛠 API Reference

(kept your original — already strong)

---

## 🧠 Use Cases

* Debug unnecessary re-renders
* Detect memory leaks
* Track global state growth
* Optimize performance bottlenecks
* Understand app behavior in real-time

---

## 📄 License

MIT © Amit Kumar

---

## ⭐ Support

If you find this useful, consider giving it a ⭐ — it helps a lot!
