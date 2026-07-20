'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type MagicLinkState = { error?: string; sent?: boolean; email?: string }

export async function sendMagicLink(
  _prev: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = String(formData.get('email') ?? '').trim()
  const next = String(formData.get('next') ?? '/organizer')
  if (!email) return { error: 'Enter your email.' }

  const origin = (await headers()).get('origin') ?? ''
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}${next}`, shouldCreateUser: true },
  })
  if (error) return { error: error.message }
  return { sent: true, email }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
