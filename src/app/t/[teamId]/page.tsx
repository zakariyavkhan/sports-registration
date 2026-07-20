import { notFound } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getOrigin } from '@/lib/origin'
import { CopyField } from '@/components/CopyField'
import { removeRosterEntry } from '@/lib/actions/roster'

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>
}) {
  const { teamId } = await params
  const { supabase, user } = await getUser()

  const { data: team } = await supabase
    .from('teams')
    .select(
      'id, name, join_code, admission_status, waitlist_position, league_id, captain_email, leagues(sport, division, roster_min, roster_max, organizer_id)'
    )
    .eq('id', teamId)
    .single()

  if (!team) notFound()

  const league = team.leagues as unknown as {
    sport: string
    division: string
    roster_min: number
    roster_max: number
    organizer_id: string
  }

  const canManage =
    !!user &&
    (user.email?.toLowerCase() === team.captain_email.toLowerCase() ||
      user.id === league.organizer_id)

  const { data: roster } = await supabase
    .from('roster_entries')
    .select('id, player_name, player_email, is_captain')
    .eq('team_id', teamId)
    .eq('status', 'confirmed')
    .order('is_captain', { ascending: false })

  const confirmed = roster?.length ?? 0
  const rosterState =
    confirmed >= league.roster_max
      ? { label: 'Full', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' }
      : confirmed >= league.roster_min
        ? { label: 'Complete', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' }
        : { label: 'Forming', cls: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' }

  const origin = await getOrigin()
  const joinUrl = `${origin}/j/${team.join_code}`
  const atCapacity = confirmed >= league.roster_max

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <p className="text-sm font-medium text-zinc-500">
        {league.sport} · {league.division}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{team.name}</h1>
        {team.admission_status === 'waitlisted' && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Waitlisted · #{team.waitlist_position}
          </span>
        )}
        {team.admission_status === 'active' && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Active
          </span>
        )}
        {team.admission_status === 'withdrawn' && (
          <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Withdrawn
          </span>
        )}
      </div>

      {team.admission_status === 'waitlisted' && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          The league is at its team cap, so your team is on the waitlist. You can
          still build your roster now — you&apos;ll be ready the moment a spot
          opens.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Invite your teammates</h2>
        <p className="mb-3 mt-1 text-sm text-zinc-500">
          Share this link. Players open it, enter their details, and join your
          roster.
        </p>
        <CopyField value={joinUrl} />
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-sm font-semibold">Roster</h2>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${rosterState.cls}`}>
            {rosterState.label}
          </span>
          <span className="text-sm text-zinc-500">
            {confirmed} of {league.roster_min}–{league.roster_max}
          </span>
        </div>
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {roster?.map((r) => (
            <li
              key={r.player_email}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span>
                <span className="font-medium">{r.player_name}</span>{' '}
                <span className="text-zinc-500">{r.player_email}</span>
              </span>
              <div className="flex items-center gap-3">
                {r.is_captain && (
                  <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-xs font-medium text-white dark:bg-white dark:text-zinc-900">
                    Captain
                  </span>
                )}
                {canManage && !r.is_captain && (
                  <form action={removeRosterEntry}>
                    <input type="hidden" name="entry_id" value={r.id} />
                    <input type="hidden" name="revalidate" value={`/t/${teamId}`} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Remove
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
          {!roster?.length && (
            <li className="px-4 py-6 text-center text-sm text-zinc-500">
              No confirmed players yet.
            </li>
          )}
        </ul>
        {atCapacity && (
          <p className="mt-2 text-xs text-zinc-500">
            Your roster is full — new players can&apos;t join until a spot opens.
          </p>
        )}
      </section>
    </main>
  )
}
