import {
  PLAYERS,
  TEAMS,
  HOLDINGS,
  VALUE_EVENTS,
  MAIN_POT_RULES,
  SIDE_BETS,
  SIDE_BET_WINNERS,
  SIDE_BET_STANDINGS,
} from './data'
import {
  teamCurrentValue,
  playerCurrentValue,
  leaderboard,
  teamValueOverTime,
  portfolioRows,
  portfolioValueOverTime,
} from '@/lib/compute'
import type {
  Player,
  Team,
  TeamWithValue,
  HoldingRow,
  LeaderboardEntry,
  ValueSnapshot,
  SideBet,
  SideBetWinner,
  SideBetStanding,
  MainPotRule,
  ValueEvent,
} from '@/lib/types'

// ─── Raw getters ─────────────────────────────────────────────────────────────

export function getPlayers(): Player[] { return PLAYERS }
export function getTeams(): Team[] { return TEAMS }
export function getMainPotRules(): MainPotRule[] { return MAIN_POT_RULES }
export function getValueEvents(): ValueEvent[] { return VALUE_EVENTS }
export function getSideBets(): SideBet[] { return SIDE_BETS }
export function getSideBetWinners(): SideBetWinner[] { return SIDE_BET_WINNERS }
export function getSideBetStandings(): SideBetStanding[] { return SIDE_BET_STANDINGS }

// ─── Computed getters ────────────────────────────────────────────────────────

function teamValues(): Map<string, number> {
  const events = getValueEvents()
  return new Map(TEAMS.map(t => [t.id, teamCurrentValue(t.id, events)]))
}

function teamProjectedValues(): Map<string, number> {
  const events = getValueEvents()
  return new Map(TEAMS.map(t => [t.id, teamCurrentValue(t.id, events) + t.projected_additional]))
}

export function getTeamsWithValue(): TeamWithValue[] {
  const current = teamValues()
  const projected = teamProjectedValues()
  return TEAMS.map(t => ({
    ...t,
    current_value: current.get(t.id) ?? 0,
    projected_value: projected.get(t.id) ?? 0,
  }))
}

export function getLeaderboard(): LeaderboardEntry[] {
  return leaderboard(PLAYERS, HOLDINGS, teamValues(), teamProjectedValues())
}

export function getPortfolioRows(playerId: string): HoldingRow[] {
  const holdings = HOLDINGS.filter(h => h.player_id === playerId)
  return portfolioRows(holdings, getTeamsWithValue())
}

export function getValueHistory(teamId: string): ValueSnapshot[] {
  const team = TEAMS.find(t => t.id === teamId)
  return teamValueOverTime(teamId, getValueEvents(), team?.draft_value ?? 0)
}

export function getPortfolioHistory(playerId: string): ValueSnapshot[] {
  return portfolioValueOverTime(playerId, HOLDINGS, getValueEvents())
}

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find(p => p.id === id)
}

export function getPlayerBySlug(slug: string): Player | undefined {
  return PLAYERS.find(p => p.slug === slug)
}

export function getTeamById(id: string): TeamWithValue | undefined {
  return getTeamsWithValue().find(t => t.id === id)
}

export function getSideBetWinnersForBet(sideBetId: string): SideBetWinner[] {
  return SIDE_BET_WINNERS.filter(w => w.side_bet_id === sideBetId)
}

export function getSideBetStandingsForBet(sideBetId: string): SideBetStanding[] {
  return SIDE_BET_STANDINGS
    .filter(s => s.side_bet_id === sideBetId)
    .sort((a, b) => a.rank - b.rank)
}
