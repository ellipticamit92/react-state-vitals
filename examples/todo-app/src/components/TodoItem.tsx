import { type Todo, useTodoStore } from '../store/todoStore'
import { useTheme } from '../context/ThemeContext'

interface Props {
  todo: Todo
}

export function TodoItem({ todo }: Props) {
  const toggleTodo = useTodoStore((s) => s.toggleTodo)
  const removeTodo = useTodoStore((s) => s.removeTodo)
  const { theme } = useTheme()

  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 0',
        borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#f0f0f0'}`,
      }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        style={{ width: 18, height: 18, accentColor: '#6366f1', cursor: 'pointer' }}
      />
      <span
        style={{
          flex: 1,
          fontSize: 15,
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed
            ? theme === 'dark' ? '#666' : '#bbb'
            : theme === 'dark' ? '#f0f0f0' : '#111',
        }}
      >
        {todo.text}
      </span>
      <button
        onClick={() => removeTodo(todo.id)}
        aria-label="Delete todo"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: theme === 'dark' ? '#666' : '#ccc',
          fontSize: 18,
          lineHeight: 1,
          padding: '0 4px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = theme === 'dark' ? '#666' : '#ccc')
        }
      >
        &times;
      </button>
    </li>
  )
}
