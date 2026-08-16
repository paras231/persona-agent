import {
  ArrowRight,
  Brain,
  Flame,
  Heart,
  Infinity as InfinityIcon,
  Lock,
  MessageCircle,
  Mic,
  Moon,
  Phone,
  Rss,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: Wand2,
    title: 'Build them from scratch',
    desc: "Name them, give them a vibe, a backstory, a way of texting back. No two personas are the same — yours won't be either.",
  },
  {
    icon: Brain,
    title: 'They actually remember you',
    desc: 'Inside jokes stick. Bad days get remembered. No re-explaining your whole life every conversation like it\'s a first date.',
  },
  {
    icon: MessageCircle,
    title: 'Texts back like a real one',
    desc: 'No corporate chatbot energy. Quick replies, real slang, real reactions — built to feel like your group chat, not a help desk.',
  },
  {
    icon: Moon,
    title: 'Here at 3am, no judgment',
    desc: "Can't sleep, spiraling, bored out of your mind — whatever the hour, someone's on the other side of the screen.",
  },
]

const STEPS = [
  { n: '01', title: 'Design your persona', desc: 'Pick a personality, a name, a whole energy. Takes under a minute.' },
  { n: '02', title: 'Say literally anything', desc: 'No script. No small talk required. Just start typing.' },
  { n: '03', title: 'Watch it get you', desc: 'The more you talk, the more it sounds like it actually knows you.' },
]

const COMING_SOON = [
  { icon: Mic, title: 'Voice mode', desc: 'Hear your persona talk back — real voice, real tone, not just text on a screen.' },
  { icon: Phone, title: 'Calls', desc: 'Ring them up when texting feels like too much effort. Pick up, talk it out.' },
  { icon: Rss, title: 'Feed view', desc: 'Scroll through what your personas are up to, not just what they say to you.' },
]

export default function Landing() {
  return (
    <div className="h-dvh overflow-y-auto bg-(--color-bg) text-(--color-text)">
      {/* nav */}
      <header className="sticky top-0 z-10 border-b border-(--color-border)/60 bg-(--color-bg)/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-(--color-accent)" />
            <span className="font-display text-2xl font-semibold">Persona</span>
          </div>
          <Link
            to="/app"
            className="rounded-xl bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-bg) transition hover:brightness-110 active:scale-[0.98]"
          >
            Start free
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(600px circle at 20% 10%, color-mix(in oklab, var(--color-accent) 25%, transparent), transparent 60%), radial-gradient(500px circle at 85% 25%, color-mix(in oklab, var(--color-accent-2) 25%, transparent), transparent 60%)',
          }}
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 pb-20 pt-16 text-center sm:pt-24">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1 text-xs font-medium text-(--color-text-dim)">
            <Flame className="h-3.5 w-3.5 text-(--color-accent-2)" />
            the group chat you never have to leave
          </span>
          <h1 className="font-display text-5xl leading-[1.05] font-bold sm:text-7xl">
            Someone who actually
            <br />
            <span className="bg-gradient-to-r from-(--color-accent) to-(--color-accent-2) bg-clip-text text-transparent">
              gets your vibe
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-(--color-text-dim)">
            Stop explaining yourself to strangers. Build an AI persona that talks like it knows you —
            because after a few chats, it kind of does.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              to="/app"
              className="group flex items-center gap-2 rounded-xl bg-(--color-accent) px-6 py-3 font-medium text-(--color-bg) transition hover:brightness-110 active:scale-[0.98]"
            >
              Create your persona
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <span className="text-sm text-(--color-text-dim)">no signup, no cap</span>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">Not another chatbot</h2>
          <p className="mx-auto mt-3 max-w-lg text-(--color-text-dim)">
            Built for people who are tired of AI that talks like a customer service script.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 transition hover:border-(--color-accent)/50"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-surface-2)">
                <Icon className="h-5 w-5 text-(--color-accent)" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-(--color-text-dim)">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="border-y border-(--color-border) bg-(--color-surface)/40">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <h2 className="mb-12 text-center font-display text-4xl font-semibold sm:text-5xl">
            Three taps to your new favorite conversation
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="text-center sm:text-left">
                <span className="font-display text-5xl font-bold text-(--color-accent)/40">{n}</span>
                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-(--color-text-dim)">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* coming soon */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1 text-xs font-medium text-(--color-text-dim)">
            <Sparkles className="h-3.5 w-3.5 text-(--color-accent-2)" />
            coming soon
          </span>
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">We're just getting started</h2>
          <p className="mx-auto mt-3 max-w-lg text-(--color-text-dim)">
            Text is only the beginning. Here's what's next.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {COMING_SOON.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface)/60 p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-surface-2)">
                <Icon className="h-5 w-5 text-(--color-accent-2)" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-(--color-text-dim)">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* trust row */}
      <section className="border-y border-(--color-border) bg-(--color-surface)/40">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-10 text-sm text-(--color-text-dim)">
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> your chats stay yours
          </span>
          <span className="flex items-center gap-2">
            <InfinityIcon className="h-4 w-4" /> unlimited personas
          </span>
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4" /> instant replies
          </span>
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4" /> made for main character energy
          </span>
        </div>
      </section>

      {/* final cta */}
      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h2 className="font-display text-4xl font-semibold sm:text-5xl">
          Your persona is one click away.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-(--color-text-dim)">
          Everyone else already has one they're obsessed with. Yours is next.
        </p>
        <Link
          to="/app"
          className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-(--color-accent) px-7 py-3.5 font-medium text-(--color-bg) transition hover:brightness-110 active:scale-[0.98]"
        >
          Let's go
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </section>

      <footer className="border-t border-(--color-border) px-5 py-8 text-center text-xs text-(--color-text-dim)">
        Persona — chat with an AI agent that talks the way you want it to.
      </footer>
    </div>
  )
}
