const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail || detail
    } catch {
      // ignore non-json error bodies
    }
    throw new Error(detail || `Request to ${path} failed with ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  createPersonality: (payload) => request('/personalities', { method: 'POST', body: JSON.stringify(payload) }),

  createConversation: (payload) => request('/conversations', { method: 'POST', body: JSON.stringify(payload) }),

  listMessages: (conversationId) => request(`/conversations/${conversationId}/messages`),

  sendMessage: (conversationId, content) =>
    request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  triggerProactive: (conversationId) =>
    request(`/conversations/${conversationId}/proactive`, { method: 'POST' }),
}

export { BASE_URL }
