/**
 * react-state-vitals setup
 *
 * Import this file once as a side-effect near your app root (e.g. main.tsx).
 * The debug panel only mounts in development — it is a no-op in production.
 */
import { init } from 'react-state-vitals'
import { monitorStore } from 'react-state-vitals/zustand'
import { monitorQueryClient } from 'react-state-vitals/react-query'
import { useTodoStore } from '../store/todoStore'
import { queryClient } from './queryClient'

// Boot the floating debug panel
init()

// Monitor the Zustand todo store
monitorStore('TodoStore', useTodoStore)

// Monitor the React Query client cache
monitorQueryClient(queryClient, 'AppQueries')

// ThemeContext is patched inside ThemeContext.tsx using patchContext()
