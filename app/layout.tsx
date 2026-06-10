import type { Metadata } from 'next'
import { DotGothic16 } from 'next/font/google'
import './globals.css'

const font = DotGothic16({ weight: '400', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Quiniela',
  description: 'Quiniela Mundial 2026',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.className}>
      <body>{children}</body>
    </html>
  )
}
