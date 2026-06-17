import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
