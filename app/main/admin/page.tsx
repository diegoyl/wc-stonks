'use client'

import { useState } from 'react'
import { ADMIN_PASSWORD } from '@/lib/config'
import { getMainPotRules, getSideBets, getTeamsWithValue } from '@/lib/mock'
import { formatCoins } from '@/lib/format'
import FlagImage from '@/components/FlagImage'

export default function AdminPage() {
  const [input, setInput] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === ADMIN_PASSWORD) { setAuthed(true); setError(false) }
    else setError(true)
  }

  if (!authed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#141111] rounded-2xl border border-white/[0.08] p-8 w-full max-w-sm">
          <h1 className="text-xl text-[#ebe0cc] mb-6">Admin</h1>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false) }}
              placeholder="2x"
              autoFocus
              className={`w-full px-4 py-2.5 rounded-lg border bg-[#141111] text-[#ebe0cc] text-sm outline-none focus:ring-2 transition-all placeholder-[#555] ${
                error
                  ? 'border-[#ff4b4b]/50 focus:ring-[#ff4b4b]/20'
                  : 'border-white/[0.1] focus:ring-[#00c805]/20 focus:border-[#00c805]/50'
              }`}
            />
            {error && <p className="text-xs text-[#ff4b4b]">Incorrect password.</p>}
            <button
              type="submit"
              className="w-full bg-[#00c805] text-black rounded-lg py-2.5 text-sm hover:bg-[#00c805]/90 transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  const rules = getMainPotRules()
  const bets = getSideBets()
  const teams = getTeamsWithValue()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl text-[#ebe0cc]">Admin</h1>
        <span className="text-xs text-[#00c805] bg-[#00c805]/10 px-2 py-0.5 rounded-full">authenticated</span>
      </div>

      <div className="grid gap-6">

        <Section title="Award Main-Pot Value" badge="stub">
          <p className="text-sm text-[#888] mb-4">Select a rule and team to add a value event. Wired to DB in Phase 2.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <select className={selectCls} disabled>
              <option>Select team…</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({formatCoins(t.current_value)})</option>)}
            </select>
            <select className={selectCls} disabled>
              <option>Select rule…</option>
              {rules.map(r => <option key={r.id} value={r.id}>{r.label} (+{formatCoins(r.payout)})</option>)}
            </select>
          </div>
          <button disabled className={btnDisabled}>Award value (Phase 2)</button>

          <div className="mt-4">
            <p className="text-xs text-[#666] uppercase tracking-wide mb-2">Payout schedule</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {rules.map(r => (
                <div key={r.id} className="bg-white/[0.04] rounded-lg px-3 py-2 flex items-center justify-between text-sm gap-2">
                  <span className="text-[#888] text-xs">{r.label}</span>
                  <span className="font-bold text-[#ebe0cc] shrink-0">{formatCoins(r.payout)}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Settle Side Bets" badge="stub">
          <p className="text-sm text-[#888] mb-4">Mark a side bet as settled and assign winning team(s). Wired in Phase 2.</p>
          <div className="space-y-2">
            {bets.map(bet => (
              <div key={bet.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.03]">
                <div>
                  <span className="font-medium text-[#ebe0cc] text-sm">{bet.name}</span>
                  <span className="ml-2 text-xs text-[#666]">{formatCoins(bet.payout)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    bet.status === 'settled'
                      ? 'bg-[#00c805]/15 text-[#00c805]'
                      : 'bg-[#eeb22d]/10 text-[#eeb22d]'
                  }`}>
                    {bet.status}
                  </span>
                  <button disabled className="text-xs text-[#555] border border-white/[0.08] px-2 py-0.5 rounded cursor-not-allowed">
                    Settle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Team Values" badge="read-only">
          <p className="text-sm text-[#888] mb-4">Current values from mock data.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-2 text-[#666]">Team</th>
                  <th className="text-right py-2 text-[#666]">Current</th>
                </tr>
              </thead>
              <tbody>
                {teams.sort((a, b) => b.current_value - a.current_value).map(t => (
                  <tr key={t.id} className="border-b border-white/[0.04] last:border-0">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <FlagImage code={t.code} name={t.name} size={18} />
                        <span className="text-[#ebe0cc]">{t.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-2 text-[#ebe0cc]">{formatCoins(t.current_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Sync FIFA Data" badge="phase 3">
          <p className="text-sm text-[#888] mb-3">Pull latest results from API-Football.</p>
          <button disabled className={btnDisabled}>Sync now (Phase 3)</button>
          <p className="text-xs text-[#555] mt-2">~10 API requests · 100 req/day limit</p>
        </Section>

      </div>
    </div>
  )
}

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#141111] rounded-xl border border-white/[0.08] p-5">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-bold text-[#ebe0cc]">{title}</h2>
        {badge && (
          <span className="text-xs text-[#666] bg-white/[0.06] px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      {children}
    </div>
  )
}

const selectCls = 'w-full px-3 py-2 rounded-lg border border-white/[0.1] text-sm text-[#555] bg-[#141111] cursor-not-allowed'
const btnDisabled = 'px-4 py-2 rounded-lg bg-white/[0.06] text-[#555] text-sm cursor-not-allowed'
