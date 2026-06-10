import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type DraftPicks = Record<string, number> // team code → share count

// Most recent submission per player = official
// Table: draft_submissions(id uuid, player_id text, submitted_at timestamptz, picks jsonb)

export async function loadDraftSubmission(playerId: string): Promise<DraftPicks | null> {
  const { data } = await supabase
    .from('draft_submissions')
    .select('picks')
    .eq('player_id', playerId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()
  return data?.picks ?? null
}

export async function saveDraftSubmission(playerId: string, picks: DraftPicks): Promise<void> {
  const { error } = await supabase
    .from('draft_submissions')
    .insert({ player_id: playerId, picks })
  if (error) throw error
}
