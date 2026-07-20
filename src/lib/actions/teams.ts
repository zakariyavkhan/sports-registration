'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isRegistrationOpen } from '@/lib/auth'
import type { MagicLinkState } from '@/lib/actions/auth'

export async function sendCaptainMagicLink(
  _prev: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const leagueId = String(formData.get('league_id') ?? '')
  const teamName = String(formData.get('team_name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()

  if (!teamName) return { error: 'Enter a team name.' }
  if (!email) return { error: 'Enter your email.' }

  const supabase = await createClient()
  const { data: league } = await supabase
    .from('leagues')
    .select('status, reg_deadline')
    .eq('id', leagueId)
    .single()
  if (!league) return { error: 'League not found.' }
  if (!isRegistrationOpen(league))
    return { error: 'Registration is closed for this league.' }

  const origin = (await headers()).get('origin') ?? ''
  const next = `/l/${leagueId}/create?name=${encodeURIComponent(teamName)}`
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}${next}`, shouldCreateUser: true },
  })
  if (error) return { error: error.message }
  return { sent: true, email }
}
