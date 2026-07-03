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
    'Submit your side project and let a jury of fellow builders vote BUILD or KILL. Get honest feedback and find out if strangers believe in your product.',
  openGraph: {
    title: 'IsitAKill? — Community Verdict for Your Side Project',
    description:
      'Submit your side project and let a jury of fellow builders vote BUILD or KILL. Get honest feedback and find out if strangers believe in your product.',
    type: 'website',
    siteName: 'IsitAKill?',
    images: [
      {
        url: '/og-image.png',
        width: 1222,
        height: 526,
        alt: 'IsitAKill? — Community Verdict for Your Side Project',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IsitAKill? — Community Verdict for Your Side Project',
    description:
      'Submit your side project and let a jury of fellow builders vote BUILD or KILL. Get honest feedback and find out if strangers believe in your product.',
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
