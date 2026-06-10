'use client'

import { useState, useMemo } from 'react'
import {
  getLeaderboard, getTeamsWithValue, getPortfolioHistory, getValueHistory,
} from '@/lib/mock'
import { formatCoins } from '@/lib/format'
import FlagImage from '@/components/FlagImage'
import PlayerModal from '@/components/PlayerModal'
import TeamModal from '@/components/TeamModal'
import { useProfile } from '@/components/ProfileProvider'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

// ─── Constants ───────────────────────────────────────────────────────────────

const TEAM_COLORS = [
  '#10b981', '#3b82f6', '#eeb22d', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1',
  '#14b8a6', '#f43f5e', '#a855f7', '#0ea5e9',
]

const PLAYER_COLORS: Record<string, string> = {
  'player-diego': '#3b82f6',
  'player-marco': '#10b981',
  'player-sofia': '#8b5cf6',
  'player-lucas': '#f97316',
  'player-ana':   '#ec4899',
  'player-raj':   '#06b6d4',
}

const PROJECTED_DATE = '2026-07-19'

const CHART_STYLE = {
  grid: 'rgba(255,255,255,0.05)',
  tick: '#555' as const,
  tooltip: {
    contentStyle: { background: '#18110D', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#fff' },
    labelStyle: { color: '#888' },
  },
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

type ChartMode = 'actual' | 'market'

function ModeToggle({ mode, onChange }: { mode: ChartMode; onChange: (m: ChartMode) => void }) {
  return (
    <div className="flex border border-white/[0.12] rounded-lg overflow-hidden shrink-0">
      <button
        onClick={() => onChange('actual')}
        className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
          mode === 'actual' ? 'bg-[#c9bba9] text-[#3d1f0a]' : 'bg-transparent text-[#666] hover:text-[#999]'
        }`}
      >
        Actual
      </button>
      <button
        onClick={() => onChange('market')}
        className={`px-3 py-1.5 text-xs font-semibold border-l border-white/[0.12] transition-colors ${
          mode === 'market' ? 'bg-[#c9bba9] text-[#3d1f0a]' : 'bg-transparent text-[#666] hover:text-[#999]'
        }`}
      >
        Market
      </button>
    </div>
  )
}

function SortTh({
  label, active, onClick, last = false,
}: { label: string; active: boolean; onClick: () => void; last?: boolean }) {
  return (
    <th
      className={`text-right ${last ? 'px-4' : 'px-3'} py-3 font-medium cursor-pointer select-none whitespace-nowrap transition-colors ${
        active ? 'text-white' : 'text-[#555] hover:text-[#888]'
      }`}
      onClick={onClick}
    >
      {label}
    </th>
  )
}

// ─── Standings section ────────────────────────────────────────────────────────

function StandingsSection({ onPlayerClick }: { onPlayerClick: (id: string) => void }) {
  const entries = getLeaderboard()
  const { playerId } = useProfile()
  const [sort, setSort] = useState<'actual' | 'market'>('actual')
  const [chartMode, setChartMode] = useState<ChartMode>('actual')
  const [chartPlayers, setChartPlayers] = useState<Set<string>>(
    new Set(entries.slice(0, 4).map(e => String(e.player.id)))
  )

  function togglePlayer(id: string) {
    setChartPlayers(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
    })
  }

  const chartData = useMemo(() => {
    const allDates = new Set<string>()
    const histories = new Map<string, Map<string, number>>()
    for (const pid of chartPlayers) {
      const h = getPortfolioHistory(pid)
      histories.set(pid, new Map(h.map(s => [s.date, s.cumulative])))
      h.forEach(s => allDates.add(s.date))
    }
    return [...allDates].sort().map(date => {
      const row: Record<string, string | number> = { date }
      for (const [pid, byDate] of histories) {
        const v = byDate.get(date); if (v !== undefined) row[pid] = v
      }
      return row
    })
  }, [chartPlayers])

  const filledChartData = useMemo(() => {
    const last = new Map<string, number>()
    return chartData.map(row => {
      const filled: Record<string, string | number> = { date: row.date }
      for (const pid of chartPlayers) {
        const v = row[pid] as number | undefined
        if (v !== undefined) { last.set(pid, v); filled[pid] = v }
        else filled[pid] = last.get(pid) ?? 0
      }
      return filled
    })
  }, [chartData, chartPlayers])

  const displayChartData = useMemo(() => {
    if (chartMode === 'actual' || !filledChartData.length) return filledChartData
    const lastRow = { ...filledChartData[filledChartData.length - 1] }
    const projRow: Record<string, string | number> = { date: PROJECTED_DATE }
    for (const pid of chartPlayers) {
      lastRow[pid + '_proj'] = lastRow[pid] as number ?? 0
      projRow[pid + '_proj'] = entries.find(e => e.player.id === pid)?.projected_value
        ?? (lastRow[pid] as number ?? 0)
    }
    return [...filledChartData.slice(0, -1), lastRow, projRow]
  }, [filledChartData, chartMode, chartPlayers, entries])

  const sortedEntries = [...entries].sort((a, b) =>
    sort === 'actual' ? b.current_value - a.current_value : b.projected_value - a.projected_value
  )
  const chartList = entries.filter(e => chartPlayers.has(e.player.id))

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Standings</h2>

      <div className="bg-[#18110D] rounded-xl border border-white/[0.08] p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5 flex-1 min-w-0">
            {entries.map(entry => {
              const active = chartPlayers.has(entry.player.id)
              const color = PLAYER_COLORS[entry.player.id] ?? '#6b7280'
              return (
                <button
                  key={entry.player.id}
                  onClick={() => togglePlayer(entry.player.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 transition-all active:scale-95 ${
                    active ? 'border-transparent text-white' : 'border-white/[0.12] text-[#555] bg-transparent'
                  }`}
                  style={active ? { backgroundColor: color, borderColor: color } : {}}
                >
                  {entry.player.name}
                </button>
              )
            })}
          </div>
          <ModeToggle mode={chartMode} onChange={setChartMode} />
        </div>

        {filledChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={displayChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: CHART_STYLE.tick }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: CHART_STYLE.tick }} tickFormatter={v => `${v}¢`} />
              <Tooltip
                formatter={(value, name) => {
                  const pid = String(name).replace('_proj', '')
                  const label = entries.find(e => e.player.id === pid)?.player.name ?? pid
                  return [`${value}¢`, String(name).endsWith('_proj') ? `${label} (proj)` : label]
                }}
                labelFormatter={l => String(l)}
                {...CHART_STYLE.tooltip}
              />
              {chartList.map(entry => (
                <Line key={entry.player.id} type="monotone" dataKey={entry.player.id}
                  stroke={PLAYER_COLORS[entry.player.id]} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
              ))}
              {chartMode === 'market' && chartList.map(entry => (
                <Line key={entry.player.id + '_proj'} type="monotone" dataKey={entry.player.id + '_proj'}
                  stroke={PLAYER_COLORS[entry.player.id]} strokeWidth={1.5} strokeDasharray="5 3"
                  dot={false} opacity={0.7} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center text-[#555] text-sm">
            Select players above to view chart
          </div>
        )}
      </div>

      <div className="bg-[#18110D] rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[280px]">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left px-4 py-3 text-[#666] font-medium">Name</th>
                <SortTh label="Actual" active={sort === 'actual'} onClick={() => setSort('actual')} />
                <SortTh label="Market" active={sort === 'market'} onClick={() => setSort('market')} last />
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map(entry => {
                const isMe = entry.player.id === playerId
                const retPct = (entry.projected_value / 100 - 1) * 100
                const retColor = retPct >= 0 ? 'text-[#00c805]' : 'text-[#ff4b4b]'
                return (
                  <tr
                    key={entry.player.id}
                    className="border-b border-white/[0.05] last:border-0 active:bg-white/[0.03] cursor-pointer"
                    onClick={() => onPlayerClick(entry.player.id)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{entry.player.name}</span>
                      {isMe && (
                        <span className="ml-2 text-xs font-semibold text-[#00c805] bg-[#00c805]/10 px-1.5 py-0.5 rounded-full">
                          you
                        </span>
                      )}
                    </td>
                    <td className="text-right px-3 py-3 font-semibold text-white">
                      {formatCoins(entry.current_value)}
                    </td>
                    <td className="text-right px-4 py-3">
                      <span className={`font-semibold ${retColor}`}>{formatCoins(entry.projected_value)}</span>
                      <span className={`ml-1 text-xs font-medium ${retColor}`}>
                        ({retPct >= 0 ? '+' : ''}{retPct.toFixed(0)}%)
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Teams section ────────────────────────────────────────────────────────────

function TeamsSection({ onTeamClick }: { onTeamClick: (id: string) => void }) {
  const allTeams = getTeamsWithValue()
  const teamsDesc = [...allTeams].sort((a, b) => b.current_value - a.current_value)
  const [sort, setSort] = useState<'actual' | 'market' | 'return'>('actual')
  const [chartMode, setChartMode] = useState<ChartMode>('actual')
  const [chartTeams, setChartTeams] = useState<Set<string>>(
    new Set(teamsDesc.filter(t => t.current_value > 0).slice(0, 5).map(t => t.id))
  )

  function toggleTeam(id: string) {
    setChartTeams(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
    })
  }

  const chartData = useMemo(() => {
    const allDates = new Set<string>()
    const histories = new Map<string, Map<string, number>>()
    for (const tid of chartTeams) {
      const h = getValueHistory(tid)
      histories.set(tid, new Map(h.map(s => [s.date, s.cumulative])))
      h.forEach(s => allDates.add(s.date))
    }
    return [...allDates].sort().map(date => {
      const row: Record<string, string | number> = { date }
      for (const [tid, byDate] of histories) {
        const v = byDate.get(date); if (v !== undefined) row[tid] = v
      }
      return row
    })
  }, [chartTeams])

  const filledChartData = useMemo(() => {
    const last = new Map<string, number>()
    return chartData.map(row => {
      const filled: Record<string, string | number> = { date: row.date }
      for (const tid of chartTeams) {
        const v = row[tid] as number | undefined
        if (v !== undefined) { last.set(tid, v); filled[tid] = v }
        else filled[tid] = last.get(tid) ?? 0
      }
      return filled
    })
  }, [chartData, chartTeams])

  const displayChartData = useMemo(() => {
    if (chartMode === 'actual' || !filledChartData.length) return filledChartData
    const lastRow = { ...filledChartData[filledChartData.length - 1] }
    const projRow: Record<string, string | number> = { date: PROJECTED_DATE }
    for (const tid of chartTeams) {
      lastRow[tid + '_proj'] = lastRow[tid] as number ?? 0
      projRow[tid + '_proj'] = allTeams.find(t => t.id === tid)?.projected_value
        ?? (lastRow[tid] as number ?? 0)
    }
    return [...filledChartData.slice(0, -1), lastRow, projRow]
  }, [filledChartData, chartMode, chartTeams, allTeams])

  const chartList = teamsDesc.filter(t => chartTeams.has(t.id))

  const sortedTeams = [...teamsDesc].sort((a, b) => {
    if (sort === 'market') return b.projected_value - a.projected_value
    if (sort === 'return') return (b.projected_value / b.draft_value) - (a.projected_value / a.draft_value)
    return b.current_value - a.current_value
  })

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Teams</h2>

      <div className="bg-[#18110D] rounded-xl border border-white/[0.08] p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5 flex-1 min-w-0">
            {teamsDesc.filter(t => t.current_value > 0).map(team => {
              const active = chartTeams.has(team.id)
              const color = TEAM_COLORS[teamsDesc.findIndex(t => t.id === team.id) % TEAM_COLORS.length]
              return (
                <button
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 transition-all active:scale-95 ${
                    active ? 'border-transparent text-white' : 'border-white/[0.12] text-[#555] bg-transparent'
                  }`}
                  style={active ? { backgroundColor: color, borderColor: color } : {}}
                >
                  {team.code}
                </button>
              )
            })}
          </div>
          <ModeToggle mode={chartMode} onChange={setChartMode} />
        </div>

        {filledChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={displayChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: CHART_STYLE.tick }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: CHART_STYLE.tick }} tickFormatter={v => `${v}¢`} />
              <Tooltip
                formatter={(value, name) => {
                  const tid = String(name).replace('_proj', '')
                  const label = allTeams.find(t => t.id === tid)?.name ?? tid
                  return [`${value}¢`, String(name).endsWith('_proj') ? `${label} (proj)` : label]
                }}
                labelFormatter={l => String(l)}
                {...CHART_STYLE.tooltip}
              />
              {chartList.map(team => (
                <Line key={team.id} type="monotone" dataKey={team.id}
                  stroke={TEAM_COLORS[teamsDesc.findIndex(t => t.id === team.id) % TEAM_COLORS.length]}
                  strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
              ))}
              {chartMode === 'market' && chartList.map(team => (
                <Line key={team.id + '_proj'} type="monotone" dataKey={team.id + '_proj'}
                  stroke={TEAM_COLORS[teamsDesc.findIndex(t => t.id === team.id) % TEAM_COLORS.length]}
                  strokeWidth={1.5} strokeDasharray="5 3" dot={false} opacity={0.7} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center text-[#555] text-sm">
            Select teams above to view chart
          </div>
        )}
      </div>

      <div className="bg-[#18110D] rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[320px]">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left px-4 py-3 text-[#666] font-medium">Team</th>
                <SortTh label="Actual" active={sort === 'actual'} onClick={() => setSort('actual')} />
                <SortTh label="Market" active={sort === 'market'} onClick={() => setSort('market')} />
                <SortTh label="Return" active={sort === 'return'} onClick={() => setSort('return')} last />
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map(team => {
                const retPct = (team.projected_value / team.draft_value - 1) * 100
                const retColor = retPct >= 0 ? 'text-[#00c805]' : 'text-[#ff4b4b]'
                return (
                  <tr
                    key={team.id}
                    className="border-b border-white/[0.05] last:border-0 active:bg-white/[0.03] cursor-pointer"
                    onClick={() => onTeamClick(team.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FlagImage code={team.code} name={team.name} size={20} />
                        <span className="font-medium text-white">{team.name}</span>
                      </div>
                    </td>
                    <td className="text-right px-3 py-3 font-semibold text-white">
                      {formatCoins(team.current_value)}
                    </td>
                    <td className={`text-right px-3 py-3 font-semibold ${retColor}`}>
                      {formatCoins(team.projected_value)}
                    </td>
                    <td className={`text-right px-4 py-3 font-semibold text-xs ${retColor}`}>
                      {retPct >= 0 ? '+' : ''}{retPct.toFixed(0)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      <StandingsSection onPlayerClick={id => setSelectedPlayer(id)} />
      <TeamsSection onTeamClick={id => setSelectedTeam(id)} />

      {selectedPlayer && (
        <PlayerModal
          playerId={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onTeamClick={id => { setSelectedPlayer(null); setSelectedTeam(id) }}
        />
      )}
      {selectedTeam && (
        <TeamModal teamId={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </div>
  )
}
