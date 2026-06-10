// ─── Core entities (mirror DATA_STRUCTURE.md) ───────────────────────────────

export interface Player {
  id: number
  name: string
  slug: string
}

export interface Team {
  id: string
  name: string
  code: string // FIFA 3-letter, e.g. "BRA" — maps to /flags/BRA.png
  group_code: string   // e.g. "C1" — group letter + position within group
  group_name: string | null // derived: group_code[0]
  fifa_rank: number
  draft_value: number // ¢ per share
  sort_order: number
  projected_additional: number // ¢ per share expected from remaining tournament rounds; 0 if eliminated
}

export interface Holding {
  id: string
  player_id: number
  team_id: string
  shares: number
}

export type ValueEventSource = 'main_pot' | 'side_bet'

export interface ValueEvent {
  id: string
  team_id: string
  amount: number // ¢, may be negative for corrections
  source: ValueEventSource
  main_pot_rule_id: string | null
  side_bet_id: string | null
  source_fixture_id: string | null // for group-stage per-match idempotency
  effective_at: string // ISO datetime
  created_at: string
}

export interface MainPotRule {
  id: string
  rule_key: MainPotRuleKey
  label: string
  payout: number // ¢ per team
  sort_order: number
}

export type MainPotRuleKey =
  | 'group_win'
  | 'group_draw'
  | 'group_advance'
  | 'r32'
  | 'r16'
  | 'qf'
  | 'sf'
  | 'third_place'
  | 'final_win'

export type SideBetStatus = 'open' | 'settled'
export type SideBetDataTier = 'api' | 'manual'

export interface SideBet {
  id: string
  name: string
  description: string | null
  payout: number // ¢ total
  status: SideBetStatus
  data_tier: SideBetDataTier
  sort_order: number
}

export interface SideBetWinner {
  id: string
  side_bet_id: string
  team_id: string
  payout_amount: number
}

export interface SideBetStanding {
  id: string
  side_bet_id: string
  team_id: string
  rank: number
  metric_value: string // display string, e.g. "7 goals"
  metric_numeric: number | null
  updated_at: string
}

export interface AppSetting {
  key: string
  value: unknown
}

// ─── Computed / view types ───────────────────────────────────────────────────

export interface TeamWithValue extends Team {
  current_value: number
  projected_value: number // current_value + projected_additional
}

export interface HoldingRow {
  holding: Holding
  team: TeamWithValue
  total_value: number // shares × team.current_value
}

export interface LeaderboardEntry {
  player: Player
  current_value: number
  projected_value: number
  rank: number
}

export interface ValueSnapshot {
  date: string // YYYY-MM-DD
  cumulative: number
}
