'use client'

import { useState } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { getPlayerBySlug, getPortfolioRows, getLeaderboard } from '@/lib/mock'
import { formatCoins } from '@/lib/format'
import FlagImage from '@/components/FlagImage'
import TeamModal from '@/components/TeamModal'
import { useProfile } from '@/components/ProfileProvider'

export default function PlayerPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const player = getPlayerBySlug(slug)
  const { playerId } = useProfile()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  if (!player) {
    return (
      <div className="text-center py-16">
        <p className="text-[#888]">Player not found.</p>
        <Link href="/main/portfolios" className="text-[#00c805] text-sm mt-2 inline-block">← All portfolios</Link>
      </div>
    )
  }

  const rows = getPortfolioRows(player.id)
  const board = getLeaderboard()
  const entry = board.find(e => e.player.id === player.id)
  const isMe = player.id === playerId

  return (
    <div>
      <div className="mb-5">
        <Link href="/main/portfolios" className="text-sm text-[#666] mb-2 inline-block">← All portfolios</Link>
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-white">{player.name}</h1>
          {isMe && <span className="text-xs font-semibold text-[#00c805] bg-[#00c805]/10 px-2 py-0.5 rounded-full">you</span>}
        </div>
        {entry && (
          <p className="text-3xl font-black text-white mt-1">{formatCoins(entry.current_value)}</p>
        )}
      </div>

      <div className="bg-[#141414] rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[300px]">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left px-4 py-3 text-[#666] font-medium">Team</th>
                <th className="text-right px-3 py-3 text-[#666] font-medium">Sh.</th>
                <th className="text-right px-3 py-3 text-[#666] font-medium hidden sm:table-cell">Draft</th>
                <th className="text-right px-3 py-3 text-[#666] font-medium hidden sm:table-cell">Value</th>
                <th className="text-right px-4 py-3 text-[#666] font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.holding.id} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-4 py-3">
                    <button
                      className="flex items-center gap-2 text-left active:opacity-70"
                      onClick={() => setSelectedTeam(row.team.id)}
                    >
                      <FlagImage code={row.team.code} name={row.team.name} size={20} />
                      <span className="font-medium text-white">{row.team.name}</span>
                    </button>
                  </td>
                  <td className="text-right px-3 py-3 text-[#888]">{row.holding.shares}</td>
                  <td className="text-right px-3 py-3 text-[#666] hidden sm:table-cell">{formatCoins(row.team.draft_value)}</td>
                  <td className="text-right px-3 py-3 text-[#888] hidden sm:table-cell">{formatCoins(row.team.current_value)}</td>
                  <td className="text-right px-4 py-3 font-bold text-white">{formatCoins(row.total_value)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/[0.08]">
                <td colSpan={2} className="px-4 py-3 font-semibold text-[#666] text-sm sm:hidden">Total</td>
                <td colSpan={4} className="px-4 py-3 font-semibold text-[#666] text-sm hidden sm:table-cell">Portfolio total</td>
                <td className="text-right px-4 py-3 font-black text-[#00c805]">
                  {entry ? formatCoins(entry.current_value) : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {selectedTeam && (
        <TeamModal teamId={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </div>
  )
}
