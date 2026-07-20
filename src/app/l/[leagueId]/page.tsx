import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isRegistrationOpen } from '@/lib/auth'
import { CaptainRegisterForm } from './CaptainRegisterForm'

export default async function LeagueRegisterPage({
  params,
}: {
  params: Promise<{ leagueId: string }>
}) {
  const { leagueId } = await params
  const supabase = await createClient()

  const { data: league } = await supabase
    .from('leagues')
    .select('id, sport, division, roster_min, roster_max, reg_deadline, status')
    .eq('id', leagueId)
    .single()

  if (!league) notFound()

  const open = isRegistrationOpen(league)

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div>
        <p className="text-sm font-medium text-zinc-500">Team registration</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {league.sport} · {league.division}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Roster {league.roster_min}–{league.roster_max} players · registration
          closes {league.reg_deadline}
        </p>
      </div>

      {open ? (
        <CaptainRegisterForm leagueId={league.id} />
      ) : (
        <div className="rounded-lg border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          Registration for this league is closed. Contact your organizer if you
          think this is a mistake.
        </div>
      )}
    </main>
  )
}
