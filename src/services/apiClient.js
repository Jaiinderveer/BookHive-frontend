import axios from 'axios'

// Single Axios instance for the whole app.
// Base URL comes from the environment (VITE_API_URL) — never hardcoded.
//
// Development may fall back to a local backend. A production build must not:
// silently pointing a deployed app at localhost makes every request fail as an
// apparent network/CORS problem, which hides the real cause (an unset variable).
// So in production a missing VITE_API_URL leaves the base URL empty and every
// request fails immediately with the message below, which names what to set.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')

const MISSING_API_URL_MESSAGE =
  'VITE_API_URL is not set. Set it in the deployment environment and rebuild; ' +
  'only development falls back to a local backend.'

if (!API_URL) {
  // Reported once at load so the cause is visible before anything is clicked.
  // The throw itself lives in the request interceptor rather than here: a
  // top-level throw is provably unconditional, so the bundler drops this
  // module's remaining statements and exports and the build fails with an
  // unrelated "missing export" error instead.
  console.error(`BookHive configuration error: ${MISSING_API_URL_MESSAGE}`)
}

const TOKEN_KEY = 'bookhive_token'

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

// Attach the JWT to every outgoing request when present.
apiClient.interceptors.request.use((config) => {
  // With no configured base URL, requests would go to whatever origin is
  // serving the app. Fail loudly instead of sending them somewhere wrong.
  if (!API_URL) {
    throw new Error(MISSING_API_URL_MESSAGE)
  }
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Centralized response handling:
// - Pass through successful responses.
// - On a 401 that means the stored JWT is no longer usable, drop the session,
//   notify the app, and reject the ORIGINAL error.
//
// There is deliberately no token refresh here. The backend exposes no refresh
// endpoint — its /auth router is register, login, GET/PUT /me and
// change-password — so the POST /auth/refresh this used to attempt could only
// ever 404. That doomed round trip re-sent the stale token, and its 404 was then
// rejected in place of the original 401, so an expired session told the user
// "The requested resource was not found." instead of asking them to log in
// again. Nothing is retried now, so no retry loop is possible either.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Anything without a response (a network failure, or the missing-config
    // error thrown above) has no status and must not end the session.
    const status = error.response?.status
    const url = error.config?.url || ''

    // A 401 does not always mean the session ended:
    // - /auth/login: the username or password is wrong.
    // - /auth/change-password: the current password is wrong.
    // Both must report their own failure and leave the session untouched.
    const sessionExpired =
      status === 401 &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/change-password')

    if (sessionExpired) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new CustomEvent('bookhive:unauthorized'))
    }

    // Reject the original error, so getErrorMessage() sees the 401 and produces
    // the session-expired message.
    return Promise.reject(error)
  }
)
// Convert any Axios error into a human-readable message.
// Never show raw Axios errors in the UI.
export function getErrorMessage(
  error,
  fallback = 'Something went wrong. Please try again.'
) {
  if (!error) return fallback

  if (error.response) {
    const status = error.response.status
    const data = error.response.data
    const url = error.config?.url || ''

    // Login errors
    if (
      status === 401 &&
      url.includes('/auth/login')
    ) {
      if (typeof data?.detail === 'string') {
        return data.detail
      }

      if (typeof data?.message === 'string') {
        return data.message
      }

      return 'Invalid username or password.'
    }

    // Change-password errors
    // A 401 here means the CURRENT PASSWORD is usually wrong,
    // not that the JWT has expired.
    if (
      url.includes('/auth/change-password')
    ) {
      if (typeof data?.detail === 'string') {
        return data.detail
      }

      if (typeof data?.message === 'string') {
        return data.message
      }

      if (status === 401) {
        return 'Current password is incorrect.'
      }

      if (status === 400) {
        return 'Invalid password information.'
      }
    }

    // Other authentication failures
    if (status === 401) {
      return 'Your session has expired. Please log in again.'
    }

    if (status === 403) {
      return 'You do not have permission to perform this action.'
    }

    if (status === 404) {
      return 'The requested resource was not found.'
    }

    // FastAPI validation errors
    if (Array.isArray(data?.detail)) {
      const messages = data.detail
        .map((item) => item.msg)
        .filter(Boolean)

      if (messages.length) {
        return messages.join(' ')
      }
    }

    // FastAPI normal detail
    if (typeof data?.detail === 'string') {
      return data.detail
    }

    // Generic API message
    if (typeof data?.message === 'string') {
      return data.message
    }

    return fallback
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.'
  }

  // No response from server = actual connectivity problem
  if (error.request) {
    return 'Network error. Please check your connection and try again.'
  }

  return error.message || fallback
}
// Decode JWT token to check expiration
export function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 // Convert to milliseconds
  } catch {
    return null
  }
}

// Check if token is expired or about to expire (within 1 minute)
export function isTokenExpired(token) {
  const exp = decodeToken(token)
  return exp ? Date.now() >= exp - 60000 : true // 1 minute buffer
}

export { API_URL, TOKEN_KEY }
export default apiClient
