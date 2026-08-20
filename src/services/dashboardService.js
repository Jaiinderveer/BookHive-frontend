import apiClient from './apiClient.js'

// GET /dashboard/ — librarian only.
// Returns { total_books, total_members, books_issued, books_available,
//           overdue_books, today_transactions, activities[], insights[] }
export async function getDashboard() {
  const { data } = await apiClient.get('/dashboard/')
  return data
}
