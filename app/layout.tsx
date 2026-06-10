import type { Metadata } from 'next'
import { DotGothic16 } from 'next/font/google'
import './globals.css'

const font = DotGothic16({ weight: '400', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'WC Stonks',
  description: 'World Cup betting pool — track your portfolio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.className}>
      <body>{children}</body>
    </html>
  )
}
