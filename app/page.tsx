'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { DRAFT_TEAMS } from '@/lib/data/teams'
import type { DraftTeam } from '@/lib/data/teams'
import { PLAYERS, MAIN_POT_RULES } from '@/lib/mock/data'
import FlagImage from '@/components/FlagImage'
import DraftTeamPopup from '@/components/DraftTeamPopup'
import { loadDraftSubmission, saveDraftSubmission } from '@/lib/supabase'

// ─── Constants ───────────────────────────────────────────────────────────────

const BUDGET = 100
const MAX_PER_TEAM = 40

const SORTED_TEAMS = [...DRAFT_TEAMS].sort((a, b) =>
  b.draft_value - a.draft_value || a.fifa_rank - b.fifa_rank
)

// ─── Confirm modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  shares,
  remaining,
  onConfirm,
  onEdit,
}: {
  shares: Record<string, number>
  remaining: number
  onConfirm: () => void
  onEdit: () => void
}) {
  const pickedTeams = SORTED_TEAMS
    .filter(t => (shares[t.id] ?? 0) > 0)
    .sort((a, b) => (shares[b.id] * b.draft_value) - (shares[a.id] * a.draft_value))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#18110D] rounded-2xl border border-white/[0.1] w-full max-w-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">Confirm Selections</h2>
          {remaining >= 2 && (
            <p className="text-xs text-red-300/80 mt-1.5">You still have {remaining}¢ left</p>
          )}
        </div>
        <div className="border-t border-white/[0.08]">
          <table className="w-full text-sm">
            <tbody>
              {pickedTeams.map(team => {
                const count = shares[team.id]
                const total = count * team.draft_value
                return (
                  <tr key={team.id} className="border-b border-white/[0.05] last:border-0">
                    <td className="pl-4 py-2.5">
                      <FlagImage code={team.code} name={team.name} size={30} outlined />
                    </td>
                    <td className="pl-2 pr-3 py-2.5 text-base font-semibold text-white">{team.code}</td>
                    <td className="py-2.5 text-xs text-white/40 text-right tabular-nums">{count}</td>
                    <td className="py-2.5 px-1.5 text-xs text-white/40 text-center">×</td>
                    <td className="py-2.5 text-xs text-white/40 text-left tabular-nums">{team.draft_value}¢</td>
                    <td className="pr-4 pl-3 py-2.5 text-right text-base font-bold text-[#eeb22d] tabular-nums">{total}¢</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-white/[0.08]">
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex-1 py-3 rounded-xl border border-white/[0.12] text-sm font-bold text-white hover:bg-white/[0.05] transition-colors uppercase"
            >
              Edit Draft
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-[#c9bba9] text-[#3d1f0a] text-sm font-bold hover:bg-[#c9bba9]/90 transition-colors uppercase"
            >
              Submit
            </button>
          </div>
          <p className="text-xs text-white/40 text-center mt-3">Resubmit anytime to make changes</p>
        </div>
      </div>
    </div>
  )
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ playerName }: { playerName: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18110D]">
      <div className="text-center">
        <div className="text-5xl mb-4">⚽</div>
        <h1 className="text-2xl font-bold text-white mb-2">Draft Submitted!</h1>
        <p className="text-[#666] text-sm">
          <span className="uppercase">{playerName}</span>&apos;s picks are locked in. Good luck!
        </p>
      </div>
    </div>
  )
}

// ─── Player picker ────────────────────────────────────────────────────────────

function PlayerPicker({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#18110D] rounded-2xl border border-white/[0.1] w-full max-w-xs p-6">
        <h2 className="text-lg font-bold text-white mb-1">Who are you?</h2>
        <p className="text-sm text-[#666] mb-5">Select your profile to begin drafting.</p>
        <div className="space-y-2">
          {PLAYERS.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="w-full text-left px-4 py-3 rounded-xl border border-white/[0.08] text-white font-medium hover:bg-white/[0.06] hover:border-white/[0.16] transition-all active:scale-[0.98] uppercase"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Bets popup ───────────────────────────────────────────────────────────────

const BONUS_PRIZE_DETAILS: Record<string, string | null> = {
  'Goals Scored (GS)':          'Team that scores most goals during group stage',
  'Goals Conceded (Group Stage)':        'Team that concedes the most goals during group stage',
  'Golden Boot':        'Team whose player scores most goals in tournament',
  'Golden Glove':       'Team whose goalie wins best goalie of the tournament',
  'Top European Team':          'Highest-finishing team from UEFA (Europe)',
  'Top Americas Team (N+S)':    'Highest-finishing team from CONCACAF or CONMEBOL (North/Central/South America)',
  'Top African Team':           'Highest-finishing team from CAF (Africa)',
  'Top Asian/Oceania Team':     'Highest-finishing team from AFC or OFC (Asia or Oceania)',
  'Biggest Upset':              'Team with the biggest upset win, determined by match odds',
  'Earliest Goal':       'Team whose player scores the earliest goal in any match. Determined by goal minute, not date.',
  'Biggest Margin of Victory':  'Team that wins a match by the largest goal difference.',
  'Biggest Margin of Defeat':   'Team that loses a match by the largest goal difference.',
  'Worst Team': 'Team that finishes the group stage with the fewest points. Tiebreakers: Goal Differential, Goals Scored',
  'Most Red Cards':             'Team that receives the most red cards across the entire tournament.',
  'Most Yellow Cards':          'Team that receives the most yellow cards across the entire tournament.',
  'Most Own Goals':             'Team who scores the most own goals across the entire tournament.',
  'Hat Trick':                  "Each time a team's player scores 3+ goals in a single match.",
  'David In Attendance':    "Awarded to both teams if David is in the stadium during the match",
}


function PrizeRow({ id, label, payout, detail, expanded, onToggle }: {
  id: string
  label: string
  payout: number | null
  detail?: string | null
  expanded: boolean
  onToggle: () => void
}) {
  const canExpand = !!detail
  const payoutEl = payout != null
    ? <span className="text-sm font-bold text-[#eeb22d]">{payout}¢</span>
    : <span className="text-sm text-[#444]">TBD</span>

  return (
    <div>
      {canExpand ? (
        <button className="w-full flex items-center justify-between gap-2 text-left py-1" onClick={onToggle}>
          <span className={`text-sm transition-colors flex-1 ${expanded ? 'text-white' : 'text-white/80'}`}>{label}</span>
          <span className="text-[10px] border border-white/[0.15] text-white/30 px-1.5 py-0.5 rounded shrink-0">DETAILS</span>
          <span className="shrink-0">{payoutEl}</span>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2 py-1">
          <span className="text-sm text-white/80 flex-1">{label}</span>
          <span className="shrink-0">{payoutEl}</span>
        </div>
      )}
      {expanded && detail && (
        <p className="text-xs text-[#666] leading-relaxed pb-1.5">{detail}</p>
      )}
    </div>
  )
}

function BetsPopup({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function toggle(id: string) {
    setExpanded(prev => prev === id ? null : id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#18110D] rounded-2xl border border-white/[0.1] w-full max-w-sm max-h-[85vh] flex flex-col normal-case tracking-normal" onClick={e => e.stopPropagation()}>
        <div className="overflow-y-auto flex-1">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-white uppercase">Prizes</h2>
          <p className="text-xs text-white/50 mt-1.5 leading-relaxed normal-case">
            Teams earn prizes by winning matches or bonus prizes. If you own multiple shares, you get prize × share count.
          </p>
          <p className="text-xs text-[#eeb22d] mt-1.5 font-semibold">5¢ = <span className="text-[#6bcb69]">$1</span></p>
        </div>

        <div className="border-t border-white/[0.08] px-5 py-3">
          <p className="text-xs text-[#555] mb-2 uppercase">Main Prizes</p>
          <div>
            {MAIN_POT_RULES.map(r => (
              <PrizeRow key={r.id} id={r.id} label={r.label} payout={r.payout} detail={null} expanded={false} onToggle={() => {}} />
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.08] px-5 py-3">
          <p className="text-xs text-[#555] mb-0.5 uppercase">Bonus Prizes</p>
          <p className="text-[10px] text-[#444] mb-1 uppercase">1 winner (unless ties)</p>
          <div>
            {([
              ['Goals Scored (GS)',           20],
              ['Goals Conceded (Group Stage)', 20],
              ['Golden Boot',                  20],
              ['Golden Glove',                 20],
              ['Top European Team',            20],
              ['Top Americas Team (N+S)',       20],
              ['Top African Team',             25],
              ['Top Asian/Oceania Team',       25],
              ['Biggest Upset',               30],
              ['Earliest Goal',                10],
              ['Biggest Margin of Victory',    10],
              ['Biggest Margin of Defeat',     10],
              ['Worst Team',                   30],
              ['Most Red Cards',               20],
              ['Most Yellow Cards',            20],
              ['Most Own Goals',               20],
            ] as [string, number | null][]).map(([name, payout]) => (
              <PrizeRow key={name} id={name} label={name} payout={payout} detail={BONUS_PRIZE_DETAILS[name]} expanded={expanded === name} onToggle={() => toggle(name)} />
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.08] px-5 py-3">
          <p className="text-xs text-[#555] mb-0.5 uppercase">Bonus Prizes</p>
          <p className="text-[10px] text-[#444] mb-1 uppercase">per occurrence</p>
          <div>
            {([
              ['Hat Trick',            10],
              ['David In Attendance',  20],
            ] as [string, number | null][]).map(([name, payout]) => (
              <PrizeRow key={name} id={name} label={name} payout={payout} detail={BONUS_PRIZE_DETAILS[name]} expanded={expanded === name} onToggle={() => toggle(name)} />
            ))}
          </div>
        </div>

        </div>{/* end scrollable */}
        <div className="border-t border-white/[0.08] px-5 py-4 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-white/[0.12] text-sm font-bold text-white hover:bg-white/[0.05] transition-colors uppercase">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DraftPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(true)
  const [shares, setShares] = useState<Record<string, number>>({})
  const [openTeam, setOpenTeam] = useState<DraftTeam | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [betsOpen, setBetsOpen] = useState(false)
  const [instructionsVisible, setInstructionsVisible] = useState(true)
  const instructionsRef = useRef<HTMLDivElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Always show picker on mount
  useEffect(() => { setPickerOpen(true) }, [])

  useEffect(() => {
    const el = instructionsRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInstructionsVisible(entry.isIntersecting), { threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [loading])

  async function handlePlayerSelect(playerId: string) {
    setSelectedPlayer(playerId)
    setPickerOpen(false)
    setLoading(true)
    const [prior] = await Promise.all([
      loadDraftSubmission(playerId),
      new Promise(res => setTimeout(res, 1000)),
    ])
    if (prior) setShares(prior as typeof shares)
    setLoading(false)
  }

  function adjustShares(teamId: string, delta: number, maxShares: number) {
    setShares(prev => {
      const cur = prev[teamId] ?? 0
      const next = Math.max(0, Math.min(maxShares, cur + delta))
      if (next === 0) {
        const { [teamId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [teamId]: next }
    })
  }

  async function handleConfirmSubmit() {
    if (!selectedPlayer) return
    await saveDraftSubmission(selectedPlayer, shares)
    setConfirmOpen(false)
    setSubmitted(true)
  }

  const spent = useMemo(
    () => DRAFT_TEAMS.reduce((s, t) => s + (shares[t.id] ?? 0) * t.draft_value, 0),
    [shares]
  )
  const remaining = BUDGET - spent
  const teamCount = Object.values(shares).filter(n => n > 0).length
  const playerName = PLAYERS.find(p => p.id === selectedPlayer)?.name ?? ''
  const canSubmit = remaining >= 0 && !!selectedPlayer && !submitted && teamCount > 0

  // Animated budget counter
  const [displayRemaining, setDisplayRemaining] = useState(BUDGET)
  const displayRef = useRef(BUDGET)
  const [animDir, setAnimDir] = useState<1 | -1 | 0>(0)

  useEffect(() => {
    const target = remaining
    if (displayRef.current === target) { setAnimDir(0); return }
    const dir = target > displayRef.current ? 1 : -1
    setAnimDir(dir)
    const id = setInterval(() => {
      if (displayRef.current === target) { setAnimDir(0); clearInterval(id); return }
      displayRef.current += dir
      setDisplayRemaining(displayRef.current)
    }, 12)
    return () => clearInterval(id)
  }, [remaining])

  const budgetColor = animDir !== 0
    ? (animDir > 0 ? 'text-[#5eead4]' : 'text-[#fca5a5]')
    : (remaining < 0 ? 'text-[#ff4b4b]' : 'text-[#eeb22d]')

  if (submitted) return <SuccessScreen playerName={playerName} />

  return (
    <>
      {pickerOpen && <PlayerPicker onSelect={handlePlayerSelect} />}
      {confirmOpen && (
        <ConfirmModal
          shares={shares}
          remaining={remaining}
          onConfirm={handleConfirmSubmit}
          onEdit={() => setConfirmOpen(false)}
        />
      )}
      {openTeam && <DraftTeamPopup team={openTeam} onClose={() => setOpenTeam(null)} />}
      {betsOpen && <BetsPopup onClose={() => setBetsOpen(false)} />}

      {/* Top bar */}
      <header className="bg-[#18110D] border-b border-white/[0.08] sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/trophy.png" alt="trophy" className="w-6 h-6 object-contain" style={{ imageRendering: 'pixelated' }} />
            <span className="font-bold text-white text-lg">Quiniela Draft</span>
          </div>
          <button
            disabled={!canSubmit}
            onClick={() => setConfirmOpen(true)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors uppercase ${
              canSubmit
                ? 'bg-[#c9bba9] text-[#3d1f0a] hover:bg-[#c9bba9]/90'
                : 'bg-white/[0.06] text-[#555] cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        </div>
      </header>

      {/* Team table */}
      <div className="pt-4 pb-32">
        {loading && (
          <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
            <img src="/trophy.png" alt="trophy" className="w-48 h-48 object-contain" style={{ imageRendering: 'pixelated' }} />
            <p className="text-[#555] text-sm">Loading draft…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Player name + instructions — visible before scroll */}
            <div ref={instructionsRef} className="px-4 mb-4">
              {selectedPlayer && (
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-white uppercase">{playerName}</span>
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#555] bg-white/[0.05] hover:bg-white/[0.08] hover:text-[#888] transition-colors uppercase"
                  >
                    Change User
                  </button>
                </div>
              )}
              <p className="text-xs text-white/60 leading-relaxed">
                <span className="text-[#6bcb69]">$20</span> buy-in gives you <span className="text-[#eeb22d] font-semibold">100¢</span> to spend on teams · buy up to <span className="text-[#eeb22d] font-semibold">40¢</span> per team, multiple shares allowed · win money back when your teams earn prizes · press a team name for more info
              </p>
              <button
                onClick={() => setBetsOpen(true)}
                className="mt-2 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#3d1f0a] bg-[#c9bba9] hover:bg-[#c9bba9]/90 transition-colors uppercase"
              >
                See Prizes
              </button>
            </div>

            <div className="bg-[#18110D] border-y border-white/[0.08]">
              <table className="w-full text-sm">
                <thead className="sticky top-14 z-30 bg-[#c9bba9]">
                  <tr>
                    <th className="text-left px-2 py-2 text-[#3d1f0a] font-medium">Team</th>
                    <th className="text-right px-2 py-2 text-[#3d1f0a] font-medium">Price</th>
                    <th className="text-right px-2 py-2 text-[#3d1f0a] font-medium">Shares</th>
                  </tr>
                </thead>
                <tbody>
                  {SORTED_TEAMS.map(team => {
                    const maxShares = Math.floor(MAX_PER_TEAM / team.draft_value)
                    const cur = shares[team.id] ?? 0
                    const canInc = cur < maxShares
                    const canDec = cur > 0

                    return (
                      <tr key={team.id} className={`border-b border-white/[0.04] last:border-0 ${cur > 0 ? 'bg-[#c9bba9]/15' : ''}`}>
                        <td className="px-2 py-1.5 max-w-0 w-full">
                          <button
                            className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity w-full min-w-0"
                            onClick={() => setOpenTeam(team)}
                          >
                            <FlagImage code={team.code} name={team.name} size={28} outlined className="shrink-0" />
                            <span className={`font-medium truncate uppercase ${cur > 0 ? 'text-white' : 'text-white/50'}`}>{team.name}</span>
                          </button>
                        </td>
                        <td className="text-right px-2 py-1.5 text-[#eeb22d] font-bold text-base whitespace-nowrap">{team.draft_value}¢</td>
                        <td className="text-right px-2 py-1.5">
                          <div className="flex items-center justify-end gap-1.5">
                          <button
                            disabled={!canDec}
                            onClick={() => adjustShares(team.id, -1, maxShares)}
                            className={`w-7 h-7 rounded-lg text-base font-bold transition-colors flex items-center justify-center ${
                              canDec
                                ? 'bg-white/[0.08] text-white hover:bg-white/[0.14]'
                                : 'bg-white/[0.03] text-[#333] cursor-not-allowed'
                            }`}
                          >
                            −
                          </button>
                          <span className={`w-5 text-center font-bold ${cur > 0 ? 'text-white' : 'text-[#444]'}`}>
                            {cur}
                          </span>
                          <button
                            disabled={!canInc}
                            onClick={() => adjustShares(team.id, 1, maxShares)}
                            className={`w-7 h-7 rounded-lg text-base font-bold transition-colors flex items-center justify-center ${
                              canInc
                                ? 'bg-white/[0.08] text-white hover:bg-white/[0.14]'
                                : 'bg-white/[0.03] text-[#333] cursor-not-allowed'
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Submit button below table */}
          <div className="mt-10 flex flex-col items-center gap-2">
            <button
              disabled={!canSubmit}
              onClick={() => setConfirmOpen(true)}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-colors uppercase ${
                canSubmit
                  ? 'bg-[#c9bba9] text-[#3d1f0a] hover:bg-[#c9bba9]/90'
                  : 'bg-white/[0.06] text-[#555] cursor-not-allowed'
              }`}
            >
              Submit Draft
            </button>
            <p className="text-xs text-white/40">Resubmit anytime to make changes</p>
          </div>
          </>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#18110D] border-t border-white/[0.08]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center relative">
          <div>
            <p className={`text-3xl font-bold transition-colors duration-150 ${budgetColor}`}>
              {displayRemaining}¢
            </p>
            <p className="text-xs text-[#555] mt-0.5">Budget</p>
          </div>
          <div className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${instructionsVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button
              onClick={() => setBetsOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3d1f0a] bg-[#c9bba9] hover:bg-[#c9bba9]/90 transition-colors uppercase"
            >
              See Prizes
            </button>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{teamCount}</p>
            <p className="text-xs text-[#555] mt-0.5">Teams</p>
          </div>
        </div>
      </div>
    </>
  )
}
