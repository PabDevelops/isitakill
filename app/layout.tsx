import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IsitAKill? — Community Verdict for Your Side Project',
  description:
    'Submit your side project. The community votes BUILD or KILL. Find out if strangers believe in it more than you do.',
  openGraph: {
    title: 'IsitAKill? — Community Verdict for Your Side Project',
    description: 'Will strangers save your side project?',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IsitAKill? — Will strangers save your side project?',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IsitAKill? — Community Verdict for Your Side Project',
    description: 'Will strangers save your side project?',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.className} min-h-screen bg-[#0a0a0a] text-white antialiased selection:bg-yellow-400 selection:text-black`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
