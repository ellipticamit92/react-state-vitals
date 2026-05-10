import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTodoStore } from '../store/todoStore'
import { useTheme } from '../context/ThemeContext'
import { TodoItem } from './TodoItem'

interface RemoteTodo {
  id: number
  title: string
  completed: boolean
}

async function fetchSampleTodos(): Promise<RemoteTodo[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
  if (!res.ok) throw new Error('Failed to fetch todos')
  return res.json()
}

export function TodoList() {
  const todos = useTodoStore((s) => s.todos)
  const filter = useTodoStore((s) => s.filter)
  const seedTodos = useTodoStore((s) => s.seedTodos)
  const { theme } = useTheme()

  // Fetch sample todos from a public API to demo React Query monitoring
  const { data, isLoading, isError } = useQuery({
    queryKey: ['sample-todos'],
    queryFn: fetchSampleTodos,
  })

  // Seed the store once remote todos arrive and store is empty
  useEffect(() => {
    if (data && todos.length === 0) {
      seedTodos(data.map((t) => ({ id: t.id, text: t.title })))
    }
  }, [data, todos.length, seedTodos])

  const visible = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  if (isLoading && todos.length === 0) {
    return (
      <p style={{ color: theme === 'dark' ? '#aaa' : '#888', padding: '16px 0' }}>
        Loading sample todos...
      </p>
    )
  }

  if (isError && todos.length === 0) {
    return (
      <p style={{ color: '#ef4444', padding: '16px 0' }}>
        Could not load sample todos. Add one above!
      </p>
    )
  }

  if (visible.length === 0) {
    return (
      <p style={{ color: theme === 'dark' ? '#555' : '#ccc', padding: '16px 0' }}>
        No todos here.
      </p>
    )
  }

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {visible.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
