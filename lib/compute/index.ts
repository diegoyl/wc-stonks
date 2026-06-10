import type {
  Holding,
  ValueEvent,
  Player,
  TeamWithValue,
  HoldingRow,
  LeaderboardEntry,
  ValueSnapshot,
} from '@/lib/types'

export function teamCurrentValue(teamId: string, events: ValueEvent[]): number {
  return events
    .filter(e => e.team_id === teamId)
    .reduce((sum, e) => sum + e.amount, 0)
}

export function playerCurrentValue(
  playerId: string,
  holdings: Holding[],
  teamValues: Map<string, number>,
): number {
  return holdings
    .filter(h => h.player_id === playerId)
    .reduce((sum, h) => sum + h.shares * (teamValues.get(h.team_id) ?? 0), 0)
}

export function leaderboard(
  players: Player[],
  holdings: Holding[],
  teamValues: Map<string, number>,
  teamProjectedValues: Map<string, number>,
): LeaderboardEntry[] {
  const entries = players.map(p => ({
    player: p,
    current_value: playerCurrentValue(p.id, holdings, teamValues),
    projected_value: playerCurrentValue(p.id, holdings, teamProjectedValues),
    rank: 0,
  }))
  entries.sort((a, b) => b.current_value - a.current_value)

  let rank = 1
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].current_value < entries[i - 1].current_value) rank = i + 1
    entries[i].rank = rank
  }
  return entries
}

export function teamValueOverTime(teamId: string, events: ValueEvent[], draftValue = 0): ValueSnapshot[] {
  const teamEvents = events
    .filter(e => e.team_id === teamId)
    .sort((a, b) => a.effective_at.localeCompare(b.effective_at))

  const byDate = new Map<string, number>()
  for (const e of teamEvents) {
    const date = e.effective_at.slice(0, 10)
    byDate.set(date, (byDate.get(date) ?? 0) + e.amount)
  }

  const snapshots: ValueSnapshot[] = [{ date: '2026-06-11', cumulative: draftValue }]
  let cumulative = draftValue
  for (const [date, delta] of [...byDate.entries()].sort()) {
    cumulative += delta
    snapshots.push({ date, cumulative })
  }
  return snapshots
}

export function portfolioValueOverTime(
  playerId: string,
  holdings: Holding[],
  events: ValueEvent[],
): ValueSnapshot[] {
  const playerHoldings = holdings.filter(h => h.player_id === playerId)
  const teamIds = new Set(playerHoldings.map(h => h.team_id))
  const dates = [...new Set(
    events.filter(e => teamIds.has(e.team_id)).map(e => e.effective_at.slice(0, 10))
  )].sort()

  return [
    { date: '2026-06-11', cumulative: 100 },
    ...dates.map(date => {
      const eventsUpTo = events.filter(e => e.effective_at.slice(0, 10) <= date)
      const tvMap = new Map<string, number>()
      for (const tid of teamIds) tvMap.set(tid, teamCurrentValue(tid, eventsUpTo))
      return { date, cumulative: playerCurrentValue(playerId, playerHoldings, tvMap) }
    }),
  ]
}

export function portfolioRows(holdings: Holding[], teams: TeamWithValue[]): HoldingRow[] {
  const teamMap = new Map(teams.map(t => [t.id, t]))
  return holdings.map(h => {
    const team = teamMap.get(h.team_id)!
    return {
      holding: h,
      team,
      total_value: h.shares * team.current_value,
    }
  }).sort((a, b) => b.total_value - a.total_value)
}
