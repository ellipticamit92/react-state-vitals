# Todo App — react-state-vitals demo

A minimal Todo app that exercises every integration surface of **react-state-vitals**:

| Integration | Where |
|---|---|
| `init()` — floating debug panel | `src/lib/state-vitals.setup.ts` |
| `create()` — Zustand store (auto-registered) | `src/store/todoStore.ts` |
| `monitorStore()` — explicit store registration | `src/lib/state-vitals.setup.ts` |
| `patchContext()` — React Context monitoring | `src/context/ThemeContext.tsx` |
| `monitorQueryClient()` — React Query cache | `src/lib/state-vitals.setup.ts` |

## Getting started

```bash
# from the repo root
cd examples/todo-app
npm install
npm run dev
```

Open http://localhost:5173. The react-state-vitals panel will appear in the
corner of the screen (development only). Add/complete/delete todos and toggle
the theme to see render counts and store sizes update in real-time.
