import { AlertTriangle, Menu } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Avatar from './Avatar'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'

export default function ChatWindow({ conversation, personality, isSending, error, onSend, onOpenMenu }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [conversation.messages.length, isSending])

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-(--color-border) bg-(--color-surface) px-4 py-3">
        <button
          aria-label="Open menu"
          onClick={onOpenMenu}
          className="rounded-full p-1.5 text-(--color-text-dim) hover:bg-(--color-surface-2) md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Avatar name={personality?.name} gradient={personality?.avatar} />
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl leading-tight font-semibold text-(--color-text)">
            {personality?.name}
          </h2>
          <p className="truncate text-xs text-(--color-text-dim)">{personality?.role}</p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-6">
        {conversation.messages.length === 0 && (
          <div className="mx-auto max-w-sm pt-10 text-center">
            <Avatar name={personality?.name} gradient={personality?.avatar} size="lg" />
            <p className="mt-4 font-display text-2xl text-(--color-text)">Say hello to {personality?.name}</p>
            <p className="mt-1 text-sm text-(--color-text-dim)">{personality?.system_prompt}</p>
          </div>
        )}

        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} personality={personality} />
        ))}

        {isSending && <TypingIndicator name={personality?.name} gradient={personality?.avatar} />}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl border border-(--color-danger)/40 bg-(--color-danger)/10 px-3 py-2 text-sm text-(--color-danger) sm:mx-6">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <MessageInput onSend={(text) => onSend(conversation.id, text)} disabled={isSending} />
    </div>
  )
}
