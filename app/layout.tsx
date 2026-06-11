import type { Metadata } from 'next'
import { DotGothic16 } from 'next/font/google'
import './globals.css'

const font = DotGothic16({ weight: '400', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Quiniela',
  description: 'Quiniela Mundial 2026',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Quiniela',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/banner-square.png',
  },
  openGraph: {
    title: 'Quiniela',
    description: 'Quiniela Mundial 2026',
    images: ['/banner-wide.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.className}>
      <body>{children}</body>
    </html>
  )
}
