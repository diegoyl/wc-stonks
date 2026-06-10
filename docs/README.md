# WC Stonks

A web app for hosting a single World Cup betting pool with friends (~6–10 players). Teams are bought as **shares** during a draft; tournament results and prop bets increase **team value**, and each player's **portfolio** (their collection of shares) determines standings.

Real money is handled outside the app. In-app currency is **coins (¢)** for round numbers.

## Documentation

| Doc | Purpose |
|-----|---------|
| **[BUILD_PLAN.md](./BUILD_PLAN.md)** | **Start here for implementation** — phases, routes, mocks, admin scope |
| [DATA_STRUCTURE.md](./DATA_STRUCTURE.md) | Database schema, types, ledger model |
| [FIFA_DATA.md](./FIFA_DATA.md) | Free APIs, sync strategy (phase 3) |
| README.md (this file) | Product overview and contest rules |

**Current status:** planning complete; next step is phase 1 in BUILD_PLAN (Next.js + typed mocks + views).

## Stack

- **Frontend:** React (Next.js)
- **Backend:** Supabase (database, auth-light reads) — phase 2
- **Deploy:** Vercel

## Login

- Users select their profile on load — no passwords for regular views.
- Admin page is gated separately (password or shared secret).

## Contest format

### Draft (portfolio construction)

- Each player starts with **100¢** to allocate across teams.
- Each team has a fixed **draft value** (price per share).
- Players buy shares in any combination; multiple players can own the same team.
- **Max 40¢ per team** per player (e.g. France at 20¢/share → max 2 shares).
- Draft may happen outside the app; holdings are entered via admin.

After the draft, team **current value** resets to 0 and only increases from tournament results and prop payouts. Draft spend is the baseline for comparison, not live scoring.

### Scoring

Points flow to **teams**, not directly to players. A player's standing is derived from their portfolio:

**player current value = Σ (team current value × shares owned)**

#### Main pot — tournament progression

Teams earn value for group-stage results and advancing through knockout rounds.

#### Side bets — props

Miscellaneous markets (e.g. most goals, most red cards, top African team). Props can reward teams that underperform in the bracket. Winners settled in admin (FIFA sync assists later for tier-`api` props).

## Value terminology

| Term | Meaning |
|------|---------|
| **Draft value** | Price at allocation; per-share for teams, 100¢ total per player |
| **Current value** | Points earned so far (primary number for standings) |
| **Projected value** | Estimated final value given current tournament state (useful early on) |

In portfolio views:

| Term | Meaning |
|------|---------|
| **Team value** | Current (or projected) value of a **single share** |
| **Total value** | Team value × shares owned |

## Projections

**Team projected value** can be computed per team independently.

**Portfolio projected value** is usually:

**portfolio projected = Σ (shares × team projected value)**

That sum is valid **when each team's number is a true expected value (EV)** — a probability-weighted average of outcomes — not a best-case or "if this team wins everything" scenario.

| Approach | Sum portfolio from team projections? |
|----------|----------------------------------------|
| **Expected value (EV)** per team | Yes — expectation is linear: E(A + B) = E(A) + E(B), even when teams face each other |
| **Max upside / best path** per team | No — double-counts exclusive outcomes (two teams can't both win the final) |
| **Current value + max remaining** per team | No — same problem |

**France + Spain in the final (50/50):** each team's EV for the champion payout is half the pot; the sum equals the full champion payout. That is correct — your portfolio is guaranteed to include the winner.

**France + Spain in the semifinal:** same EV math still works (each ~25% to win the cup if 50/50 each match → sum ~50% of champion payout). What *doesn't* work is assigning each team the *full* champion payout and adding them.

**Side bets** (single winner): same rule. EV per team is fine to sum; "leader wins the whole prop" per team is not.

If the model gets heavy (many correlated props + bracket paths), **Monte Carlo** is the robust approach: simulate many tournament outcomes, compute portfolio value each time, average. That handles exclusivity without special cases.

For v1, **portfolio projected = sum of team EVs** is the core projection model; label clearly in the UI ("expected final value").

**Best/worst case ranges** (e.g. "your portfolio finishes somewhere between X¢ and Y¢") are **not** part of the initial app — they require scenario simulation across the bracket (and props), not summing per-team max/min. See Secondary features below.

## Features

### Main (v1)

1. **Portfolios** — each player's holdings: team, flag, shares, team value, total value
2. **Market** — team value over time; performance vs draft value; best/worst movers
3. **Leaderboard** — player rankings by portfolio current value
4. **Side bets** — each prop: winner if settled, current leader if open
5. **Sub-views** (modals, usable across pages)
   - **Team info** — results and value (draft / current / projected)
   - **Player info** — simplified portfolio summary

### Secondary (later)

- In-app draft / pick forms (admin entry is fine for v1)
- Richer **projected value** model or external data (team EV; portfolio = sum of holdings)
- **Best/worst case ranges** for team or portfolio value — bracket-aware scenario search or Monte Carlo percentiles; not simple sums when holdings overlap in knockout paths
- Additional charts and polish

### Out of scope (for now)

- Tie-break rules for props
- In-app trading or secondary market
- Real-money payment tracking

## Admin

Admin tools (protected) — **limited in phase 1 UI**; full wiring in phase 2:

- Manage teams and draft prices
- Enter or import player portfolios (shares per team)
- Award main-pot value (round advancement, group results)
- Settle side bets (winners → value to team(s); ties split payout)
- Sync FIFA data (phase 3)
- Optional: adjust projected value inputs

## Implementation phases

See **[BUILD_PLAN.md](./BUILD_PLAN.md)** for detail:

1. **UI + typed mocks** — views, modals, admin shell
2. **Supabase** — schema, seed, replace mock loaders
3. **FIFA sync** — API-Football, standings, main-pot queue
4. **Polish** — projections, charts, extras

## Local development

> TBD after Next.js scaffold (phase 1).
