import apiClient from './apiClient.js'

// POST /api/ai/chat — librarian only.
// history: [{ role: 'user' | 'assistant', content }]
// Returns { reply, tool_results? }
export async function sendChat(message, history = []) {
  const { data } = await apiClient.post('/api/ai/chat', { message, history })
  return data
}
