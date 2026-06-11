# DB Progress

Tracks the state of every Supabase table: whether it's been created, and what data it holds.

| Table                | Created | Data | Notes                                                        |
|----------------------|---------|------|--------------------------------------------------------------|
| `players`            | ✅      | Real | Used by draft page                                           |
| `draft_submissions`  | ✅      | Real | Used by draft page (picks as JSONB)                          |
| `holdings`           | ❌      | —    | Materialized from `draft_submissions` after draft lock       |
| `value_events`       | ❌      | —    | Core tournament tracking; admin posts as results come in     |
| `main_pot_rules`     | ❌      | —    | Seed once from `MAIN_POT_RULES` in `lib/mock/data.ts`       |
| `side_bets`          | ❌      | —    | Admin-managed; mock data in `lib/mock/data.ts`               |
| `side_bet_winners`   | ❌      | —    | Posted by admin on settlement                                |
| `side_bet_standings` | ❌      | —    | Admin/API upserts; mock data in `lib/mock/data.ts`           |
| `app_settings`       | ❌      | —    | Seed with `draft_locked: false`, `tournament_phase: "group"` |

## Data states
- **Real** — live Supabase data, app reads from DB
- **Mock** — table exists but app still reads from `lib/mock/data.ts`
- **Seeded** — table created and seeded with initial/static data
- **—** — table not yet created
