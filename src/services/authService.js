import apiClient from './apiClient.js'

// POST /auth/login uses OAuth2 password form (URL-encoded form body).
export async function login(username, password) {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  const { data } = await apiClient.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data // { access_token, token_type }
}

// POST /auth/register — always creates a member account.
export async function register(payload) {
  const { data } = await apiClient.post('/auth/register', payload)
  return data // { id, username, email, role }
}

// GET /auth/me — validates the current session and returns user info.
export async function getMe() {
  const { data } = await apiClient.get('/auth/me')
  return data // { id, username, email, role }
}

// PUT /auth/me — update current user's own profile.
export async function updateMe(payload) {
  const { data } = await apiClient.put('/auth/me', payload)
  return data
}
