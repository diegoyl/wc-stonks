# Initial Build Plan

> **Start here** when implementing. This doc captures build order, UI scope, and deferred work. Product rules live in [README.md](./README.md); schema in [DATA_STRUCTURE.md](./DATA_STRUCTURE.md); FIFA sync in [FIFA_DATA.md](./FIFA_DATA.md).

## Current status

- **Repo:** docs only — no app scaffold yet
- **Next step:** Next.js app + TypeScript types + mock data + public views + admin shell
- **Deferred:** Supabase, API-Football sync, projections model, best/worst ranges

---

## Build strategy

Build **UI first** with **typed mock data**, then wire backend.

| Phase | What | Why |
|-------|------|-----|
| **1 — UI + mocks** | Pages, components, admin shell, fake data | Fast visual feedback; edge cases easy to seed |
| **2 — Supabase** | Schema, RLS, swap mock loader for DB | Types already match DATA_STRUCTURE |
| **3 — FIFA sync** | API-Football, sync button, standings automation | See FIFA_DATA.md |
| **4 — Polish** | Projections EV, charts, optional cron | After core loop works |

**Do not** use ad hoc mock shapes — define `types/` from DATA_STRUCTURE first, implement mocks against those types.

**Admin** starts limited (read-only or local-state stubs). Full CRUD comes incrementally as views need it — not every admin field on day one.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js** (App Router) + React + TypeScript |
| Styling | TBD (Tailwind is a sensible default) |
| Charts | TBD (Recharts or similar for market / leaderboard history) |
| DB (phase 2) | **Supabase** (Postgres + RLS) |
| Deploy (later) | **Vercel** |
| Auth | Profile picker → `localStorage`; admin gated by password/env secret |

---

## Routes / pages

| Route | Purpose |
|-------|---------|
| `/` | Home — Standings (player rankings) + Teams (value vs draft), each with Actual/Market chart toggle |
| `/portfolios` | All players' holdings, or `/portfolios/[slug]` for one |
| `/side-bets` | Props: open standings (top N) or settled winners |
| `/admin` | Protected — scoring & setup tools (limited v1) |
| Profile picker | Modal — select player, store in localStorage |

Nav tabs (mobile bottom bar + desktop header): **Home · Portfolios · Bets**

### Sub-views (modals, any page)

- **Team info** — flag, draft / current / projected value, value history chart
- **Player info** — simplified portfolio summary

Open modals via client state (not query params).

---

## Phase 1 — UI + mocks (detailed)

### 1.1 Scaffold

```
wc-stonks/
├── app/                    # Next.js routes
├── components/             # UI components
├── lib/
│   ├── types/              # TS types from DATA_STRUCTURE
│   ├── mock/               # Fake data + getters
│   ├── compute/            # current value, leaderboard sort, etc.
│   └── format/             # ¢ formatting, flags from team code
├── docs/                   # (optional) move *.md here later
└── README.md
```

### 1.2 TypeScript types

Mirror [DATA_STRUCTURE.md](./DATA_STRUCTURE.md) entities:

- `Player`, `Team`, `Holding`, `ValueEvent`, `MainPotRule`, `SideBet`, `SideBetStanding`, `SideBetWinner`
- Computed / view types: `TeamWithValue`, `HoldingRow`, `LeaderboardEntry`, `ValueSnapshot` (for charts)

Add enums: `ValueEventSource`, `SideBetStatus`, `SideBetDataTier` (`api` | `manual`).

### 1.3 Mock data (`lib/mock/`)

Single source exported via getters, e.g. `getTeams()`, `getLeaderboard()`, `getValueHistory(teamId)`.

**Seed intentional edge cases:**

- 6 players, ~12–16 teams with holdings (not all 48 needed for UI)
- Two players owning same team (different share counts)
- One player with France + Spain (projection / bracket narrative)
- Side bet with **tied leaders** (rank 1 shared)
- Side bet **settled** with split winners
- `value_events` spanning several dates (market chart)
- Negative `amount` adjustment event (optional)
- Main pot events at different rounds

Use realistic `teams.code` (FRA, ESP, …) for flag URLs (e.g. flagcdn.com or similar).

### 1.4 Compute layer (`lib/compute/`)

Pure functions used by both mocks and (later) DB layer:

- `teamCurrentValue(teamId, events)`
- `playerCurrentValue(playerId, holdings, teamValues)`
- `leaderboard(players, holdings, teamValues, teamProjectedValues)` → ranked entries with `projected_value`
- `teamValueOverTime(teamId, events, draftValue)` → `{ date, cumulative }[]` — starts at `draftValue` on `2026-06-11`
- `portfolioValueOverTime(playerId, holdings, events)` → `{ date, cumulative }[]` — starts at 100¢ on `2026-06-11`
- `portfolioRows(playerId, …)` → holdings with team value + total value

Keeps pages thin; same functions when Supabase replaces mocks. In Phase 2, `teamValueOverTime` and `portfolioValueOverTime` are replaced by direct reads from `team_value_snapshots`.

### 1.5 Build order (pages)

1. **Layout** — nav (Leaderboard, Portfolios, Market, Side bets), profile picker, ¢ formatter
2. **Leaderboard** — table/cards, sort by current value, link to player modal
3. **Portfolios** — per player: team, flag, shares, team value, total value
4. **Market** — team list + simple line chart (current value over time); movers vs draft value
5. **Side bets** — list props; open → top 5 standings; settled → winners + payout split
6. **Modals** — team + player (wire from leaderboard/portfolios/market)
7. **Admin shell** — password gate (hardcoded env for now); sections as placeholders

### 1.6 Admin v1 scope (mock / local state)

Start with **structure only** — sections visible, minimal interaction:

| Section | Phase 1 | Later |
|---------|---------|-------|
| Award main-pot value | Button stub / mock queue display | Real insert to `value_events` |
| Settle side bet | Pick winner(s) stub | `side_bet_winners` + events |
| Edit holdings | Read-only or not shown | Full form |
| Sync FIFA | Disabled + "coming soon" | FIFA_DATA flow |
| Manage teams/players | Not required | Admin CRUD |

Admin can use React context or simple local state to demo approving a mock "pending event" on leaderboard — optional nice-to-have, not blocking.

### 1.7 Projections in UI (phase 1)

- Show **current value** everywhere it matters
- **Projected value:** optional column if mock includes static `projectedValue` on teams — no model yet
- Label as "expected" when added; skip best/worst ranges

---

## Phase 2 — Supabase

1. Create Supabase project; SQL from DATA_STRUCTURE tables (including `team_value_snapshots`)
2. RLS: public read; writes via server actions + service role / admin secret
3. Seed script from mock data:
   - Insert all static tables (players, teams, holdings, rules, side bets)
   - Insert `value_events` rows
   - **Seed `team_value_snapshots`:** one row per team at `tournament_start - 1` with `cumulative = draft_value`, then one row per team per event date with running cumulative
4. Replace `lib/mock/` loaders with `lib/db/` — **keep same types**
   - Chart history: read directly from `team_value_snapshots` (no replay of event log)
   - Portfolio history: `holdings × team_value_snapshots` join (see DATA_STRUCTURE.md)
   - Drop `teamValueOverTime` / `portfolioValueOverTime` compute functions — replaced by DB queries
5. Admin actions → server routes that insert `value_events` rows **and** upsert the corresponding `team_value_snapshots` row in the same transaction

No schema redesign expected — types were aligned in phase 1.

---

## Phase 3 — FIFA sync

Follow [FIFA_DATA.md](./FIFA_DATA.md):

- API-Football free tier, manual Sync button (1–4×/day)
- `fifa_*` cache tables
- Recompute tier-`api` side bet standings
- Main pot approval queue
- CSV import for manual-tier props / corrections

---

## Phase 4 — Later / secondary

- Portfolio / team **EV projections** (sum of team EVs — see README)
- Best/worst case ranges (Monte Carlo or bracket search — not v1)
- In-app draft pick forms
- Profile avatars, polish, cron sync
- Tie-break rules (currently out of scope)

---

## Key decisions (quick reference)

| Topic | Decision |
|-------|----------|
| Currency | ¢ coins; real money settled outside app |
| Shares | Integer only; max 40¢ per team per player; 100¢ total per portfolio |
| Value flows to teams | Player value = Σ (shares × team current value) |
| Ledger | Append-only `value_events`; negative amounts OK |
| Side bet ties | Split payout; `side_bet_winners` + multiple event rows |
| Side bet data | `data_tier`: `api` vs `manual` (see FIFA_DATA) |
| Draft | Often offline; admin enters holdings |
| Login | Profile picker; admin password separate |
| Projections | Portfolio EV = sum of team EVs; not best-case sum |
| FIFA | Not live; manual sync; API-Football primary free source |

---

## Doc index

| File | Contents |
|------|----------|
| [README.md](./README.md) | Product overview, contest rules, terminology, features |
| [DATA_STRUCTURE.md](./DATA_STRUCTURE.md) | DB schema, computed queries, resolved decisions |
| [FIFA_DATA.md](./FIFA_DATA.md) | Free APIs, sync strategy, prop tiers, cache tables |
| **BUILD_PLAN.md** (this file) | Implementation order, routes, mocks, phases |

---

## Prompt for next chat

> Scaffold Next.js app per BUILD_PLAN.md phase 1: types from DATA_STRUCTURE, mock data with edge cases, layout + leaderboard + portfolios pages first.
