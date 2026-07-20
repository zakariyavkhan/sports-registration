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
