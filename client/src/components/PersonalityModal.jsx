import { AlertTriangle, Loader2, Plus, X } from 'lucide-react'
import { useState } from 'react'
import Avatar from './Avatar'

const ROLE_PRESETS = [
  { role: 'Teacher', prompt: 'You are a patient, encouraging teacher who explains concepts clearly with examples and checks for understanding.' },
  { role: 'Interviewer', prompt: 'You are a professional interviewer conducting a structured interview, asking focused follow-up questions.' },
  { role: 'Roleplay character', prompt: 'You are a character in an immersive roleplay, staying fully in-world and reacting in character.' },
  { role: 'Life coach', prompt: 'You are a supportive, direct life coach who helps the user clarify goals and take action.' },
  { role: 'Debate partner', prompt: 'You are a sharp debate partner who challenges the user\'s reasoning respectfully and argues the other side.' },
]

const emptyTrait = () => ({ key: '', value: '' })

export default function PersonalityModal({ isOpen, onClose, personalities, onCreatePersonality, onStartConversation }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [traits, setTraits] = useState([emptyTrait()])
  const [submitting, setSubmitting] = useState(false)
  const [startingId, setStartingId] = useState(null)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  function applyPreset(preset) {
    setRole(preset.role)
    setSystemPrompt(preset.prompt)
  }

  function updateTrait(index, field, value) {
    setTraits((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)))
  }

  function removeTrait(index) {
    setTraits((prev) => prev.filter((_, i) => i !== index))
  }

  function reset() {
    setName('')
    setRole('')
    setSystemPrompt('')
    setTraits([emptyTrait()])
    setError(null)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim() || !role.trim() || !systemPrompt.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const traitsObj = Object.fromEntries(
        traits.filter((t) => t.key.trim()).map((t) => [t.key.trim(), t.value.trim()]),
      )
      const personality = await onCreatePersonality({ name: name.trim(), role: role.trim(), systemPrompt: systemPrompt.trim(), traits: traitsObj })
      await onStartConversation(personality.id)
      reset()
      onClose()
    } catch (err) {
      setError(err.message || 'Could not create personality. Is the server running?')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStartExisting(personalityId) {
    setStartingId(personalityId)
    setError(null)
    try {
      await onStartConversation(personalityId)
      onClose()
    } catch (err) {
      setError(err.message || 'Could not start conversation. Is the server running?')
    } finally {
      setStartingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-(--color-surface) sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-(--color-border) px-5 py-4">
          <h2 className="font-display text-2xl font-semibold text-(--color-text)">New character chat</h2>
          <button
            aria-label="Close"
            onClick={() => {
              reset()
              onClose()
            }}
            className="rounded-full p-1.5 text-(--color-text-dim) hover:bg-(--color-surface-2)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-(--color-danger)/40 bg-(--color-danger)/10 px-3 py-2 text-sm text-(--color-danger)">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {personalities.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-(--color-text-dim)">Chat with an existing personality</p>
              <ul className="space-y-1.5">
                {personalities.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => handleStartExisting(p.id)}
                      disabled={startingId === p.id}
                      className="flex w-full items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 text-left transition hover:bg-(--color-surface-2) disabled:opacity-60"
                    >
                      <Avatar name={p.name} gradient={p.avatar} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-(--color-text)">{p.name}</p>
                        <p className="truncate text-xs text-(--color-text-dim)">{p.role}</p>
                      </div>
                      {startingId === p.id && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-(--color-accent)" />}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="my-5 flex items-center gap-3 text-xs text-(--color-text-dim)">
                <div className="h-px flex-1 bg-(--color-border)" />
                or create a new one
                <div className="h-px flex-1 bg-(--color-border)" />
              </div>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {ROLE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.role}
                  onClick={() => applyPreset(preset)}
                  className="rounded-full border border-(--color-border) px-3 py-1 text-xs text-(--color-text-dim) transition hover:border-(--color-accent) hover:text-(--color-text)"
                >
                  {preset.role}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-(--color-text-dim)">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Professor Wren"
                required
                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-2) px-3.5 py-2.5 text-(--color-text) placeholder:text-(--color-text-dim) focus:border-(--color-accent) focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-(--color-text-dim)">Role</label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Teacher, Interviewer, Roleplay character"
                required
                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-2) px-3.5 py-2.5 text-(--color-text) placeholder:text-(--color-text-dim) focus:border-(--color-accent) focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-(--color-text-dim)">Personality &amp; instructions</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Describe how they should think, speak, and behave…"
                required
                rows={4}
                className="w-full resize-none rounded-xl border border-(--color-border) bg-(--color-surface-2) px-3.5 py-2.5 text-(--color-text) placeholder:text-(--color-text-dim) focus:border-(--color-accent) focus:outline-none"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-(--color-text-dim)">Traits (optional)</label>
                <button
                  type="button"
                  onClick={() => setTraits((prev) => [...prev, emptyTrait()])}
                  className="flex items-center gap-1 text-xs text-(--color-accent) hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> add trait
                </button>
              </div>
              <div className="space-y-2">
                {traits.map((trait, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={trait.key}
                      onChange={(e) => updateTrait(i, 'key', e.target.value)}
                      placeholder="tone"
                      className="w-1/3 rounded-lg border border-(--color-border) bg-(--color-surface-2) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-dim) focus:border-(--color-accent) focus:outline-none"
                    />
                    <input
                      value={trait.value}
                      onChange={(e) => updateTrait(i, 'value', e.target.value)}
                      placeholder="warm and witty"
                      className="flex-1 rounded-lg border border-(--color-border) bg-(--color-surface-2) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-dim) focus:border-(--color-accent) focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label="Remove trait"
                      onClick={() => removeTrait(i)}
                      className="rounded-lg px-2 text-(--color-text-dim) hover:bg-(--color-surface-2) hover:text-(--color-danger)"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-accent) px-4 py-3 font-medium text-(--color-bg) transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create &amp; start chatting
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
