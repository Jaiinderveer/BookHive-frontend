import apiClient from './apiClient.js'

// POST /transactions/issue — librarian only.
export async function issueBook(payload) {
  const { data } = await apiClient.post('/transactions/issue', payload)
  return data
}

// POST /transactions/return — librarian only.
export async function returnBook(payload) {
  const { data } = await apiClient.post('/transactions/return', payload)
  return data
}

// GET /transactions/ — librarian only.
export async function getTransactions() {
  const { data } = await apiClient.get('/transactions/')
  return data
}

// GET /transactions/{id} — librarian only.
export async function getTransaction(id) {
  const { data } = await apiClient.get(`/transactions/${id}`)
  return data
}

// GET /transactions/book/{book_id} — librarian only.
export async function getBookTransactions(bookId) {
  const { data } = await apiClient.get(`/transactions/book/${bookId}`)
  return data
}

// GET /transactions/my — any authenticated user (returns the caller's own transactions).
export async function getMyTransactions() {
  const { data } = await apiClient.get('/transactions/my')
  return data
}
