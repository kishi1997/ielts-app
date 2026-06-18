import type { Metadata } from 'next'
import { Newsreader, Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
})

export const metadata: Metadata = {
  title: 'IELTS Writing Practice',
  description: 'Daily IELTS writing exercises',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${newsreader.variable}`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="bg-bg text-fg font-sans antialiased">{children}</body>
    </html>
  )
}
