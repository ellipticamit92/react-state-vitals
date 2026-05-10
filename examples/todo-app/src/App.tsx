import { useTheme } from './context/ThemeContext'
import { AddTodo } from './components/AddTodo'
import { TodoList } from './components/TodoList'
import { FilterBar } from './components/FilterBar'

export function App() {
  const { theme, toggleTheme } = useTheme()

  const bg = theme === 'dark' ? '#1a1a1a' : '#f5f5f5'
  const card = theme === 'dark' ? '#242424' : '#ffffff'
  const text = theme === 'dark' ? '#f0f0f0' : '#111111'

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: bg,
        color: text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 16px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'background 0.2s, color 0.2s',
      }}
    >
      <div style={{ width: '100%', maxWidth: 540 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Todos</h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.5 }}>
              powered by react-state-vitals
            </p>
          </div>
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              background: theme === 'dark' ? '#333' : '#e5e5e5',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              cursor: 'pointer',
              fontSize: 18,
              color: text,
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Card */}
        <div
          style={{
            background: card,
            borderRadius: 12,
            boxShadow: theme === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.5)'
              : '0 4px 24px rgba(0,0,0,0.08)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <AddTodo />
          <TodoList />
          <FilterBar />
        </div>

        <p
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontSize: 12,
            opacity: 0.4,
          }}
        >
          Open DevTools → look for the react-state-vitals panel in the corner
        </p>
      </div>
    </div>
  )
}
