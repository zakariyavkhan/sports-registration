'use server'

import { revalidatePath } from 'next/cache'
import { requireOrganizer } from '@/lib/organizer'

export async function promoteTeam(formData: FormData) {
  const teamId = String(formData.get('team_id') ?? '')
  const leagueId = String(formData.get('league_id') ?? '')
  const { supabase } = await requireOrganizer()
  const { error } = await supabase.rpc('promote_team', { p_team_id: teamId })
  if (error) throw new Error(error.message)
  revalidatePath(`/organizer/leagues/${leagueId}`)
}

export async function toggleLeagueStatus(formData: FormData) {
  const leagueId = String(formData.get('league_id') ?? '')
  const { supabase } = await requireOrganizer()
  const { data: league } = await supabase
    .from('leagues')
    .select('status')
    .eq('id', leagueId)
    .single()
  if (!league) return
  const next = league.status === 'open' ? 'closed' : 'open'
  const { error } = await supabase
    .from('leagues')
    .update({ status: next })
    .eq('id', leagueId)
  if (error) throw new Error(error.message)
  revalidatePath(`/organizer/leagues/${leagueId}`)
}

export async function updateDeadline(formData: FormData) {
  const leagueId = String(formData.get('league_id') ?? '')
  const deadline = String(formData.get('reg_deadline') ?? '').trim()
  if (!deadline) return
  const { supabase } = await requireOrganizer()
  const { error } = await supabase
    .from('leagues')
    .update({ reg_deadline: deadline })
    .eq('id', leagueId)
  if (error) throw new Error(error.message)
  revalidatePath(`/organizer/leagues/${leagueId}`)
}

// Withdraw an active team. The DB trigger auto-promotes the earliest
// waitlisted team; we also free the team's players (soft delete) so they can
// join another team in the league.
export async function withdrawTeam(formData: FormData) {
  const teamId = String(formData.get('team_id') ?? '')
  const leagueId = String(formData.get('league_id') ?? '')
  const { supabase } = await requireOrganizer()
  const { error } = await supabase
    .from('teams')
    .update({ admission_status: 'withdrawn' })
    .eq('id', teamId)
    .eq('admission_status', 'active')
  if (error) throw new Error(error.message)
  await supabase
    .from('roster_entries')
    .update({ status: 'removed' })
    .eq('team_id', teamId)
    .eq('status', 'confirmed')
  revalidatePath(`/organizer/leagues/${leagueId}`)
}
