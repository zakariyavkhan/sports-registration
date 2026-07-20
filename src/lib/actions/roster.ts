'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isRegistrationOpen } from '@/lib/auth'
import type { MagicLinkState } from '@/lib/actions/auth'

// Soft-remove a roster entry. RLS decides who may do it: the player
// themselves, the team's captain, or the league's organizer.
export async function removeRosterEntry(formData: FormData) {
  const entryId = String(formData.get('entry_id') ?? '')
  const revalidate = String(formData.get('revalidate') ?? '')
  const supabase = await createClient()
  const { error } = await supabase
    .from('roster_entries')
    .update({ status: 'removed' })
    .eq('id', entryId)
    .eq('status', 'confirmed')
  if (error) throw new Error(error.message)
  if (revalidate) revalidatePath(revalidate)
}

export async function sendPlayerMagicLink(
  _prev: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const joinCode = String(formData.get('join_code') ?? '')
  const name = String(formData.get('player_name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const waiver = formData.get('waiver') === 'on'

  if (!name) return { error: 'Enter your name.' }
  if (!email) return { error: 'Enter your student email.' }
  if (!waiver) return { error: 'You must agree to the waiver to join.' }

  const supabase = await createClient()
  const { data: rows } = await supabase.rpc('join_info', {
    p_join_code: joinCode,
  })
  const info = rows?.[0]
  if (!info) return { error: 'This join link is invalid.' }
  if (info.admission_status === 'withdrawn')
    return { error: 'This team has withdrawn from the league.' }
  if (
    !isRegistrationOpen({
      status: info.league_status,
      reg_deadline: info.reg_deadline,
    })
  )
    return { error: 'Registration is closed for this league.' }
  if (Number(info.confirmed_count) >= info.roster_max)
    return { error: 'This team’s roster is full.' }

  const origin = (await headers()).get('origin') ?? ''
  const next = `/j/${joinCode}/join?name=${encodeURIComponent(name)}`
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}${next}`, shouldCreateUser: true },
  })
  if (error) return { error: error.message }
  return { sent: true, email }
}
