import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Requires an authenticated user and ensures an `organizers` profile row
 * exists for them. Redirects to /login when signed out. Returns the user's
 * id and email.
 */
export async function requireOrganizer() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) redirect('/login')

  await supabase
    .from('organizers')
    .upsert(
      { id: user.id, email: user.email, name: user.email.split('@')[0] },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  return { supabase, userId: user.id, email: user.email }
}
