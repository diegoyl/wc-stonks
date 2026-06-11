'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getLeaderboard, getPortfolioRows } from '@/lib/mock'
import { formatCoins } from '@/lib/format'
import FlagImage from '@/components/FlagImage'
import TeamModal from '@/components/TeamModal'
import { useProfile } from '@/components/ProfileProvider'

export default function PortfoliosPage() {
  const entries = getLeaderboard()
  const { playerId } = useProfile()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  return (
    <div>
      <h1 className="text-xl font-bold text-[#ebe0cc] mb-4">Portfolios</h1>

      <div className="space-y-4">
        {entries.map(entry => {
          const rows = getPortfolioRows(entry.player.id)
          const isMe = entry.player.id === playerId

          return (
            <div key={entry.player.id} className={`rounded-xl border overflow-hidden ${isMe ? 'border-[#00c805]/30' : 'border-white/[0.08]'} bg-[#141111]`}>
              {/* Header */}
              <div className={`px-4 py-3 flex items-center justify-between ${isMe ? 'bg-[#00c805]/[0.06]' : 'bg-white/[0.03]'}`}>
                <Link
                  href={`/main/portfolios/${entry.player.slug}`}
                  className="font-bold text-[#ebe0cc] flex items-center gap-2"
                >
                  {entry.player.name}
                  {isMe && <span className="text-xs font-semibold text-[#00c805] bg-[#00c805]/10 px-1.5 py-0.5 rounded-full">you</span>}
                </Link>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#555]">#{entry.rank}</span>
                  <span className="font-bold text-[#ebe0cc]">{formatCoins(entry.current_value)}</span>
                </div>
              </div>

              {/* Holdings table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[320px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-4 py-2 text-[#666] font-medium">Team</th>
                      <th className="text-right px-3 py-2 text-[#666] font-medium">Sh.</th>
                      <th className="text-right px-3 py-2 text-[#666] font-medium hidden sm:table-cell">Draft</th>
                      <th className="text-right px-3 py-2 text-[#666] font-medium hidden sm:table-cell">Value</th>
                      <th className="text-right px-4 py-2 text-[#666] font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.holding.id} className="border-b border-white/[0.04] last:border-0">
                        <td className="px-4 py-2.5">
                          <button
                            className="flex items-center gap-2 text-left active:opacity-70"
                            onClick={() => setSelectedTeam(row.team.id)}
                          >
                            <FlagImage code={row.team.code} name={row.team.name} size={18} />
                            <span className="font-medium text-[#ebe0cc]">{row.team.name}</span>
                          </button>
                        </td>
                        <td className="text-right px-3 py-2.5 text-[#888]">{row.holding.shares}</td>
                        <td className="text-right px-3 py-2.5 text-[#666] hidden sm:table-cell">{formatCoins(row.team.draft_value)}</td>
                        <td className="text-right px-3 py-2.5 text-[#888] hidden sm:table-cell">{formatCoins(row.team.current_value)}</td>
                        <td className="text-right px-4 py-2.5 font-bold text-[#ebe0cc]">{formatCoins(row.total_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      {selectedTeam && (
        <TeamModal teamId={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </div>
  )
}
