import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createAppTheme, lightPalette, darkPalette } from '../theme.js'

const ThemeContext = createContext(null)

const THEME_KEY = 'bookhive_theme'

function getInitialMode() {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(THEME_KEY)
  if (stored) return stored
  return 'system'
}

function getSystemMode() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyMode(mode) {
  const resolved = mode === 'system' ? getSystemMode() : mode
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.style.colorScheme = resolved
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => getInitialMode())
  const [resolvedMode, setResolvedMode] = useState(() => {
    const m = getInitialMode()
    return m === 'system' ? getSystemMode() : m
  })

  useEffect(() => {
    applyMode(mode)
    localStorage.setItem(THEME_KEY, mode)
    setResolvedMode(mode === 'system' ? getSystemMode() : mode)
  }, [mode])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (mode === 'system') {
        const newResolved = mediaQuery.matches ? 'dark' : 'light'
        setResolvedMode(newResolved)
        applyMode('system')
      }
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [mode])

  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode])

  const toggleTheme = () => {
    const modes = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(mode)
    const nextIndex = (currentIndex + 1) % modes.length
    setMode(modes[nextIndex])
  }

  const setTheme = (newMode) => {
    if (['light', 'dark', 'system'].includes(newMode)) {
      setMode(newMode)
    }
  }

  const value = useMemo(
    () => ({ mode, resolvedMode, theme, toggleTheme, setTheme, setMode }),
    [mode, resolvedMode, theme]
  )

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}