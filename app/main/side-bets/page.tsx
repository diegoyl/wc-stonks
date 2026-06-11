'use client'

import { useState } from 'react'
import {
  getSideBets, getSideBetWinnersForBet, getSideBetStandingsForBet,
  getTeamById,
} from '@/lib/mock'
import { formatCoins } from '@/lib/format'
import FlagImage from '@/components/FlagImage'
import TeamModal from '@/components/TeamModal'

export default function SideBetsPage() {
  const bets = getSideBets()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  return (
    <div>
      <h1 className="text-xl text-[#ebe0cc] mb-4">Side Bets</h1>

      <div className="space-y-4">
        {bets.map(bet => {
          const settled = bet.status === 'settled'
          const winners = settled ? getSideBetWinnersForBet(bet.id) : []
          const standings = !settled ? getSideBetStandingsForBet(bet.id) : []

          return (
            <div key={bet.id} className="bg-[#141111] rounded-xl border border-white/[0.08] overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-[#ebe0cc] text-sm">{bet.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        settled
                          ? 'bg-[#00c805]/15 text-[#00c805]'
                          : 'bg-[#eeb22d]/10 text-[#eeb22d]'
                      }`}>
                        {settled ? 'Settled' : 'Open'}
                      </span>
                    </div>
                    {bet.description && (
                      <p className="text-xs text-[#666] mt-0.5 leading-snug">{bet.description}</p>
                    )}
                  </div>
                  <span className="font-bold text-[#ebe0cc] text-sm shrink-0">{formatCoins(bet.payout)}</span>
                </div>
              </div>

              {/* Settled — winners */}
              {settled && (
                <div className="divide-y divide-white/[0.04]">
                  {winners.map(w => {
                    const team = getTeamById(w.team_id)
                    if (!team) return null
                    return (
                      <div key={w.id} className="px-4 py-3 flex items-center justify-between">
                        <button
                          className="flex items-center gap-2 hover:opacity-80 text-left"
                          onClick={() => setSelectedTeam(team.id)}
                        >
                          <FlagImage code={team.code} name={team.name} size={20} />
                          <span className="font-semibold text-[#ebe0cc]">{team.name}</span>
                          {winners.length > 1 && (
                            <span className="text-xs text-[#666]">split</span>
                          )}
                        </button>
                        <span className="font-bold text-[#00c805]">{formatCoins(w.payout_amount)}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Open — standings */}
              {!settled && standings.length > 0 && (
                <div className="divide-y divide-white/[0.04]">
                  {standings.map(s => {
                    const team = getTeamById(s.team_id)
                    if (!team) return null
                    return (
                      <div key={s.id} className="px-4 py-2.5 flex items-center gap-3">
                        <span className="text-[#555] w-5 text-center text-sm">{s.rank}</span>
                        <button
                          className="flex items-center gap-2 flex-1 hover:opacity-80 text-left"
                          onClick={() => setSelectedTeam(team.id)}
                        >
                          <FlagImage code={team.code} name={team.name} size={18} />
                          <span className="font-medium text-[#ebe0cc]">{team.name}</span>
                        </button>
                        <span className="text-sm text-[#888]">{s.metric_value}</span>
                        {s.rank === 1 && (
                          <span className="text-xs text-[#eeb22d] bg-[#eeb22d]/10 px-1.5 py-0.5 rounded-full">
                            leader
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
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
