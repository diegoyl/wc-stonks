'use client'

import { useMemo, useEffect } from 'react'
import { getTeamById, getValueHistory, getMainPotRules, getValueEvents } from '@/lib/mock'
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

interface Props {
  teamId: string
  onClose: () => void
}

export default function TeamModal({ teamId, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const team = getTeamById(teamId)
  const history = getValueHistory(teamId)
  const rules = getMainPotRules()
  const events = getValueEvents().filter(e => e.team_id === teamId)
  const rulesMap = new Map(rules.map(r => [r.id, r]))

  const chartData = useMemo((): Record<string, unknown>[] => {
    if (!history.length || !team) return []
    const base = history.map(s => ({ date: s.date, value: s.cumulative } as Record<string, unknown>))
    const last = base[base.length - 1]
    return [
      ...base.slice(0, -1),
      { ...last, proj: last.value },
      { date: PROJECTED_DATE, proj: team.projected_value },
    ]
  }, [history, team])

  if (!team) return null

  const retPct = (team.projected_value / team.draft_value - 1) * 100
  const retColor = retPct >= 0 ? '#00c805' : '#ff4b4b'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-[#18110D] border border-white/[0.08] rounded-2xl shadow-2xl p-5 w-full max-w-md max-h-[90vh] flex flex-col overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FlagImage code={team.code} name={team.name} size={44} />
            <div>
              <p className="text-xs font-semibold text-[#666] uppercase tracking-wide leading-none mb-1">{team.code}</p>
              <h2 className="text-xl font-bold text-white leading-tight">{team.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white text-2xl font-light leading-none p-1 ml-4 shrink-0 transition-colors">×</button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="Draft"     value={formatCoins(team.draft_value)} />
          <Stat label="Current"   value={formatCoins(team.current_value)} />
          <Stat label="Projected" value={formatCoins(team.projected_value)} color={retColor} />
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
                  formatter={(value, name) => [`${value}¢`, name === 'proj' ? 'Projected' : 'Current']}
                  labelFormatter={l => String(l)}
                  {...CHART_STYLE.tooltip}
                />
                <Line type="monotone" dataKey="value" stroke="#00c805" strokeWidth={2} dot={false} activeDot={{ r: 3 }} connectNulls={false} />
                <Line type="monotone" dataKey="proj" stroke="#00c805" strokeWidth={1.5} strokeDasharray="5 3" dot={false} opacity={0.7} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Event log */}
        <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
          {events.length === 0 ? (
            <p className="text-sm text-[#555] py-3">No value events yet.</p>
          ) : (
            <div>
              {events
                .sort((a, b) => a.effective_at.localeCompare(b.effective_at))
                .map(e => {
                  const rule = e.main_pot_rule_id ? rulesMap.get(e.main_pot_rule_id) : null
                  const label = rule?.label ?? (e.source === 'side_bet' ? 'Side bet' : 'Event')
                  return (
                    <div key={e.id} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
                      <span className="font-medium text-white text-sm">{label}</span>
                      <span className={`font-semibold text-sm shrink-0 ml-2 ${e.amount >= 0 ? 'text-[#00c805]' : 'text-[#ff4b4b]'}`}>
                        {formatCoins(e.amount)}
                      </span>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white/[0.04] rounded-xl p-3 text-center">
      <p className="text-xs text-[#666] mb-0.5">{label}</p>
      <p className="text-base font-bold" style={{ color: color ?? '#fff' }}>{value}</p>
    </div>
  )
}
