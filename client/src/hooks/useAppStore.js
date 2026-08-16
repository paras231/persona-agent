import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import { getUserId, loadStore, newConversation, newMessage, newPersonality, saveStore } from '../lib/storage'
import { playMessageChime } from '../lib/sound'

const ACTIVE_CONVERSATION_KEY = 'persona-chat:active-conversation'
const POLL_INTERVAL_MS = 15000

export function useAppStore() {
  const userId = useMemo(() => getUserId(), [])
  const [store, setStore] = useState(() => loadStore())
  const [activeConversationId, setActiveConversationId] = useState(() =>
    localStorage.getItem(ACTIVE_CONVERSATION_KEY),
  )
  const [sendingIds, setSendingIds] = useState(() => new Set())
  const [errorsByConversation, setErrorsByConversation] = useState({})
  const storeRef = useRef(store)
  storeRef.current = store

  useEffect(() => {
    saveStore(store)
  }, [store])

  useEffect(() => {
    if (activeConversationId) localStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId)
  }, [activeConversationId])

  const personalityById = useCallback((id) => storeRef.current.personalities.find((p) => p.id === id), [])

  const createPersonality = useCallback(
    async ({ name, role, systemPrompt, traits }) => {
      const remote = await api.createPersonality({
        user_id: userId,
        name,
        role,
        system_prompt: systemPrompt,
        traits: traits || {},
      })
      const personality = { ...newPersonality({ name, role, systemPrompt, traits }), id: remote.id }
      setStore((s) => ({ ...s, personalities: [personality, ...s.personalities] }))
      return personality
    },
    [userId],
  )

  const startConversation = useCallback(
    async (personalityId) => {
      const remote = await api.createConversation({ user_id: userId, personality_id: personalityId })
      const conversation = newConversation({ personalityId, userId, remoteId: remote.id })
      setStore((s) => ({ ...s, conversations: [conversation, ...s.conversations] }))
      setActiveConversationId(conversation.id)
      return conversation
    },
    [userId],
  )

  const deleteConversation = useCallback(
    (conversationId) => {
      setStore((s) => ({ ...s, conversations: s.conversations.filter((c) => c.id !== conversationId) }))
      setActiveConversationId((current) => (current === conversationId ? null : current))
    },
    [],
  )

  const appendMessage = useCallback((conversationId, message) => {
    setStore((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], last_activity_at: message.created_at }
          : c,
      ),
    }))
  }, [])

  const sendMessage = useCallback(
    async (conversationId, content) => {
      const trimmed = content.trim()
      if (!trimmed) return

      setErrorsByConversation((e) => ({ ...e, [conversationId]: null }))
      appendMessage(conversationId, newMessage({ role: 'user', content: trimmed }))
      setSendingIds((prev) => new Set(prev).add(conversationId))

      try {
        const reply = await api.sendMessage(conversationId, trimmed)
        appendMessage(
          conversationId,
          newMessage({ id: reply.id, role: 'assistant', content: reply.content, isProactive: reply.is_proactive }),
        )
        playMessageChime()
      } catch (err) {
        setErrorsByConversation((e) => ({ ...e, [conversationId]: err.message || 'Something went wrong.' }))
      } finally {
        setSendingIds((prev) => {
          const next = new Set(prev)
          next.delete(conversationId)
          return next
        })
      }
    },
    [appendMessage],
  )

  // Poll for messages the agent sent on its own initiative (self-texting).
  useEffect(() => {
    const interval = setInterval(async () => {
      const conversations = storeRef.current.conversations
      for (const conversation of conversations) {
        try {
          const remoteMessages = await api.listMessages(conversation.id)
          const localCount = conversation.messages.length
          if (remoteMessages.length <= localCount) continue

          const newOnes = remoteMessages.slice(localCount)
          setStore((s) => ({
            ...s,
            conversations: s.conversations.map((c) =>
              c.id === conversation.id
                ? {
                    ...c,
                    messages: [
                      ...c.messages,
                      ...newOnes.map((m) =>
                        newMessage({ id: m.id, role: m.role, content: m.content, isProactive: m.is_proactive }),
                      ),
                    ],
                    last_activity_at: newOnes[newOnes.length - 1].created_at,
                  }
                : c,
            ),
          }))
          if (newOnes.some((m) => m.role === 'assistant')) playMessageChime()
        } catch {
          // Backend unreachable this tick; try again next interval.
        }
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return {
    userId,
    personalities: store.personalities,
    conversations: store.conversations,
    personalityById,
    activeConversationId,
    setActiveConversationId,
    createPersonality,
    startConversation,
    deleteConversation,
    sendMessage,
    isSending: (conversationId) => sendingIds.has(conversationId),
    errorFor: (conversationId) => errorsByConversation[conversationId],
  }
}
