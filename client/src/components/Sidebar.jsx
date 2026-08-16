import { MessageCirclePlus, Sparkles, Trash2, X } from 'lucide-react'
import Avatar from './Avatar'
import { relativeTime } from '../lib/time'

export default function Sidebar({
  isOpen,
  onClose,
  conversations,
  personalityById,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}) {
  const sorted = [...conversations].sort(
    (a, b) => new Date(b.last_activity_at) - new Date(a.last_activity_at),
  )

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[85vw] max-w-80 flex-col border-r border-(--color-border) bg-(--color-surface) transition-transform duration-200 md:static md:z-auto md:w-80 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-(--color-border) px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-(--color-accent)" />
            <h1 className="font-display text-2xl font-semibold tracking-wide text-(--color-text)">Persona</h1>
          </div>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-full p-1.5 text-(--color-text-dim) hover:bg-(--color-surface-2) md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-accent) px-4 py-2.5 font-medium text-(--color-bg) transition hover:brightness-110 active:scale-[0.98]"
          >
            <MessageCirclePlus className="h-5 w-5" />
            New character chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-3">
          {sorted.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-(--color-text-dim)">
              No conversations yet. Create a personality to start chatting.
            </p>
          )}

          <ul className="space-y-1">
            {sorted.map((conversation) => {
              const personality = personalityById(conversation.personality_id)
              const lastMessage = conversation.messages[conversation.messages.length - 1]
              const isActive = conversation.id === activeConversationId

              return (
                <li key={conversation.id} className="group relative">
                  <button
                    onClick={() => onSelectConversation(conversation.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      isActive ? 'bg-(--color-surface-3)' : 'hover:bg-(--color-surface-2)'
                    }`}
                  >
                    <Avatar name={personality?.name || '?'} gradient={personality?.avatar} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-(--color-text)">{personality?.name || 'Unknown'}</p>
                        <span className="shrink-0 text-xs text-(--color-text-dim)">
                          {relativeTime(conversation.last_activity_at)}
                        </span>
                      </div>
                      <p className="truncate text-sm text-(--color-text-dim)">
                        {lastMessage ? lastMessage.content : personality?.role}
                      </p>
                    </div>
                  </button>
                  <button
                    aria-label="Delete conversation"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conversation.id)
                    }}
                    className="absolute top-2.5 right-2.5 hidden rounded-lg p-1.5 text-(--color-text-dim) hover:bg-(--color-surface) hover:text-(--color-danger) group-hover:block"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
