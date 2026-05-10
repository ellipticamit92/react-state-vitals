/**
 * Todo store — uses `create` from react-state-vitals/zustand (drop-in
 * replacement for the regular zustand `create`). The store is automatically
 * registered with the debug panel.
 */
import { create } from 'react-state-vitals/zustand'

export type Filter = 'all' | 'active' | 'completed'

export interface Todo {
  id: number
  text: string
  completed: boolean
}

interface TodoState {
  todos: Todo[]
  filter: Filter
  nextId: number
  addTodo: (text: string) => void
  toggleTodo: (id: number) => void
  removeTodo: (id: number) => void
  clearCompleted: () => void
  setFilter: (filter: Filter) => void
  seedTodos: (todos: Pick<Todo, 'id' | 'text'>[]) => void
}

export const useTodoStore = create<TodoState>()((set) => ({
  todos: [],
  filter: 'all',
  nextId: 1,

  addTodo: (text) =>
    set((s) => ({
      todos: [...s.todos, { id: s.nextId, text, completed: false }],
      nextId: s.nextId + 1,
    })),

  toggleTodo: (id) =>
    set((s) => ({
      todos: s.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    })),

  removeTodo: (id) =>
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),

  clearCompleted: () =>
    set((s) => ({ todos: s.todos.filter((t) => !t.completed) })),

  setFilter: (filter) => set({ filter }),

  seedTodos: (todos) =>
    set((s) => ({
      todos: todos.map((t) => ({ ...t, completed: false })),
      nextId: Math.max(...todos.map((t) => t.id), s.nextId) + 1,
    })),
}))
