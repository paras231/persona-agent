const STORAGE_KEY = 'persona-chat:store:v1'
const USER_ID_KEY = 'persona-chat:user-id'

const AVATAR_PALETTE = [
  'from-violet-500 to-fuchsia-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-violet-500',
]

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function avatarGradientFor(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

export function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = uuid()
    localStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

const emptyStore = () => ({ personalities: [], conversations: [] })

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw)
    return {
      personalities: Array.isArray(parsed.personalities) ? parsed.personalities : [],
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
    }
  } catch {
    return emptyStore()
  }
}

export function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function newPersonality({ name, role, systemPrompt, traits }) {
  return {
    id: uuid(),
    name,
    role,
    system_prompt: systemPrompt,
    traits: traits || {},
    avatar: avatarGradientFor(name + role),
    created_at: new Date().toISOString(),
  }
}

export function newConversation({ personalityId, userId, remoteId }) {
  const now = new Date().toISOString()
  return {
    id: remoteId,
    personality_id: personalityId,
    user_id: userId,
    created_at: now,
    last_activity_at: now,
    messages: [],
  }
}

export function newMessage({ role, content, isProactive = false, id }) {
  return {
    id: id || uuid(),
    role,
    content,
    is_proactive: isProactive,
    created_at: new Date().toISOString(),
  }
}

export { uuid }
