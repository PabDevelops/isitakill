import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IsitAKill? — Community Verdict for Your Side Project',
  description:
    'Submit your side project. The community votes BUILD or KILL. Find out if strangers believe in it more than you do.',
  openGraph: {
    title: 'IsitAKill?',
    description: 'Will strangers save your side project?',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
