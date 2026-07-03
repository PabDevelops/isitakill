import Nav from '@/components/Nav'
import DotGrid from '@/components/DotGrid'

export const metadata = { title: 'Privacy Policy — IsitAKill?' }

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <DotGrid variant="page" />
      <Nav />
      <div className="relative max-w-2xl mx-auto px-4 py-16 text-zinc-400 text-sm leading-relaxed space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-100 mb-2">Privacy Policy</h1>
          <p className="text-zinc-600">Last updated: July 3, 2026</p>
        </div>

        <p>
          IsitAKill? (&quot;we&quot;, &quot;us&quot;) operates isitakill.com. This
          policy explains what personal data we collect, why, and what rights
          you have over it.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">What we collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Your email address, when you create an account.</li>
            <li>
              Project content you submit — name, description, links, images,
              and any traction numbers you choose to share.
            </li>
            <li>
              A randomly generated, non-identifying browser fingerprint stored
              in your browser, used only to prevent duplicate votes on the
              same project.
            </li>
            <li>
              Payment information when you purchase a boost — this is
              collected and processed directly by Stripe; we never see or
              store your card details.
            </li>
            <li>
              Aggregated, anonymous usage analytics (pages visited, general
              location by country) via Vercel Analytics, which does not use
              cookies or track you individually.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Why we collect it</h2>
          <p>
            To create and secure your account, to display the projects and
            votes that make up the service, to process boost payments, to
            prevent abuse of the voting system, and to understand and improve
            the product.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Who we share it with</h2>
          <p>
            We use three subprocessors to run the service: Supabase (database
            and authentication), Stripe (payment processing), and Vercel
            (hosting and analytics). Each only receives the data it needs to
            perform its function. We do not sell your data to anyone.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">How long we keep it</h2>
          <p>
            Account and project data is kept as long as your account is
            active. If you delete your account or ask us to, we will delete
            your personal data within 30 days, except where we&apos;re
            required to keep transaction records for legal or tax purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Your rights</h2>
          <p>
            Wherever you&apos;re located, you can ask us to access, correct,
            export, or delete your personal data at any time by emailing{' '}
            <a href="mailto:privacy@isitakill.com" className="text-yellow-400 hover:text-yellow-300">
              privacy@isitakill.com
            </a>
            . If you&apos;re in the EU/EEA or UK, this is your right under
            GDPR; if you&apos;re a California resident, this is your right
            under the CCPA. We&apos;ll respond within 30 days.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Children</h2>
          <p>This service is not directed at anyone under 16 years old.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Changes</h2>
          <p>
            If we make material changes to this policy, we&apos;ll update the
            date at the top of this page.
          </p>
        </section>

        <p>
          Questions? Email{' '}
          <a href="mailto:privacy@isitakill.com" className="text-yellow-400 hover:text-yellow-300">
            privacy@isitakill.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
