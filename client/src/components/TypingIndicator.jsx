import Avatar from './Avatar'

export default function TypingIndicator({ name, gradient }) {
  return (
    <div className="flex items-end gap-2.5">
      <Avatar name={name} gradient={gradient} size="sm" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-(--color-surface-2) px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-(--color-text-dim)"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
