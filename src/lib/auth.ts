import { createClient } from '@/lib/supabase/server'

/** Returns the Supabase client and the current user (or null if signed out). */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

/** Today's date as an ISO `YYYY-MM-DD` string, for comparing against `date` columns. */
export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/** Registration is open when the league is open and the deadline hasn't passed. */
export function isRegistrationOpen(league: {
  status: string
  reg_deadline: string
}) {
  return league.status === 'open' && league.reg_deadline >= todayISO()
}
