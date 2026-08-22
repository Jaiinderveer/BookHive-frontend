import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as authService from '../services/authService.js'
import { TOKEN_KEY } from '../services/apiClient.js'
import { isTokenExpired } from '../services/apiClient.js'

const AuthContext = createContext(null)

// Tell session-scoped stores (e.g. the AI conversation) to drop their data.
// Used on logout and on a fresh sign-in so one user's data can never be shown
// to the next user on a shared machine.
function notifySessionCleared() {
  window.dispatchEvent(new CustomEvent('bookhive:session-cleared'))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))
  const [validating, setValidating] = useState(false)
  
  const validatingRef = useRef(false)

  // Validate an existing session on app load (or when a token appears).
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    
    if (!token) {
      setUser(null)
      setToken(null)
      setLoading(false)
      return
    }

    // Check if token is expired before making API call
    if (isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
      setToken(null)
      setLoading(false)
      return
    }

    // Prevent race conditions - only one validation at a time
    if (validatingRef.current) {
      return
    }
    
    validatingRef.current = true
    setLoading(true)
    
    try {
      const me = await authService.getMe()
      setUser(me)
    } catch {
      // 401 already clears the token via the interceptor.
      setUser(null)
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
    } finally {
      setLoading(false)
      validatingRef.current = false
    }
  }, [])

  // Validate session on mount
  useEffect(() => {
    validateSession()
  }, [validateSession])

  // Proactive token expiration check - check every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token && isTokenExpired(token)) {
        // Token is about to expire, validate session proactively
        validateSession()
      }
    }, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [validateSession])

  // React to globally emitted 401 events (from the API client).
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null)
      setToken(null)
    }
    window.addEventListener('bookhive:unauthorized', onUnauthorized)
    return () => window.removeEventListener('bookhive:unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await authService.login(username, password)
    // Credentials accepted: discard any conversation left behind by a previous
    // session before this user's data is loaded.
    notifySessionCleared()
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setToken(data.access_token)
    const me = await authService.getMe()
    setUser(me)
    return me
  }, [])

  const register = useCallback(async (payload) => {
    const created = await authService.register(payload)
    await login(payload.username, payload.password)
    return created
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    notifySessionCleared()
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      role: user?.role ?? null,
      isLibrarian: user?.role === 'librarian',
      isMember: user?.role === 'member',
      login,
      register,
      logout,
      refreshUser: validateSession,
    }),
    [user, token, loading, login, register, logout, validateSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
