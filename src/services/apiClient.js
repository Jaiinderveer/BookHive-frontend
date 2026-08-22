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

// Token refresh state management
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

// Centralized response handling:
// - Pass through successful responses.
// - On 401, attempt token refresh before dropping the session.
// - On refresh failure, drop the stored session and notify the app.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const url = originalRequest?.url || ''

    // Only refresh the JWT when a protected request fails because
    // the authentication token itself is invalid/expired.
    //
    // IMPORTANT:
    // Do NOT refresh for endpoints where 401 can legitimately mean
    // something other than an expired JWT, such as change-password.
    const shouldRefresh =
      status === 401 &&
      !originalRequest?._retry &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/refresh') &&
      !url.includes('/auth/change-password')

    if (!shouldRefresh) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const currentToken = localStorage.getItem(TOKEN_KEY)

      const { data } = await apiClient.post(
        '/auth/refresh',
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      )

      const newToken = data.access_token

      localStorage.setItem(TOKEN_KEY, newToken)

      processQueue(null, newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`

      return apiClient(originalRequest)
    } catch (err) {
      processQueue(err, null)

      localStorage.removeItem(TOKEN_KEY)

      window.dispatchEvent(
        new CustomEvent('bookhive:unauthorized')
      )

      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
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
