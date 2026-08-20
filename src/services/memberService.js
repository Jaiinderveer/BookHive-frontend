import apiClient from './apiClient.js'

// POST /members/ — librarian only.
export async function createMember(payload) {
  const { data } = await apiClient.post('/members/', payload)
  return data
}

// GET /members/ — librarian only.
export async function getMembers() {
  const { data } = await apiClient.get('/members/')
  return data
}

// GET /members/{id} — librarian only.
export async function getMember(id) {
  const { data } = await apiClient.get(`/members/${id}`)
  return data
}

// POST /members/{id}/account — librarian only. Creates a login for a profile without one.
export async function createMemberAccount(id, payload) {
  const { data } = await apiClient.post(`/members/${id}/account`, payload)
  return data
}

// PUT /members/{id} — librarian only.
export async function updateMember(id, payload) {
  const { data } = await apiClient.put(`/members/${id}`, payload)
  return data
}

// DELETE /members/{id} — librarian only.
export async function deleteMember(id) {
  const { data } = await apiClient.delete(`/members/${id}`)
  return data // { detail }
}
