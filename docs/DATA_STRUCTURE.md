# Data Structure Proposal

> Draft schema for discussion. Not final — use this as a base for refinements before implementation.

## Design principles

1. **Value accrues to teams** — players derive value from portfolio holdings, not direct point awards.
2. **Immutable ledger** — every change to team current value is an append-only row. Current value = sum of ledger entries. Enables history charts and audit trail.
3. **Draft is separate from scoring** — draft prices and share counts are setup data; they do not flow into the ledger.
4. **Projected value is computed in app** — optional cache table later if projection model gets heavy (see Projections).
5. **Single pool** — one tournament, one set of rules.
6. **Bracket progression is implicit** — we don't store elimination stage on `teams`. A team advancing is recorded as new `value_events` rows when admin (or FIFA sync) awards main-pot value.

## Entity overview

```
players ──┬── holdings ────────── teams
          │
teams ────┼── value_events ──────┬── main_pot_rules
          │   │                  └── side_bets ──┬── side_bet_standings
          │   │                                  └── side_bet_winners
          │   └── team_value_snapshots (materialized chart history)
          │
          └── (FIFA data — see FIFA_DATA.md; not part of contest ledger)
```

## Tables

### `players`

People in the pool.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | text | Display name |
| `slug` | text | URL-safe; derive from name (spaces → dashes) |

---

### `teams`

World Cup teams in the pool.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | text | e.g. "France" |
| `code` | text | FIFA code, e.g. "FRA" — flags + FIFA data joins |
| `group_name` | text | Optional, e.g. "D" |
| `draft_value` | integer | Price per share in ¢ |
| `sort_order` | integer | Display ordering |

No `eliminated_at` — elimination is not contest state we need to persist. Main-pot payouts are appended to `value_events` when a team earns them; whether a team is still alive is derivable from FIFA data (see [FIFA_DATA.md](./FIFA_DATA.md)) or from which main-pot rules have already been paid out.

**Computed (not stored):**

- `current_value` = SUM(`value_events.amount`) for this team
- `projected_value` = computed in app (optional cache — see Projections)

---

### `holdings`

A player's **portfolio**. One row per (player, team) pair that they own shares in.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `player_id` | uuid | FK → players |
| `team_id` | uuid | FK → teams |
| `shares` | integer | Whole shares only |
| `updated_at` | timestamptz | Optional; useful if admin edits holdings |

**How multiple teams work:** not an array — one row per team owned. A player with France (2 shares), Japan (3 shares), and USA (1 share) has **3 rows** in `holdings`.

Example:

| player | team | shares |
|--------|------|--------|
| Diego | FRA | 2 |
| Diego | JPN | 3 |
| Diego | USA | 1 |

**Constraints (application or DB):**

- UNIQUE (`player_id`, `team_id`)
- `shares` > 0 (integer only)
- Per player: SUM(`shares` × team.draft_value) = 100 (if draft enforced in app)
- Per player per team: `shares` × team.draft_value ≤ 40

**Computed for a holding:**

- `team_value` = team.current_value (value of one share)
- `total_value` = team.current_value × shares

---

### `value_events`

Append-only ledger of value changes for teams. Source of truth for **current value**.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `team_id` | uuid | FK → teams |
| `amount` | integer | ¢ awarded (always positive; no corrections in v1) |
| `source` | text | `main_pot` \| `side_bet` |
| `main_pot_rule_id` | uuid | Nullable FK → main_pot_rules; set when source = main_pot |
| `side_bet_id` | uuid | Nullable FK → side_bets; set when source = side_bet |
| `source_fixture_id` | text | Nullable; for group-stage per-match events that share the same rule (e.g. multiple `group_win` rows for one team) |
| `effective_at` | timestamptz | When value counts for charts (defaults to created_at) |
| `created_at` | timestamptz | |

No `reason` or `rule_key` — `source` + FK to `main_pot_rules` or `side_bets` is enough to interpret a row.

**Main pot:** one bracket event → **one row per team** that earned value (references the applicable `main_pot_rule_id`).

**Side bets:** on settlement, **one row per winning team** with that team's split of the payout (see `side_bet_winners`).

**Idempotency keys:**

- Group-stage per-match events: `(team_id, main_pot_rule_id, source_fixture_id)` — a team plays 3 group matches and can earn `group_win` multiple times
- All other events: `(team_id, main_pot_rule_id)` — a team can only win QF, SF, etc. once

**Indexes:**

- (`team_id`, `effective_at`)
- (`source`, `side_bet_id`)
- (`main_pot_rule_id`)

---

### `team_value_snapshots`

Materialized chart history. One row per (team, date) written whenever a `value_events` row is inserted. This avoids replaying the full event ledger on every chart render.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `team_id` | uuid | FK → teams |
| `date` | date | Calendar date (UTC) |
| `cumulative` | integer | Total ¢ earned by this team up to and including this date |

**Seed row:** on initial setup, insert one row per team at `date = tournament_start_date - 1` with `cumulative = draft_value`. This anchors team charts at their draft price and lets portfolio charts start at 100¢.

**Write strategy:** when inserting a `value_events` row, append or upsert the snapshot for that team at `effective_at::date` with the updated cumulative. Can be done in the same server action (no trigger required — admin inserts are infrequent).

**Portfolio history query (no separate player snapshot table needed):**

```sql
SELECT
  snap.date,
  SUM(h.shares * snap.cumulative) AS portfolio_value
FROM holdings h
JOIN team_value_snapshots snap ON snap.team_id = h.team_id
WHERE h.player_id = $1
GROUP BY snap.date
ORDER BY snap.date;
```

**Indexes:**

- (`team_id`, `date`)
- UNIQUE (`team_id`, `date`)

---

### `side_bets`

Prop bet definitions. Payout goes to one or more teams; ties split the pot.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | text | e.g. "Most group-stage goals" |
| `description` | text | Optional rule detail |
| `payout` | integer | Total ¢ for the bet (split among winners on ties) |
| `status` | text | `open` \| `settled` |
| `data_tier` | text | `api` \| `manual` — see [FIFA_DATA.md](./FIFA_DATA.md) |
| `sort_order` | integer | Display ordering |

No single `winner_team_id` — use `side_bet_winners` for one or many winners.

**Settlement flow (manual or FIFA-assisted):**

1. Determine winning team(s) — ties allowed.
2. Split: each winner gets `payout / winner_count` (define rounding: e.g. integer division, remainder to admin adjustment or largest slug).
3. Insert rows into `side_bet_winners` with per-team `payout_amount`.
4. Set `status = settled`.
5. Insert one `value_events` row per winner: source = `side_bet`, `side_bet_id`, amount = that winner's split.

---

### `side_bet_winners`

Settled winners for a side bet. Supports ties and multi-winner props.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `side_bet_id` | uuid | FK → side_bets |
| `team_id` | uuid | FK → teams |
| `payout_amount` | integer | This team's share after split |

- UNIQUE (`side_bet_id`, `team_id`)
- SUM(`payout_amount`) across winners should equal `side_bets.payout` (or `payout` minus remainder policy)

---

### `side_bet_standings`

Live standings for open props. Supports **multiple teams per rank** (ties) and **top-N display** (e.g. top 5).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `side_bet_id` | uuid | FK → side_bets |
| `team_id` | uuid | FK → teams |
| `rank` | integer | 1 = best; tied teams share the same rank |
| `metric_value` | text | Display stat, e.g. "7 goals" |
| `metric_numeric` | numeric | Optional; for sorting / auto-ranking from FIFA data |
| `updated_at` | timestamptz | |

- UNIQUE (`side_bet_id`, `team_id`)
- Query top 5: `WHERE side_bet_id = ? ORDER BY rank, metric_numeric DESC LIMIT 5` (may return >5 rows if rank 4 has a tie)

Standings can be updated manually in admin or derived from FIFA sync (see [FIFA_DATA.md](./FIFA_DATA.md)).

---

### `main_pot_rules`

Payout table for bracket / group events. Admin configures ¢ per round or event.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `rule_key` | text | Unique, e.g. `group_advance`, `r16`, `qf`, `sf`, `final_win` |
| `label` | text | Display name |
| `payout` | integer | ¢ awarded per team when rule applies |
| `sort_order` | integer | |

---

### `app_settings`

Key-value store for pool-wide config.

| Column | Type | Notes |
|--------|------|-------|
| `key` | text | PK |
| `value` | jsonb | e.g. tournament name, draft locked flag |

---

## Side bets reference (draft)

List still being refined. Grouped by what FIFA data each prop needs — see [FIFA_DATA.md](./FIFA_DATA.md) for fetch strategy.

| Side bet | Notes |
|----------|-------|
| Most tournament goals | Team total goals |
| Most group-stage goals | Goals in group matches only |
| Fewest goals conceded | Inverse ranking |
| Most red cards | Discipline |
| Most yellow cards | Discipline |
| Top African team | Best finish / deepest run among CAF teams |
| Top Asian team | Best finish among AFC teams |
| Top CONCACAF team | Best finish among CONCACAF teams |
| Top South American team | Best finish among CONMEBOL (excluding winner if desired) |
| First eliminated | Earliest exit |
| Biggest win margin | Single-match goal differential |
| Most clean sheets | Shutouts |
| Golden boot winner's team | Player stat → team |
| Most penalty shootout wins | Knockout-specific |
| Own goals leader | Quirky / low correlation with quality |

---

## Computed views (SQL or app layer)

### Team current value

```sql
SELECT team_id, COALESCE(SUM(amount), 0) AS current_value
FROM value_events
GROUP BY team_id;
```

### Player portfolio current value

```sql
SELECT
  h.player_id,
  SUM(h.shares * COALESCE(ve.total, 0)) AS current_value
FROM holdings h
JOIN teams t ON t.id = h.team_id
LEFT JOIN (
  SELECT team_id, SUM(amount) AS total
  FROM value_events
  GROUP BY team_id
) ve ON ve.team_id = t.id
GROUP BY h.player_id;
```

### Team value over time (chart)

Read directly from `team_value_snapshots` for a given `team_id`, ordered by `date`. Starts at `draft_value` (the seed row). No aggregation needed at read time.

### Player portfolio value over time (chart)

Join `holdings × team_value_snapshots` as shown in the `team_value_snapshots` section. Starts at 100¢ (initial investment) because the seed row per team anchors each team at `draft_value`, and SUM(shares × draft_value) = 100 per player by construction.

### Performance vs draft value

- Team: `current_value` vs `draft_value` (per share)
- Player: portfolio current value vs 100¢ draft spend

---

## Projections

**Projected value** is computed in app (optional cache later if the model is expensive).

**Team projected value** — computed per team independently.

**Portfolio projected value:**

```
portfolio projected = Σ (shares × team projected value)
```

This is correct when each `team projected value` is a true **expected value (EV)**, not max upside or independent best-case paths.

| Method per team | Safe to sum for portfolio? |
|-----------------|----------------------------|
| EV (probability-weighted) | Yes — E(A + B) = E(A) + E(B) even if outcomes are correlated |
| Max remaining / best path | No — double-counts exclusive outcomes (only one champion) |

Example: France and Spain in the **final** at 50/50 → each EV for champion payout is half the pot; sum = full pot (portfolio must contain the winner). Same math in the **semifinal**: sum of EVs ≈ 50% of champion payout; summing full champion payout for each team would overstate.

For complex models, **Monte Carlo** (simulate tournament paths, average portfolio value) handles bracket exclusivity without ad hoc rules.

Historical projection snapshots are out of scope unless needed for a specific chart.

---

## Auth & RLS (sketch)

| Role | Read | Write |
|------|------|-------|
| Anonymous / profile picker | All public tables | None |
| Admin (server route + service role) | All | All |

No per-player write access if draft entry is admin-only.

---

## Seed data checklist

- [ ] 48 teams with `draft_value`, `code`, `group_name`
- [ ] 6 players (start with 6; add via admin)
- [ ] Holdings per player (one row per team owned)
- [ ] Main pot rule payouts
- [ ] Side bet definitions with payout amounts

---

## Resolved decisions

| Topic | Decision |
|-------|----------|
| Negative value corrections | Not in v1; `amount` is always positive |
| `value_events.source` | `main_pot` \| `side_bet` only (no `adjustment` in v1) |
| `source_fixture_id` | Nullable text on `value_events`; required for group-stage per-match idempotency |
| Chart history storage | `team_value_snapshots` table; written on each `value_events` insert; seeded at draft_value |
| Portfolio chart start | 100¢ — falls out naturally from the seed row + SUM(shares × draft_value) = 100 invariant |
| Player snapshot table | Not needed; portfolio history = join of holdings × team_value_snapshots |
| Side bet standings | Full `side_bet_standings` table; top-N + ties |
| Main pot rules | Table-driven; admin sets payout per round |
| Multi-winner / ties | Split `side_bets.payout` across `side_bet_winners` |
| Shares | Integer only |
| Projections | `projected_additional` on teams; computed as EV in app; no DB cache in v1 |
| Elimination on teams | Not stored; use FIFA data + value_events |
| Side bet data tiers | `api` (sync) vs `manual` (spreadsheet/admin) — FIFA_DATA.md |
| Build order | UI + typed mocks first — BUILD_PLAN.md |

---

## Possible v2 additions

- `draft_submissions` — in-app pick forms
- `fifa_*` tables — cached match results and team stats (see FIFA_DATA.md)
- `team_projection_snapshots` — cache projected values over time (for a historical "market vs actual" chart)
- `value_event_batches` — optional grouping metadata for bulk admin actions

---

## TypeScript types (app layer)

When implementing, mirror tables above in `lib/types/`. See [BUILD_PLAN.md](./BUILD_PLAN.md) for file layout and computed view types (`TeamWithValue`, `LeaderboardEntry`, etc.).
