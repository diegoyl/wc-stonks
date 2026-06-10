import type {
  Player,
  Team,
  Holding,
  ValueEvent,
  MainPotRule,
  SideBet,
  SideBetWinner,
  SideBetStanding,
} from '@/lib/types'
import { DRAFT_TEAMS } from '@/lib/data/teams'

// ─── Players ────────────────────────────────────────────────────────────────

export const PLAYERS: Player[] = [
  { id: 'player-marco', name: 'Andres',    slug: 'andres' },
  { id: 'player-sofia', name: 'Ana Paula', slug: 'ana-paula' },
  { id: 'player-lucas', name: 'Fabian',    slug: 'fabian' },
  { id: 'player-diego', name: 'Diego',     slug: 'diego' },
  { id: 'player-ana',   name: 'Mami',      slug: 'mami' },
  { id: 'player-raj',   name: 'Papi',      slug: 'papi' },
]

// ─── Teams ────────────────────────────────────────────────────────────────────
// Derived from static DRAFT_TEAMS; mock projected_additional applied to active teams.

const PROJ: Record<string, number> = {
  BRA: 20, FRA: 25, NOR: 15, BEL: 20,
  ARG: -4, ENG: -3, ESP: -20, NED: 5,
  URU: 5,  COL: 8,  POR: -4,
}

export const TEAMS: Team[] = DRAFT_TEAMS.map((t, i) => ({
  ...t,
  group_name: t.group_code[0],
  sort_order: i + 1,
  projected_additional: PROJ[t.id] ?? 0,
}))

// ─── Holdings ─────────────────────────────────────────────────────────────────
// Prices are much higher with real data; max 40¢ per team, 100¢ total.
//
// Diego:     ESP×1(40) + NOR×2(28) + JPN×2(24) + AUS×1(8)  = 100¢
// Andres:    BRA×1(36) + COL×2(24) + USA×4(40)             = 100¢
// Ana Paula: ARG×1(36) + NED×2(36) + MEX×2(20) + AUS×1(8) = 100¢
// Fabian:    ENG×1(36) + GER×1(22) + BEL×2(28) + CUW×7(14)= 100¢
// Mami:      FRA×1(40) + MAR×3(36) + SEN×2(20) + CPV×1(4) = 100¢
// Papi:      POR×1(26) + URU×3(36) + ECU×3(30) + AUS×1(8) = 100¢

export const HOLDINGS: Holding[] = [
  // Diego
  { id: 'h-diego-esp', player_id: 'player-diego', team_id: 'ESP', shares: 1 },
  { id: 'h-diego-nor', player_id: 'player-diego', team_id: 'NOR', shares: 2 },
  { id: 'h-diego-jpn', player_id: 'player-diego', team_id: 'JPN', shares: 2 },
  { id: 'h-diego-aus', player_id: 'player-diego', team_id: 'AUS', shares: 1 },
  // Andres
  { id: 'h-andres-bra', player_id: 'player-marco', team_id: 'BRA', shares: 1 },
  { id: 'h-andres-col', player_id: 'player-marco', team_id: 'COL', shares: 2 },
  { id: 'h-andres-usa', player_id: 'player-marco', team_id: 'USA', shares: 4 },
  // Ana Paula
  { id: 'h-anapaula-arg', player_id: 'player-sofia', team_id: 'ARG', shares: 1 },
  { id: 'h-anapaula-ned', player_id: 'player-sofia', team_id: 'NED', shares: 2 },
  { id: 'h-anapaula-mex', player_id: 'player-sofia', team_id: 'MEX', shares: 2 },
  { id: 'h-anapaula-aus', player_id: 'player-sofia', team_id: 'AUS', shares: 1 },
  // Fabian
  { id: 'h-fabian-eng', player_id: 'player-lucas', team_id: 'ENG', shares: 1 },
  { id: 'h-fabian-ger', player_id: 'player-lucas', team_id: 'GER', shares: 1 },
  { id: 'h-fabian-bel', player_id: 'player-lucas', team_id: 'BEL', shares: 2 },
  { id: 'h-fabian-cuw', player_id: 'player-lucas', team_id: 'CUW', shares: 7 },
  // Mami
  { id: 'h-mami-fra', player_id: 'player-ana', team_id: 'FRA', shares: 1 },
  { id: 'h-mami-mar', player_id: 'player-ana', team_id: 'MAR', shares: 3 },
  { id: 'h-mami-sen', player_id: 'player-ana', team_id: 'SEN', shares: 2 },
  { id: 'h-mami-cpv', player_id: 'player-ana', team_id: 'CPV', shares: 1 },
  // Papi
  { id: 'h-papi-por', player_id: 'player-raj', team_id: 'POR', shares: 1 },
  { id: 'h-papi-uru', player_id: 'player-raj', team_id: 'URU', shares: 3 },
  { id: 'h-papi-ecu', player_id: 'player-raj', team_id: 'ECU', shares: 3 },
  { id: 'h-papi-aus', player_id: 'player-raj', team_id: 'AUS', shares: 1 },
]

// ─── Main pot rules ──────────────────────────────────────────────────────────

export const MAIN_POT_RULES: MainPotRule[] = [
  { id: 'rule-gw',    rule_key: 'group_win',    label: 'Group Stage Win',      payout:   3, sort_order: 1 },
  { id: 'rule-gd',    rule_key: 'group_draw',   label: 'Group Stage Draw',     payout:   1, sort_order: 2 },
  { id: 'rule-ga',    rule_key: 'group_advance',label: 'Advance from Group Stage',  payout:   3, sort_order: 3 },
  { id: 'rule-r32',   rule_key: 'r32',          label: 'Win Round of 32',      payout:   6, sort_order: 4 },
  { id: 'rule-r16',   rule_key: 'r16',          label: 'Win Round of 16',      payout:  12, sort_order: 5 },
  { id: 'rule-qf',    rule_key: 'qf',           label: 'Win Quarterfinal',     payout:  24, sort_order: 6 },
  { id: 'rule-sf',    rule_key: 'sf',           label: 'Win Semifinal',        payout:  50, sort_order: 7 },
  { id: 'rule-3rd',   rule_key: 'third_place',  label: 'Win 3rd Place Match',  payout:  15, sort_order: 8 },
  { id: 'rule-final', rule_key: 'final_win',    label: 'Win Final',        payout: 100, sort_order: 9 },
]

// ─── Side bets ───────────────────────────────────────────────────────────────

export const SIDE_BETS: SideBet[] = [
  {
    id: 'sb-1',
    name: 'Most group-stage goals',
    description: 'Team with the most goals scored in the group stage.',
    payout: 20,
    status: 'settled',
    data_tier: 'api',
    sort_order: 1,
  },
  {
    id: 'sb-2',
    name: 'Most yellow cards',
    description: 'Team with the most yellow cards across the entire tournament.',
    payout: 10,
    status: 'settled',
    data_tier: 'api',
    sort_order: 2,
  },
  {
    id: 'sb-3',
    name: 'Most tournament goals',
    description: 'Team with the most goals scored across the entire tournament.',
    payout: 30,
    status: 'open',
    data_tier: 'api',
    sort_order: 3,
  },
  {
    id: 'sb-4',
    name: 'Top CONCACAF team',
    description: 'Best finishing CONCACAF team (USA, Mexico, Canada, etc.).',
    payout: 15,
    status: 'open',
    data_tier: 'manual',
    sort_order: 4,
  },
]

export const SIDE_BET_WINNERS: SideBetWinner[] = [
  // sb-1: Most group-stage goals — ESP wins outright
  { id: 'sbw-1', side_bet_id: 'sb-1', team_id: 'ESP', payout_amount: 20 },
  // sb-2: Most yellow cards — ARG and ENG tied, split 5¢ each
  { id: 'sbw-2', side_bet_id: 'sb-2', team_id: 'ARG', payout_amount: 5 },
  { id: 'sbw-3', side_bet_id: 'sb-2', team_id: 'ENG', payout_amount: 5 },
]

export const SIDE_BET_STANDINGS: SideBetStanding[] = [
  // sb-3: Most tournament goals (open) — BRA leads, FRA and ESP tied at rank 2
  { id: 'sbs-1', side_bet_id: 'sb-3', team_id: 'BRA', rank: 1, metric_value: '12 goals', metric_numeric: 12, updated_at: '2026-07-10T00:00:00Z' },
  { id: 'sbs-2', side_bet_id: 'sb-3', team_id: 'FRA', rank: 2, metric_value: '10 goals', metric_numeric: 10, updated_at: '2026-07-10T00:00:00Z' },
  { id: 'sbs-3', side_bet_id: 'sb-3', team_id: 'ESP', rank: 2, metric_value: '10 goals', metric_numeric: 10, updated_at: '2026-07-10T00:00:00Z' },
  { id: 'sbs-4', side_bet_id: 'sb-3', team_id: 'ARG', rank: 4, metric_value: '7 goals',  metric_numeric: 7,  updated_at: '2026-07-10T00:00:00Z' },
  { id: 'sbs-5', side_bet_id: 'sb-3', team_id: 'NED', rank: 5, metric_value: '6 goals',  metric_numeric: 6,  updated_at: '2026-07-10T00:00:00Z' },
  // sb-4: Top CONCACAF team (open)
  { id: 'sbs-6', side_bet_id: 'sb-4', team_id: 'USA', rank: 1, metric_value: 'R32 (eliminated)', metric_numeric: 2, updated_at: '2026-07-10T00:00:00Z' },
  { id: 'sbs-7', side_bet_id: 'sb-4', team_id: 'MEX', rank: 2, metric_value: 'Group stage (eliminated)', metric_numeric: 1, updated_at: '2026-07-10T00:00:00Z' },
]

// ─── Value events ──────────────────────────────────────────────────────────────
// Tournament state: Group stage complete, R32 complete, R16 complete.
// QF upcoming. BRA, FRA, ESP, NED, BEL still alive.
//
// Team current values (¢):
//   ESP 50 | FRA 28 | NED 28 | BEL 28 | BRA 30 | NOR 18
//   ARG 21 | ENG 19 | URU 16 | ECU 15 | POR 15 | GER 13
//   JPN  9 | AUS  7 | USA  7 | COL  4 | MEX  4 | SEN  3
//   MAR  1 | CPV  1 | CUW  0

let _eid = 0
function eid() { return `ve-${++_eid}` }

export const VALUE_EVENTS: ValueEvent[] = [
  // ── BRA: W/W/W in groups → r32 win → r16 win ────────────────────────────
  { id: eid(), team_id: 'BRA', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-bra-g1', effective_at: '2026-06-12T20:00:00Z', created_at: '2026-06-12T22:00:00Z' },
  { id: eid(), team_id: 'BRA', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-bra-g2', effective_at: '2026-06-16T20:00:00Z', created_at: '2026-06-16T22:00:00Z' },
  { id: eid(), team_id: 'BRA', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-bra-g3', effective_at: '2026-06-20T20:00:00Z', created_at: '2026-06-20T22:00:00Z' },
  { id: eid(), team_id: 'BRA', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-25T00:00:00Z', created_at: '2026-06-25T06:00:00Z' },
  { id: eid(), team_id: 'BRA', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-29T20:00:00Z', created_at: '2026-06-29T22:00:00Z' },
  { id: eid(), team_id: 'BRA', amount: 12, source: 'main_pot', main_pot_rule_id: 'rule-r16', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-06T20:00:00Z', created_at: '2026-07-06T22:00:00Z' },

  // ── FRA: W/W/D in groups → r32 win → r16 win ────────────────────────────
  { id: eid(), team_id: 'FRA', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-fra-g1', effective_at: '2026-06-12T17:00:00Z', created_at: '2026-06-12T19:00:00Z' },
  { id: eid(), team_id: 'FRA', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-fra-g2', effective_at: '2026-06-17T17:00:00Z', created_at: '2026-06-17T19:00:00Z' },
  { id: eid(), team_id: 'FRA', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-fra-g3', effective_at: '2026-06-21T17:00:00Z', created_at: '2026-06-21T19:00:00Z' },
  { id: eid(), team_id: 'FRA', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-25T00:00:00Z', created_at: '2026-06-25T06:00:00Z' },
  { id: eid(), team_id: 'FRA', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-28T17:00:00Z', created_at: '2026-06-28T19:00:00Z' },
  { id: eid(), team_id: 'FRA', amount: 12, source: 'main_pot', main_pot_rule_id: 'rule-r16', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-07T17:00:00Z', created_at: '2026-07-07T19:00:00Z' },

  // ── ARG: W/W/D in groups → r32 win → out at r16 ─────────────────────────
  { id: eid(), team_id: 'ARG', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-arg-g1', effective_at: '2026-06-13T17:00:00Z', created_at: '2026-06-13T19:00:00Z' },
  { id: eid(), team_id: 'ARG', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-arg-g2', effective_at: '2026-06-17T14:00:00Z', created_at: '2026-06-17T16:00:00Z' },
  { id: eid(), team_id: 'ARG', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-arg-g3', effective_at: '2026-06-22T14:00:00Z', created_at: '2026-06-22T16:00:00Z' },
  { id: eid(), team_id: 'ARG', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-25T00:00:00Z', created_at: '2026-06-25T06:00:00Z' },
  { id: eid(), team_id: 'ARG', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-28T14:00:00Z', created_at: '2026-06-28T16:00:00Z' },
  // side_bet: Most yellow cards split
  { id: eid(), team_id: 'ARG', amount: 5, source: 'side_bet', main_pot_rule_id: null, side_bet_id: 'sb-2', source_fixture_id: null, effective_at: '2026-07-10T00:00:00Z', created_at: '2026-07-10T00:00:00Z' },

  // ── ENG: W/D/D in groups → r32 win → out at r16 ─────────────────────────
  { id: eid(), team_id: 'ENG', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-eng-g1', effective_at: '2026-06-14T14:00:00Z', created_at: '2026-06-14T16:00:00Z' },
  { id: eid(), team_id: 'ENG', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-eng-g2', effective_at: '2026-06-18T14:00:00Z', created_at: '2026-06-18T16:00:00Z' },
  { id: eid(), team_id: 'ENG', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-eng-g3', effective_at: '2026-06-22T17:00:00Z', created_at: '2026-06-22T19:00:00Z' },
  { id: eid(), team_id: 'ENG', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-25T00:00:00Z', created_at: '2026-06-25T06:00:00Z' },
  { id: eid(), team_id: 'ENG', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-30T14:00:00Z', created_at: '2026-06-30T16:00:00Z' },
  // side_bet: Most yellow cards split
  { id: eid(), team_id: 'ENG', amount: 5, source: 'side_bet', main_pot_rule_id: null, side_bet_id: 'sb-2', source_fixture_id: null, effective_at: '2026-07-10T00:00:00Z', created_at: '2026-07-10T00:00:00Z' },

  // ── ESP: W/W/W in groups → r32 win → r16 win ────────────────────────────
  { id: eid(), team_id: 'ESP', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-esp-g1', effective_at: '2026-06-13T20:00:00Z', created_at: '2026-06-13T22:00:00Z' },
  { id: eid(), team_id: 'ESP', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-esp-g2', effective_at: '2026-06-18T17:00:00Z', created_at: '2026-06-18T19:00:00Z' },
  { id: eid(), team_id: 'ESP', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-esp-g3', effective_at: '2026-06-23T17:00:00Z', created_at: '2026-06-23T19:00:00Z' },
  { id: eid(), team_id: 'ESP', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-25T00:00:00Z', created_at: '2026-06-25T06:00:00Z' },
  { id: eid(), team_id: 'ESP', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-29T17:00:00Z', created_at: '2026-06-29T19:00:00Z' },
  { id: eid(), team_id: 'ESP', amount: 12, source: 'main_pot', main_pot_rule_id: 'rule-r16', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-08T17:00:00Z', created_at: '2026-07-08T19:00:00Z' },
  // side_bet: Most group-stage goals
  { id: eid(), team_id: 'ESP', amount: 20, source: 'side_bet', main_pot_rule_id: null, side_bet_id: 'sb-1', source_fixture_id: null, effective_at: '2026-07-10T00:00:00Z', created_at: '2026-07-10T00:00:00Z' },

  // ── GER: W/D/L in groups → r32 win → out at r16 ─────────────────────────
  { id: eid(), team_id: 'GER', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-ger-g1', effective_at: '2026-06-15T14:00:00Z', created_at: '2026-06-15T16:00:00Z' },
  { id: eid(), team_id: 'GER', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-ger-g2', effective_at: '2026-06-19T14:00:00Z', created_at: '2026-06-19T16:00:00Z' },
  { id: eid(), team_id: 'GER', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-25T00:00:00Z', created_at: '2026-06-25T06:00:00Z' },
  { id: eid(), team_id: 'GER', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-01T14:00:00Z', created_at: '2026-07-01T16:00:00Z' },

  // ── POR: W/W/L in groups → r32 win → out at r16 ─────────────────────────
  { id: eid(), team_id: 'POR', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-por-g1', effective_at: '2026-06-14T20:00:00Z', created_at: '2026-06-14T22:00:00Z' },
  { id: eid(), team_id: 'POR', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-por-g2', effective_at: '2026-06-19T20:00:00Z', created_at: '2026-06-19T22:00:00Z' },
  { id: eid(), team_id: 'POR', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-25T00:00:00Z', created_at: '2026-06-25T06:00:00Z' },
  { id: eid(), team_id: 'POR', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-02T14:00:00Z', created_at: '2026-07-02T16:00:00Z' },

  // ── NED: W/W/D in groups → r32 win → r16 win ────────────────────────────
  { id: eid(), team_id: 'NED', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-ned-g1', effective_at: '2026-06-15T17:00:00Z', created_at: '2026-06-15T19:00:00Z' },
  { id: eid(), team_id: 'NED', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-ned-g2', effective_at: '2026-06-20T17:00:00Z', created_at: '2026-06-20T19:00:00Z' },
  { id: eid(), team_id: 'NED', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-ned-g3', effective_at: '2026-06-23T14:00:00Z', created_at: '2026-06-23T16:00:00Z' },
  { id: eid(), team_id: 'NED', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-25T00:00:00Z', created_at: '2026-06-25T06:00:00Z' },
  { id: eid(), team_id: 'NED', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-01T17:00:00Z', created_at: '2026-07-01T19:00:00Z' },
  { id: eid(), team_id: 'NED', amount: 12, source: 'main_pot', main_pot_rule_id: 'rule-r16', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-09T17:00:00Z', created_at: '2026-07-09T19:00:00Z' },

  // ── USA: W/D/L in groups → out at r32 ───────────────────────────────────
  { id: eid(), team_id: 'USA', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-usa-g1', effective_at: '2026-06-13T14:00:00Z', created_at: '2026-06-13T16:00:00Z' },
  { id: eid(), team_id: 'USA', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-usa-g2', effective_at: '2026-06-18T20:00:00Z', created_at: '2026-06-18T22:00:00Z' },
  { id: eid(), team_id: 'USA', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-25T00:00:00Z', created_at: '2026-06-25T06:00:00Z' },

  // ── MEX: W/D/L in groups → did not advance ───────────────────────────────
  { id: eid(), team_id: 'MEX', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-mex-g1', effective_at: '2026-06-15T20:00:00Z', created_at: '2026-06-15T22:00:00Z' },
  { id: eid(), team_id: 'MEX', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-mex-g2', effective_at: '2026-06-19T17:00:00Z', created_at: '2026-06-19T19:00:00Z' },

  // ── MAR: D/L/L in groups → did not advance ──────────────────────────────
  { id: eid(), team_id: 'MAR', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-mar-g1', effective_at: '2026-06-12T14:00:00Z', created_at: '2026-06-12T16:00:00Z' },

  // ── JPN: W/W/L in groups → out at r32 ───────────────────────────────────
  { id: eid(), team_id: 'JPN', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-jpn-g1', effective_at: '2026-06-14T17:00:00Z', created_at: '2026-06-14T19:00:00Z' },
  { id: eid(), team_id: 'JPN', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-jpn-g2', effective_at: '2026-06-20T14:00:00Z', created_at: '2026-06-20T16:00:00Z' },
  { id: eid(), team_id: 'JPN', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-25T00:00:00Z', created_at: '2026-06-25T06:00:00Z' },

  // ── SEN: W/L/L in groups → did not advance ──────────────────────────────
  { id: eid(), team_id: 'SEN', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-sen-g1', effective_at: '2026-06-14T14:00:00Z', created_at: '2026-06-14T16:00:00Z' },

  // ── COL: W/D/L in groups → did not advance ──────────────────────────────
  { id: eid(), team_id: 'COL', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-col-g1', effective_at: '2026-06-12T17:00:00Z', created_at: '2026-06-12T19:00:00Z' },
  { id: eid(), team_id: 'COL', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-col-g2', effective_at: '2026-06-16T17:00:00Z', created_at: '2026-06-16T19:00:00Z' },

  // ── NOR: W/W/W in groups → r32 win → out at r16 ─────────────────────────
  { id: eid(), team_id: 'NOR', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-nor-g1', effective_at: '2026-06-13T17:00:00Z', created_at: '2026-06-13T19:00:00Z' },
  { id: eid(), team_id: 'NOR', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-nor-g2', effective_at: '2026-06-18T17:00:00Z', created_at: '2026-06-18T19:00:00Z' },
  { id: eid(), team_id: 'NOR', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-nor-g3', effective_at: '2026-06-22T17:00:00Z', created_at: '2026-06-22T19:00:00Z' },
  { id: eid(), team_id: 'NOR', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-26T00:00:00Z', created_at: '2026-06-26T06:00:00Z' },
  { id: eid(), team_id: 'NOR', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-02T17:00:00Z', created_at: '2026-07-02T19:00:00Z' },

  // ── BEL: W/W/D in groups → r32 win → r16 win ────────────────────────────
  { id: eid(), team_id: 'BEL', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-bel-g1', effective_at: '2026-06-14T17:00:00Z', created_at: '2026-06-14T19:00:00Z' },
  { id: eid(), team_id: 'BEL', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-bel-g2', effective_at: '2026-06-19T17:00:00Z', created_at: '2026-06-19T19:00:00Z' },
  { id: eid(), team_id: 'BEL', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-bel-g3', effective_at: '2026-06-23T17:00:00Z', created_at: '2026-06-23T19:00:00Z' },
  { id: eid(), team_id: 'BEL', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-26T00:00:00Z', created_at: '2026-06-26T06:00:00Z' },
  { id: eid(), team_id: 'BEL', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-03T17:00:00Z', created_at: '2026-07-03T19:00:00Z' },
  { id: eid(), team_id: 'BEL', amount: 12, source: 'main_pot', main_pot_rule_id: 'rule-r16', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-09T14:00:00Z', created_at: '2026-07-09T16:00:00Z' },

  // ── AUS: W/D/L in groups → out at r32 ───────────────────────────────────
  { id: eid(), team_id: 'AUS', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-aus-g1', effective_at: '2026-06-15T14:00:00Z', created_at: '2026-06-15T16:00:00Z' },
  { id: eid(), team_id: 'AUS', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-aus-g2', effective_at: '2026-06-19T14:00:00Z', created_at: '2026-06-19T16:00:00Z' },
  { id: eid(), team_id: 'AUS', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-26T00:00:00Z', created_at: '2026-06-26T06:00:00Z' },

  // ── URU: W/W/D in groups → r32 win → out at r16 ─────────────────────────
  { id: eid(), team_id: 'URU', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-uru-g1', effective_at: '2026-06-14T20:00:00Z', created_at: '2026-06-14T22:00:00Z' },
  { id: eid(), team_id: 'URU', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-uru-g2', effective_at: '2026-06-18T20:00:00Z', created_at: '2026-06-18T22:00:00Z' },
  { id: eid(), team_id: 'URU', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-uru-g3', effective_at: '2026-06-22T20:00:00Z', created_at: '2026-06-22T22:00:00Z' },
  { id: eid(), team_id: 'URU', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-26T00:00:00Z', created_at: '2026-06-26T06:00:00Z' },
  { id: eid(), team_id: 'URU', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-01T20:00:00Z', created_at: '2026-07-01T22:00:00Z' },

  // ── ECU: W/W/D in groups → r32 win → out at r16 ─────────────────────────
  { id: eid(), team_id: 'ECU', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-ecu-g1', effective_at: '2026-06-13T14:00:00Z', created_at: '2026-06-13T16:00:00Z' },
  { id: eid(), team_id: 'ECU', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-gw', side_bet_id: null, source_fixture_id: 'fix-ecu-g2', effective_at: '2026-06-17T14:00:00Z', created_at: '2026-06-17T16:00:00Z' },
  { id: eid(), team_id: 'ECU', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-ecu-g3', effective_at: '2026-06-21T14:00:00Z', created_at: '2026-06-21T16:00:00Z' },
  { id: eid(), team_id: 'ECU', amount: 3, source: 'main_pot', main_pot_rule_id: 'rule-ga', side_bet_id: null, source_fixture_id: null, effective_at: '2026-06-26T00:00:00Z', created_at: '2026-06-26T06:00:00Z' },
  { id: eid(), team_id: 'ECU', amount: 6, source: 'main_pot', main_pot_rule_id: 'rule-r32', side_bet_id: null, source_fixture_id: null, effective_at: '2026-07-02T14:00:00Z', created_at: '2026-07-02T16:00:00Z' },

  // ── CPV: D/L/L in groups → did not advance ──────────────────────────────
  { id: eid(), team_id: 'CPV', amount: 1, source: 'main_pot', main_pot_rule_id: 'rule-gd', side_bet_id: null, source_fixture_id: 'fix-cpv-g1', effective_at: '2026-06-15T17:00:00Z', created_at: '2026-06-15T19:00:00Z' },

  // ── CUW: 0 events (L/L/L in groups) ─────────────────────────────────────
]
