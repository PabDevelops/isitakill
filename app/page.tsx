import Link from 'next/link'
import Nav from '@/components/Nav'
import GlowOrb from '@/components/GlowOrb'
import DotGrid from '@/components/DotGrid'

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
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <Nav />

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-4 pt-28 pb-24 text-center">
        <div className="absolute left-1/2 top-8 -translate-x-1/2 pointer-events-none">
          <GlowOrb size={420} />
        </div>
        <DotGrid className="opacity-80" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 border border-zinc-800 text-zinc-400 text-xs font-medium tracking-wide px-3 py-1 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            Brutal honesty required
          </div>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] mb-6 text-zinc-100">
            Is it a <span className="text-yellow-400">kill</span>?
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed">
            You built it. You&apos;re not sure if it&apos;s worth saving. Let
            strangers decide — and find out if you were wrong.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/new"
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-full transition-all hover:scale-[1.03] active:scale-95"
            >
              Submit your project →
            </Link>
            <Link
              href="#how"
              className="px-6 py-3 border border-zinc-800 hover:border-zinc-600 text-zinc-300 font-medium rounded-full transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Example flip cards */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-zinc-600 uppercase tracking-widest text-xs font-medium mb-6 text-center">
          Builders who got flipped
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
        className="border-t border-white/[0.06] max-w-5xl mx-auto px-4 py-24"
      >
        <h2 className="text-2xl font-semibold text-center mb-14 text-zinc-100">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-10 text-center">
          {[
            {
              step: '01',
              title: 'You submit',
              body: 'Submit your project — and your own honest verdict: BUILD or KILL.',
            },
            {
              step: '02',
              title: 'Strangers vote',
              body: 'The community votes, blind to what you think.',
            },
            {
              step: '03',
              title: 'The flip',
              body: "Sometimes they flip it. That's the whole point.",
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="space-y-3">
              <div className="text-4xl font-semibold text-zinc-800">{step}</div>
              <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/[0.06] py-24 text-center overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <GlowOrb size={500} />
        </div>
        <div className="relative">
          <h2 className="text-3xl font-semibold mb-3 text-zinc-100">
            Is your project worth saving?
          </h2>
          <p className="text-zinc-500 mb-8">
            Let strangers decide. Takes 2 minutes.
          </p>
          <Link
            href="/new"
            className="inline-block px-8 py-3 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-300 transition-colors"
          >
            Submit your project →
          </Link>
        </div>
      </section>

      <div className="wave-line" />
      <footer className="text-center py-8 text-zinc-600 text-sm">
        Built for indie hackers who build too much and kill too late — or too
        early.
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
    <div className="bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.14] rounded-2xl p-5 space-y-4 transition-colors">
      {isFlipped && (
        <span className="inline-block bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 text-xs font-medium uppercase tracking-widest px-2 py-0.5 rounded-full">
          🔄 Flipped
        </span>
      )}
      <h3 className="font-semibold text-lg text-zinc-100">{name}</h3>
      <p className="text-zinc-500 text-sm">{description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600">
          Builder:{' '}
          <span
            className={
              builderVerdict === 'build' ? 'text-green-400' : 'text-red-400'
            }
          >
            {builderVerdict.toUpperCase()}
          </span>
        </span>
        <span className="text-zinc-600">
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
      <div className="flex rounded-full overflow-hidden h-1.5 bg-white/[0.05]">
        <div
          className="bg-green-500 transition-all"
          style={{ width: `${buildPct}%` }}
        />
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${killPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-600">
        <span>{buildPct}% BUILD</span>
        <span>{killPct}% KILL</span>
      </div>
    </div>
  )
}
