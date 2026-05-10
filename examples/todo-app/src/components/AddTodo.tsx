import { useState } from 'react'
import { useTodoStore } from '../store/todoStore'
import { useTheme } from '../context/ThemeContext'

export function AddTodo() {
  const [text, setText] = useState('')
  const addTodo = useTodoStore((s) => s.addTodo)
  const { theme } = useTheme()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    addTodo(trimmed)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: 8,
          border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
          background: theme === 'dark' ? '#2a2a2a' : '#fff',
          color: theme === 'dark' ? '#f0f0f0' : '#111',
          fontSize: 15,
          outline: 'none',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '10px 18px',
          borderRadius: 8,
          border: 'none',
          background: '#6366f1',
          color: '#fff',
          fontSize: 15,
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Add
      </button>
    </form>
  )
}
