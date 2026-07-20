'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireOrganizer } from '@/lib/organizer'

export type CreateLeagueState = { error?: string }

export async function createLeague(
  _prev: CreateLeagueState,
  formData: FormData
): Promise<CreateLeagueState> {
  const { supabase, userId } = await requireOrganizer()

  const sport = String(formData.get('sport') ?? '').trim()
  const division = String(formData.get('division') ?? '').trim()
  const rosterMin = Number(formData.get('roster_min'))
  const rosterMax = Number(formData.get('roster_max'))
  const maxTeamsRaw = String(formData.get('max_teams') ?? '').trim()
  const maxTeams = maxTeamsRaw === '' ? null : Number(maxTeamsRaw)
  const regDeadline = String(formData.get('reg_deadline') ?? '').trim()

  if (!sport || !division) return { error: 'Sport and division are required.' }
  if (!Number.isInteger(rosterMin) || !Number.isInteger(rosterMax))
    return { error: 'Roster min and max must be whole numbers.' }
  if (rosterMin < 1 || rosterMax < rosterMin)
    return { error: 'Roster max must be greater than or equal to roster min.' }
  if (maxTeams !== null && (!Number.isInteger(maxTeams) || maxTeams < 1))
    return { error: 'Max teams must be a positive number, or left blank.' }
  if (!regDeadline) return { error: 'Registration deadline is required.' }

  const { data, error } = await supabase
    .from('leagues')
    .insert({
      organizer_id: userId,
      sport,
      division,
      roster_min: rosterMin,
      roster_max: rosterMax,
      max_teams: maxTeams,
      reg_deadline: regDeadline,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/organizer')
  redirect(`/organizer/leagues/${data.id}`)
}
