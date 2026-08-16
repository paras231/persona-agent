function initialsFor(name = '') {
  return name.trim().slice(0, 1).toUpperCase() || '?'
}

export default function Avatar({ name, gradient, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-14 w-14 text-xl',
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient || 'from-violet-500 to-fuchsia-500'} font-display font-semibold text-white shadow-inner shadow-black/20 ${sizes[size]}`}
    >
      {initialsFor(name)}
    </div>
  )
}
