import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from "@/components/ui/sonner"
import './globals.css'

export const metadata: Metadata = {
  title: 'FBA Hangout - Seller\'s Leaderboard',
  description: 'Track and compete with fellow Amazon FBA sellers. Submit your profit reports, get verified, and climb the leaderboard to showcase your success.',
  keywords: 'Amazon FBA, seller leaderboard, profit tracking, FBA community, seller competition',
  authors: [{ name: 'FBA Hangout' }],
  openGraph: {
    title: 'FBA Hangout - Seller\'s Leaderboard',
    description: 'Track and compete with fellow Amazon FBA sellers. Submit your profit reports, get verified, and climb the leaderboard.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FBA Hangout - Seller\'s Leaderboard',
    description: 'Track and compete with fellow Amazon FBA sellers. Submit your profit reports, get verified, and climb the leaderboard.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
