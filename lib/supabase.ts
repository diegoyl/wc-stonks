import { createClient } from '@supabase/supabase-js'
import type { Player } from '@/lib/types'

let _supabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

export type DraftPicks = Record<string, number> // team code → share count

// Table: players(id serial, name text, slug text)

export async function loadPlayers(): Promise<Player[]> {
  const { data } = await getSupabase()
    .from('players')
    .select('id, name, slug')
    .order('id', { ascending: true })
  return (data ?? []) as Player[]
}

export async function createPlayer(name: string): Promise<Player> {
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-')
  const { data, error } = await getSupabase()
    .from('players')
    .insert({ name: name.trim(), slug })
    .select()
    .single()
  if (error) throw error
  return data as Player
}

// Table: draft_submissions(id uuid, player_id integer, submitted_at timestamptz, picks jsonb)

export async function loadDraftSubmission(playerId: number): Promise<DraftPicks | null> {
  const { data } = await getSupabase()
    .from('draft_submissions')
    .select('picks')
    .eq('player_id', playerId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.picks ?? null
}

export async function saveDraftSubmission(playerId: number, picks: DraftPicks): Promise<void> {
  const { error } = await getSupabase()
    .from('draft_submissions')
    .insert({ player_id: playerId, picks })
  if (error) throw error
}
