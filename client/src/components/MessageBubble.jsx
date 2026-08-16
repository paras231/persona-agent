import { Sparkles } from 'lucide-react'
import Avatar from './Avatar'
import { clockTime } from '../lib/time'

export default function MessageBubble({ message, personality }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="animate-bubble-in flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-(--color-accent) px-4 py-2.5 text-(--color-bg) sm:max-w-[70%]">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <p className="mt-1 text-right text-xs text-(--color-bg)/70">{clockTime(message.created_at)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-bubble-in flex items-end gap-2.5">
      <Avatar name={personality?.name} gradient={personality?.avatar} size="sm" />
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-(--color-surface-2) px-4 py-2.5 sm:max-w-[70%]">
        {message.is_proactive && (
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-(--color-accent-2)">
            <Sparkles className="h-3 w-3" />
            reached out
          </div>
        )}
        <p className="whitespace-pre-wrap break-words text-(--color-text)">{message.content}</p>
        <p className="mt-1 text-xs text-(--color-text-dim)">{clockTime(message.created_at)}</p>
      </div>
    </div>
  )
}
