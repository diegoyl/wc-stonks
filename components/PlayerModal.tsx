'use client'

import { useState, useMemo, useEffect } from 'react'
import { getPlayerById, getPortfolioRows, getLeaderboard, getPortfolioHistory } from '@/lib/mock'
import { formatCoins } from '@/lib/format'
import FlagImage from './FlagImage'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const PROJECTED_DATE = '2026-07-19'

const CHART_STYLE = {
  grid: 'rgba(255,255,255,0.05)',
  tick: '#555' as const,
  tooltip: {
    contentStyle: { background: '#18110D', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#fff' },
    labelStyle: { color: '#888' },
  },
}

type SortCol = 'shares' | 'total' | 'projected' | 'return'
type SortDir = 'asc' | 'desc'

function SortTh({ label, active, dir, onClick }: {
  label: string; active: boolean; dir: SortDir; onClick: () => void
}) {
  return (
    <th
      className={`text-right py-2 pr-1 font-medium cursor-pointer select-none whitespace-nowrap transition-colors ${
        active ? 'text-white' : 'text-[#555] hover:text-[#888]'
      }`}
      onClick={onClick}
    >
      {label}{active && <span className="ml-0.5 text-xs">{dir === 'desc' ? '↓' : '↑'}</span>}
    </th>
  )
}

interface Props {
  playerId: string
  onClose: () => void
  onTeamClick?: (teamId: string) => void
}

export default function PlayerModal({ playerId, onClose, onTeamClick }: Props) {
  const [sortCol, setSortCol] = useState<SortCol>('total')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const player = getPlayerById(playerId)
  const rows = getPortfolioRows(playerId)
  const entry = getLeaderboard().find(e => e.player.id === playerId)
  const history = getPortfolioHistory(playerId)

  const chartData = useMemo((): Record<string, unknown>[] => {
    if (!history.length || !entry) return history.map(s => ({ date: s.date, value: s.cumulative }))
    const base = history.map(s => ({ date: s.date, value: s.cumulative } as Record<string, unknown>))
    const last = base[base.length - 1]
    return [
      ...base.slice(0, -1),
      { ...last, proj: last.value },
      { date: PROJECTED_DATE, proj: entry.projected_value },
    ]
  }, [history, entry])

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let diff = 0
      if (sortCol === 'shares')         diff = a.holding.shares - b.holding.shares
      else if (sortCol === 'total')     diff = a.total_value - b.total_value
      else if (sortCol === 'projected') diff = (a.holding.shares * a.team.projected_value) - (b.holding.shares * b.team.projected_value)
      else diff = (a.team.projected_value / a.team.draft_value) - (b.team.projected_value / b.team.draft_value)
      return sortDir === 'desc' ? -diff : diff
    })
  }, [rows, sortCol, sortDir])

  if (!player) return null

  function handleSort(col: SortCol) {
    if (col === sortCol) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const retPct = entry ? (entry.projected_value / 100 - 1) * 100 : 0
  const retColor = retPct >= 0 ? 'text-[#00c805]' : 'text-[#ff4b4b]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-[#18110D] border border-white/[0.08] rounded-2xl shadow-2xl p-5 w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white leading-tight">{player.name}</h2>
            {entry && (
              <>
                <p className="text-2xl font-bold text-white leading-tight">{formatCoins(entry.current_value)}</p>
                <p className={`text-sm mt-0.5 ${retColor}`}>
                  {formatCoins(entry.projected_value)}
                  <span className="ml-1">{Math.abs(retPct).toFixed(0)}%</span>
                </p>
              </>
            )}
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white text-2xl font-light leading-none p-1 ml-4 shrink-0 transition-colors">×</button>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="mb-4 shrink-0">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: CHART_STYLE.tick }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: CHART_STYLE.tick }} tickFormatter={v => `${v}¢`} />
                <Tooltip
                  formatter={(value, name) => [`${value}¢`, name === 'proj' ? 'Projected' : 'Portfolio']}
                  labelFormatter={l => String(l)}
                  {...CHART_STYLE.tooltip}
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 3 }} connectNulls={false} />
                <Line type="monotone" dataKey="proj" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 3" dot={false} opacity={0.7} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Holdings table */}
        <div className="overflow-y-auto min-h-0" style={{ maxHeight: 220 }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#18110D]">
              <tr className="border-b border-white/[0.08]">
                <th className="text-left py-2 text-[#666] font-medium">Team</th>
                <SortTh label="Shares"    active={sortCol === 'shares'}    dir={sortDir} onClick={() => handleSort('shares')} />
                <SortTh label="Value"     active={sortCol === 'total'}     dir={sortDir} onClick={() => handleSort('total')} />
                <SortTh label="Proj"      active={sortCol === 'projected'} dir={sortDir} onClick={() => handleSort('projected')} />
                <SortTh label="Return"    active={sortCol === 'return'}    dir={sortDir} onClick={() => handleSort('return')} />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map(row => {
                const projTotal = row.holding.shares * row.team.projected_value
                const ret = (row.team.projected_value / row.team.draft_value - 1) * 100
                const rowRetColor = ret >= 0 ? 'text-[#00c805]' : 'text-[#ff4b4b]'
                return (
                  <tr key={row.holding.id} className="border-b border-white/[0.05] last:border-0">
                    <td className="py-2.5">
                      <button
                        className="flex items-center gap-2 hover:opacity-80 text-left"
                        onClick={() => onTeamClick?.(row.team.id)}
                      >
                        <FlagImage code={row.team.code} name={row.team.name} size={20} />
                        <span className="font-medium text-white">{row.team.code}</span>
                      </button>
                    </td>
                    <td className="text-right py-2.5 pr-1 text-[#888]">×{row.holding.shares}</td>
                    <td className="text-right py-2.5 pr-1 font-semibold text-white">{formatCoins(row.total_value)}</td>
                    <td className={`text-right py-2.5 pr-1 font-semibold ${rowRetColor}`}>{formatCoins(projTotal)}</td>
                    <td className={`text-right py-2.5 text-xs font-semibold ${rowRetColor}`}>
                      {Math.abs(ret).toFixed(0)}%
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
