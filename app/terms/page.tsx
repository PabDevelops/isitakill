import Nav from '@/components/Nav'
import DotGrid from '@/components/DotGrid'

export const metadata = { title: 'Terms of Service — IsitAKill?' }

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <DotGrid variant="page" />
      <Nav />
      <div className="relative max-w-2xl mx-auto px-4 py-16 text-zinc-400 text-sm leading-relaxed space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-100 mb-2">Terms of Service</h1>
          <p className="text-zinc-600">Last updated: July 3, 2026</p>
        </div>

        <p>
          By using isitakill.com (&quot;the Service&quot;) you agree to these
          terms. If you don&apos;t agree, please don&apos;t use the Service.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">What the Service is</h2>
          <p>
            IsitAKill? lets you submit a project along with your own honest
            BUILD/KILL verdict, and lets the community vote on it. It&apos;s
            entertainment and feedback, not professional business, financial,
            or legal advice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Accounts</h2>
          <p>
            You&apos;re responsible for your account and for keeping your
            password secure. You must provide a valid email and be at least
            16 years old to create one.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Your content</h2>
          <p>
            You keep ownership of what you submit. By submitting a project
            you give us a license to display it publicly on the Service.
            You&apos;re responsible for making sure you have the right to
            share anything you upload (images, descriptions, links) and that
            it doesn&apos;t violate anyone else&apos;s rights or the law. We
            can remove content or accounts that break these terms without
            notice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Voting and boosts</h2>
          <p>
            Votes are meant to reflect genuine, one-person-one-vote opinions.
            Manipulating votes (bots, multiple accounts, incentivized
            voting) is prohibited and we may remove affected votes or
            projects. Purchasing a &quot;boost&quot; increases a project&apos;s
            visibility and listing duration — it never adds votes, changes
            existing votes, or guarantees any particular outcome.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Payments</h2>
          <p>
            Boost purchases are processed by Stripe and are one-time, not
            recurring. See our{' '}
            <a href="/refunds" className="text-yellow-400 hover:text-yellow-300">
              Refund Policy
            </a>{' '}
            for details on refunds.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Prohibited use</h2>
          <p>
            No spam, illegal content, harassment, malware, scraping at scale,
            or attempts to disrupt or reverse-engineer the Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Disclaimer & liability</h2>
          <p>
            The Service is provided &quot;as is&quot;, without warranties of
            any kind. To the maximum extent permitted by law, we&apos;re not
            liable for indirect, incidental, or consequential damages arising
            from your use of the Service, and our total liability for any
            claim is limited to the amount you paid us in the past 12 months.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Termination</h2>
          <p>
            You can stop using the Service and delete your account at any
            time. We may suspend or terminate accounts that violate these
            terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-100">Changes</h2>
          <p>
            We may update these terms occasionally. Continued use after a
            change means you accept the updated terms.
          </p>
        </section>

        <p>
          Questions? Email{' '}
          <a href="mailto:hi@pablodevelops.com" className="text-yellow-400 hover:text-yellow-300">
            hi@pablodevelops.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
