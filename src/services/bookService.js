import apiClient from './apiClient.js'

// POST /books/ — librarian only.
export async function createBook(payload) {
  const { data } = await apiClient.post('/books/', payload)
  return data
}

// GET /books/ — any authenticated user.
// Optional query params: title, author, isbn, category (server-side regex filters).
export async function getBooks(filters = {}) {
  const params = {}
  if (filters.title) params.title = filters.title
  if (filters.author) params.author = filters.author
  if (filters.isbn) params.isbn = filters.isbn
  if (filters.category) params.category = filters.category
  const { data } = await apiClient.get('/books/', { params })
  return data
}

// GET /books/{id} — any authenticated user.
export async function getBook(id) {
  const { data } = await apiClient.get(`/books/${id}`)
  return data
}

// PUT /books/{id} — librarian only.
export async function updateBook(id, payload) {
  const { data } = await apiClient.put(`/books/${id}`, payload)
  return data
}

// DELETE /books/{id} — librarian only.
export async function deleteBook(id) {
  const { data } = await apiClient.delete(`/books/${id}`)
  return data // { detail }
}
