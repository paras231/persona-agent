import { Send } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'

export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-(--color-border) bg-(--color-surface) p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:p-4">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        className="max-h-40 flex-1 resize-none rounded-2xl border border-(--color-border) bg-(--color-surface-2) px-4 py-2.5 text-(--color-text) placeholder:text-(--color-text-dim) focus:border-(--color-accent) focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--color-accent) text-(--color-bg) transition enabled:hover:brightness-110 enabled:active:scale-95 disabled:opacity-40"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  )
}
