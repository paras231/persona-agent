import { Menu, Sparkles } from 'lucide-react'

export default function EmptyState({ onNewChat, onOpenMenu, hasConversations }) {
  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-(--color-border) bg-(--color-surface) px-4 py-3 md:hidden">
        <button
          aria-label="Open menu"
          onClick={onOpenMenu}
          className="rounded-full p-1.5 text-(--color-text-dim) hover:bg-(--color-surface-2)"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-display text-xl font-semibold text-(--color-text)">Persona</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-surface-2)">
          <Sparkles className="h-8 w-8 text-(--color-accent)" />
        </div>
        <h2 className="font-display text-3xl text-(--color-text)">
          {hasConversations ? 'Pick a conversation, or start a new one' : 'Design a personality to chat with'}
        </h2>
        <p className="max-w-sm text-(--color-text-dim)">
          Give your agent a role, a personality, and a way of speaking. It'll remember what matters and can
          even reach out to you first.
        </p>
        <button
          onClick={onNewChat}
          className="mt-2 rounded-xl bg-(--color-accent) px-5 py-2.5 font-medium text-(--color-bg) transition hover:brightness-110 active:scale-[0.98]"
        >
          Create a personality
        </button>
      </div>
    </div>
  )
}
