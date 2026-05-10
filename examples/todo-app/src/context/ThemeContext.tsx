/**
 * ThemeContext — monitored via patchContext() from react-state-vitals.
 * The debug panel will track how often consumers re-render and the
 * serialized size of the context value.
 */
import React, { createContext, useContext, useState } from 'react'
import { patchContext } from 'react-state-vitals'

export type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
})

// Patch the context so react-state-vitals can observe it
patchContext('ThemeContext', ThemeContext, { limitKB: 50 })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  const value: ThemeContextValue = {
    theme,
    toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
