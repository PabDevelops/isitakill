import Link from 'next/link'
import Nav from '@/components/Nav'

const EXAMPLE_CARDS = [
  {
    name: 'MarkdownMail',
    description: '3 paying customers, $21 MRR after 6 months of building.',
    builderVerdict: 'kill' as const,
    communityVerdict: 'build' as const,
    buildPct: 73,
  },
  {
    name: 'DevBoard',
    description: 'Got 400 stars on GitHub but zero conversions to paid.',
    builderVerdict: 'build' as const,
    communityVerdict: 'kill' as const,
    buildPct: 28,
  },
  {
    name: 'NapkinAI',
    description: '12 signups, 0 DAU. I love it but nobody else does.',
    builderVerdict: 'kill' as const,
    communityVerdict: 'build' as const,
    buildPct: 61,
  },
]

export default async function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-block bg-yellow-400 text-black text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full mb-6">
          Brutal Honesty Required
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-6">
          Is it a
          <br />
          <span className="text-yellow-400">Kill</span>?
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Submit your side project with your honest verdict. The internet votes{' '}
          <span className="text-green-400 font-bold">BUILD</span> or{' '}
          <span className="text-red-400 font-bold">KILL</span>. Strangers might
          believe in it more than you do — or confirm your worst fears.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/new"
            className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            Submit Your Project →
          </Link>
          <Link
            href="#how"
            className="px-8 py-4 border border-zinc-700 hover:border-zinc-400 text-white font-bold text-lg rounded-xl transition-colors"
          >
            How it works
          </Link>
        </div>
      </section>

      {/* Example flip cards */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-zinc-500 uppercase tracking-widest text-xs font-bold mb-6 text-center">
          Recent flips — when the community disagrees with the builder
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {EXAMPLE_CARDS.map((card) => (
            <ExampleCard key={card.name} {...card} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="border-t border-zinc-800 max-w-5xl mx-auto px-4 py-20"
      >
        <h2 className="text-3xl font-black text-center mb-12">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          {[
            {
              step: '01',
              title: 'You submit',
              body: "Describe your project, its traction, and give your own honest verdict — build or kill. Don't sugarcoat it.",
            },
            {
              step: '02',
              title: 'Strangers vote',
              body: 'Anyone with the link votes BUILD or KILL — no login required. 7-day voting window.',
            },
            {
              step: '03',
              title: 'The flip',
              body: "If the community disagrees with you, you get the FLIP badge — the most shareable outcome. Sometimes you need an outsider's perspective.",
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="space-y-3">
              <div className="text-5xl font-black text-zinc-800">{step}</div>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="text-zinc-400 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-yellow-400 py-16 text-center text-black">
        <h2 className="text-4xl font-black mb-4">
          Is your project worth saving?
        </h2>
        <p className="text-lg font-medium mb-8 opacity-80">
          Let strangers decide. Takes 2 minutes.
        </p>
        <Link
          href="/new"
          className="inline-block px-10 py-4 bg-black text-white font-black text-lg rounded-xl hover:bg-zinc-800 transition-colors"
        >
          Submit Your Project →
        </Link>
      </section>

      <footer className="text-center py-8 text-zinc-600 text-sm">
        IsitAKill? — because you need honest feedback, not validation
      </footer>
    </div>
  )
}

function ExampleCard({
  name,
  description,
  builderVerdict,
  communityVerdict,
  buildPct,
}: (typeof EXAMPLE_CARDS)[0]) {
  const isFlipped = builderVerdict !== communityVerdict
  const killPct = 100 - buildPct
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
      {isFlipped && (
        <span className="inline-block bg-yellow-400 text-black text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded">
          🔄 FLIPPED
        </span>
      )}
      <h3 className="font-black text-lg">{name}</h3>
      <p className="text-zinc-400 text-sm">{description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-500">
          Builder:{' '}
          <span
            className={
              builderVerdict === 'build' ? 'text-green-400' : 'text-red-400'
            }
          >
            {builderVerdict.toUpperCase()}
          </span>
        </span>
        <span className="text-zinc-500">
          Community:{' '}
          <span
            className={
              communityVerdict === 'build' ? 'text-green-400' : 'text-red-400'
            }
          >
            {communityVerdict.toUpperCase()}
          </span>
        </span>
      </div>
      <div className="flex rounded-full overflow-hidden h-2">
        <div
          className="bg-green-500 transition-all"
          style={{ width: `${buildPct}%` }}
        />
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${killPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{buildPct}% BUILD</span>
        <span>{killPct}% KILL</span>
      </div>
    </div>
  )
}
