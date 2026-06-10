'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProfile } from './ProfileProvider'
import { getPlayers } from '@/lib/mock'

const PLAYER_COLORS: Record<string, string> = {
  'player-diego': 'bg-blue-500',
  'player-marco': 'bg-green-500',
  'player-sofia': 'bg-purple-500',
  'player-lucas': 'bg-orange-500',
  'player-ana':   'bg-pink-500',
  'player-raj':   'bg-teal-500',
}

const TABS = [
  {
    href: '/main',
    label: 'Home',
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    href: '/main/portfolios',
    label: 'Portfolios',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/>
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>
      </svg>
    ),
  },
  {
    href: '/main/side-bets',
    label: 'Bets',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
]

export default function Nav() {
  const pathname = usePathname()
  const { playerId, openPicker } = useProfile()
  const players = getPlayers()
  const currentPlayer = players.find(p => p.id === playerId)

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="bg-[#0a0a0a] border-b border-white/[0.08] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/main" className="text-white font-bold text-lg tracking-tight shrink-0">
            WC Stonks
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {TABS.map(tab => {
              const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    active ? 'bg-white/[0.1] text-white' : 'text-[#888] hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>

          {/* Profile button */}
          <button
            onClick={openPicker}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition-colors shrink-0"
          >
            {currentPlayer ? (
              <>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${PLAYER_COLORS[currentPlayer.id] ?? 'bg-gray-600'}`}>
                  {currentPlayer.name[0]}
                </div>
                <span className="hidden md:inline text-sm">{currentPlayer.name}</span>
              </>
            ) : (
              <span className="text-[#555] text-sm">Select profile</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t border-white/[0.08] flex">
        {TABS.map(tab => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active ? 'text-white' : 'text-[#555]'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
