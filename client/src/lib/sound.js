let audioCtx = null
let unlocked = false

function getContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

/** Must be called from a user gesture (e.g. first click) to satisfy autoplay policies. */
export function unlockAudio() {
  if (unlocked) return
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()
  unlocked = true
}

/** Plays a short two-tone chime for incoming agent messages. No audio asset required. */
export function playMessageChime() {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()

  const now = ctx.currentTime
  const notes = [
    { freq: 740, start: 0, dur: 0.12 },
    { freq: 988, start: 0.1, dur: 0.16 },
  ]

  notes.forEach(({ freq, start, dur }) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, now + start)
    gain.gain.linearRampToValueAtTime(0.16, now + start + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + start)
    osc.stop(now + start + dur + 0.02)
  })
}
