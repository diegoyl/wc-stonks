# FIFA Data Plan

> **FIFA** = the real World Cup tournament (matches, results, stats).  
> **Contest / pool** = our betting game (portfolios, value, side bets).  
> This doc plans what FIFA data we need, **free** sources, and how to sync without manual match entry.

## Goals

1. **Main pot** — detect when teams earn bracket/group value → create or suggest `value_events`.
2. **Side bets** — maintain `side_bet_standings` (top N, ties); settle when final.
3. **Display** — results, flags, group tables in team modals (optional).
4. **Projections** — team still alive, remaining main-pot path, open props.

We do **not** need live in-match updates. **Manual trigger, 1–4 syncs per day** after match windows is enough.

---

## Recommended approach

**Primary: free API (API-Football) + admin “Sync” button.**  
**Fallback: CSV/spreadsheet import** for corrections or props the API doesn’t cover well.

```
Admin clicks "Sync FIFA data"
  → fetch from API (batched, rate-aware)
  → normalize → fifa_* cache tables
  → recompute side_bet_standings (API-tier bets)
  → queue main_pot value_events for approval
  → flag manual-tier bets if data missing / ambiguous
```

No paid API required for a friends pool at 1–4 syncs/day if calls are batched efficiently (~5–15 requests per sync).

---

## Free options compared

### 1. API-Football (api-sports.io) — **recommended primary**

| | |
|--|--|
| **Cost** | $0 forever; no credit card |
| **Limit** | 100 requests / day (all endpoints included) |
| **WC access** | `league=1`, `season=2026` |
| **Good for** | Fixtures, results, standings, match events (goals, cards), team match statistics, top scorers, top cards |
| **Docs** | [WC 2026 guide](https://www.api-football.com/news/post/fifa-world-cup-2026-guide-to-using-data-with-api-sports) |

**Why this fits:** Richest **free** stat coverage for props (goals, cards, clean sheets from match stats). 100 req/day is plenty for 4 manual syncs if we batch fixture IDs (up to 20 per request).

**Caveats:** Check `leagues?id=1&season=2026` → `coverage` flags before tournament; some match-level stats appear only after FT. Map api-sports team IDs ↔ our `teams.code` once at setup.

**Efficient sync (~8 req per run):**

| Call | Purpose | Req |
|------|---------|-----|
| `fixtures?league=1&season=2026&status=FT` | All finished matches | 1 |
| `fixtures?ids=…` (batch ≤20) | Scores + events for newly finished | 1–3 |
| `standings?league=1&season=2026` | Groups + advancement | 1 |
| `fixtures/statistics?fixture=…` or batch | Team stats per match (GF, GA, cards) | 1–2 |
| `players/topscorers`, `players/topredcards`, `players/topyellowcards` | Leader props | 2–3 |

4 syncs × ~10 req ≈ **40/day** — headroom for retries.

---

### 2. football-data.org — **good backup for main pot**

| | |
|--|--|
| **Cost** | $0; WC listed on [free tier coverage](https://www.football-data.org/coverage) |
| **Limit** | 10 requests / minute (registered free key) |
| **WC access** | `GET /v4/competitions/WC/matches`, `/standings?season=2026` |
| **Good for** | Match results, group standings, knockout progression |
| **Weaker for** | Deep team aggregates, cards/discipline vs API-Football |

**Use as:** secondary source to cross-check scores/advancement, or sole source for main pot if API-Football has a bad day. Not ideal as only source for card/goal props.

**Note:** Non-commercial hobby pool is fine; commercial use requires their permission.

---

### 3. openfootball (GitHub JSON) — **schedule backbone only**

| | |
|--|--|
| **Cost** | Free (CC0), no key |
| **URL** | [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) |
| **Good for** | Fixture schedule, groups, venues, team names |
| **Not good for** | Live results, cards, automated props — community-updated, lag on scores |

**Use as:** seed `fifa_matches` schedule before tournament; not a replacement for results sync.

---

### 4. worldcup26.ir (community REST API) — **optional supplement**

| | |
|--|--|
| **Cost** | Free hosted API; open source |
| **URL** | [worldcup26.ir/api-docs](https://worldcup26.ir/api-docs/) |
| **Good for** | Scores, standings, teams, groups — simple REST, no key for reads |
| **Risk** | Third-party uptime/accuracy; not primary for anything you can’t verify |

**Use as:** backup scores check or quick prototyping — not sole source of truth.

---

### 5. Self-hosted aggregators (e.g. emrbli/worldcup) — **reference only**

Some OSS backends combine openfootball + football-data.org + ESPN unofficial feeds. Powerful but heavy to operate; ESPN-style sources break without notice.

**Use as:** architecture reference, not something to deploy for this pool unless API-Football fails entirely.

---

### 6. apifootball.com — **not useful**

Different product from API-Football. Free tier is **Championship + Ligue 2 only** — no World Cup.

---

### 7. CSV / spreadsheet import — **corrections layer**

Not the primary path, but keep it for:

- API wrong or missing a stat
- Manual-tier props (golden boot, weird edge cases)
- One-off overrides without fighting the API client

Admin uploads CSV → merges into `fifa_*` cache → recomputes standings. Same shape whether data came from API or sheet.

---

## Side bets: two tiers

Each `side_bets` row should eventually have a **`data_tier`** (or `metric_key` + tier):

| Tier | Source | Admin work |
|------|--------|------------|
| **`api`** | Computed from FIFA cache after sync | Review / approve settlement |
| **`manual`** | Spreadsheet import or direct admin entry | Enter or correct standings |

### Tier `api` — automatable from API-Football (+ confederation static map)

| Side bet | How |
|----------|-----|
| Most tournament goals | Sum goals from finished fixtures / top scorers |
| Most group-stage goals | Filter fixtures by group stage |
| Fewest goals conceded | Sum GA; rank ASC |
| Most red cards | Events or `topredcards` |
| Most yellow cards | Events or `topyellowcards` |
| Top African / Asian / CONCACAF / South American team | Confederation map + deepest round from standings + knockout results |
| First eliminated | Earliest finished loss / last in group |
| Biggest win margin | Max (GF − GA) in one match |
| Most clean sheets | Count matches with GA = 0 |
| Most penalty shootout wins | Match status / events |

### Tier `manual` — spreadsheet or admin entry

| Side bet | Why manual |
|----------|------------|
| Golden boot winner's team | Player award; lock once FIFA announces (or use top scorers near end with admin confirm) |
| Own goals leader | Attribution rules; API may be incomplete |
| Custom / joke props | No API metric |
| Any prop when API coverage gap | Fallback |

Ties: ranking logic uses `side_bet_standings` (shared rank); settlement splits payout via `side_bet_winners` (see DATA_STRUCTURE.md).

---

## Main pot automation

On each sync after new finished matches:

1. Update `fifa_matches` cache from API.
2. Derive group advancers and knockout winners.
3. For each `main_pot_rules` row, find teams newly eligible.
4. If no existing `value_events` for (`team_id`, `main_pot_rule_id`), add to **approval queue**.
5. Admin approves batch (recommended for v1) or auto-apply via setting.

Round knockouts: one finished match → one winner → one `value_events` row for that round’s rule.

**Idempotency:** never double-award the same (`team_id`, `main_pot_rule_id`).

---

## Sync schedule

| When | Action |
|------|--------|
| Off days | 0–1 sync (optional) |
| Match days | 1–4 syncs: after final group games block, after evening knockouts, next morning |
| Trigger | Admin button only (no live polling) |

Optional later: Vercel cron calling the same sync handler — still not in-match live.

---

## Optional FIFA cache tables

Normalized cache between API and contest ledger (see DATA_STRUCTURE.md for contest tables).

### `fifa_matches`

| Column | Notes |
|--------|-------|
| `external_id` | API fixture ID |
| `stage` | group, r32, r16, qf, sf, third, final |
| `home_team_code`, `away_team_code` | Join to `teams.code` |
| `home_score`, `away_score` | Full time |
| `went_to_pens` | boolean |
| `status` | scheduled, finished |
| `kickoff_at` | |

### `fifa_team_stats`

Aggregates rebuilt each sync from finished matches:

| Column | Notes |
|--------|-------|
| `team_code` | |
| `goals_for`, `goals_against` | Tournament |
| `goals_for_group` | Group stage only |
| `red_cards`, `yellow_cards` | |
| `clean_sheets` | |
| `pen_shootout_wins` | |
| `stage_reached` | Deepest round (confederation props) |
| `eliminated_at` | Optional display; not on contest `teams` table |
| `updated_at` | |

### `fifa_sync_log`

| Column | Notes |
|--------|-------|
| `source` | api-football, football-data, csv |
| `synced_at` | |
| `requests_used` | Track API budget |
| `notes` | errors, rows updated |

---

## Implementation order

1. **Team code mapping** — api-sports ID ↔ `teams.code` + confederation JSON.
2. **Sync handler** — API-Football → `fifa_matches` + `fifa_team_stats`.
3. **Main pot queue** — diff → pending `value_events`.
4. **Tier `api` props** — recompute `side_bet_standings` from cache.
5. **CSV import** — override / manual-tier props.
6. **football-data.org** — optional verify step for scores.

---

## Open decisions

1. **Auto-apply vs approve** main pot after sync (default: approve).
2. **Auto-settle vs approve** tier-`api` props when bet is mathematically final.
3. **Golden boot** — manual lock vs “top scorer + admin confirm on last match day”.
4. **Cron** — add later if manual button gets tedious (same handler).

---

## Related docs

- [README.md](./README.md) — product overview
- [DATA_STRUCTURE.md](./DATA_STRUCTURE.md) — contest schema, side bets list, ledger model
- [BUILD_PLAN.md](./BUILD_PLAN.md) — implementation phases (FIFA sync is phase 3)
