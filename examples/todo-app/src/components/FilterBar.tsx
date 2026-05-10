import { useTodoStore, type Filter } from '../store/todoStore'
import { useTheme } from '../context/ThemeContext'

const FILTERS: Filter[] = ['all', 'active', 'completed']

export function FilterBar() {
  const filter = useTodoStore((s) => s.filter)
  const setFilter = useTodoStore((s) => s.setFilter)
  const clearCompleted = useTodoStore((s) => s.clearCompleted)
  const completedCount = useTodoStore(
    (s) => s.todos.filter((t) => t.completed).length,
  )
  const { theme } = useTheme()

  const activeCount = useTodoStore(
    (s) => s.todos.filter((t) => !t.completed).length,
  )

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        padding: '6px 0',
        fontSize: 13,
        color: theme === 'dark' ? '#aaa' : '#666',
      }}
    >
      <span>{activeCount} item{activeCount !== 1 ? 's' : ''} left</span>

      <div style={{ display: 'flex', gap: 4 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: `1px solid ${filter === f ? '#6366f1' : 'transparent'}`,
              background: 'transparent',
              color: filter === f ? '#6366f1' : theme === 'dark' ? '#aaa' : '#555',
              cursor: 'pointer',
              fontWeight: filter === f ? 700 : 400,
              fontSize: 13,
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {completedCount > 0 && (
        <button
          onClick={clearCompleted}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme === 'dark' ? '#aaa' : '#888',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Clear completed
        </button>
      )}
    </div>
  )
}
