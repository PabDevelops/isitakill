import Nav from '@/components/Nav'
import DotGrid from '@/components/DotGrid'

export const metadata = { title: 'Refund Policy — IsitAKill?' }

export default function RefundsPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <DotGrid variant="page" />
      <Nav />
      <div className="relative max-w-2xl mx-auto px-4 py-16 text-zinc-400 text-sm leading-relaxed space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-100 mb-2">Refund Policy</h1>
          <p className="text-zinc-600">Last updated: July 3, 2026</p>
        </div>

        <p>
          Boosts are a one-time payment for a digital service (extra
          visibility and listing time) that starts working immediately after
          purchase.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Boost purchases are final</h2>
          <p>
            Because the boost is applied to your project instantly, all boost
            purchases are non-refundable once the payment succeeds and the
            boost is active — the same way you wouldn&apos;t expect a refund
            partway through a service you&apos;ve already received.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Exceptions</h2>
          <p>We will issue a full refund if:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>You were charged but the boost was never applied to your project due to a technical error on our end.</li>
            <li>You were accidentally charged more than once for the same boost.</li>
            <li>You were charged after your project was already removed for violating our Terms of Service before the charge went through.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">How to request one</h2>
          <p>
            Email{' '}
            <a href="mailto:hi@pablodevelops.com" className="text-yellow-400 hover:text-yellow-300">
              hi@pablodevelops.com
            </a>{' '}
            with your account email and the approximate date of the charge.
            We aim to respond within 3 business days, and approved refunds
            are returned to your original payment method within 5–10
            business days via Stripe.
          </p>
        </section>

        <p>
          This policy is part of our{' '}
          <a href="/terms" className="text-yellow-400 hover:text-yellow-300">
            Terms of Service
          </a>
          .
        </p>
      </div>
    </div>
  )
}
