import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireOrganizer } from '@/lib/organizer'
import { getOrigin } from '@/lib/origin'
import { CopyField } from '@/components/CopyField'
import {
  promoteTeam,
  toggleLeagueStatus,
  updateDeadline,
  withdrawTeam,
} from '@/lib/actions/organizer'

function rosterStatus(confirmed: number, min: number, max: number) {
  if (confirmed > max)
    return { label: 'Over', cls: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' }
  if (confirmed >= max)
    return { label: 'Full', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' }
  if (confirmed >= min)
    return { label: 'Complete', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' }
  return { label: 'Incomplete', cls: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' }
}

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase } = await requireOrganizer()

  const { data: league } = await supabase
    .from('leagues')
    .select(
      'id, sport, division, roster_min, roster_max, max_teams, reg_deadline, status'
    )
    .eq('id', id)
    .single()
  if (!league) notFound()

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, captain_email, admission_status, waitlist_position')
    .eq('league_id', id)
  const { data: roster } = await supabase
    .from('roster_entries')
    .select('team_id')
    .eq('league_id', id)
    .eq('status', 'confirmed')

  const counts = new Map<string, number>()
  for (const r of roster ?? [])
    counts.set(r.team_id, (counts.get(r.team_id) ?? 0) + 1)

  const active = (teams ?? [])
    .filter((t) => t.admission_status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name))
  const waitlisted = (teams ?? [])
    .filter((t) => t.admission_status === 'waitlisted')
    .sort((a, b) => (a.waitlist_position ?? 0) - (b.waitlist_position ?? 0))

  const origin = await getOrigin()
  const registerUrl = `${origin}/l/${league.id}`

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link href="/organizer" className="text-sm text-zinc-500 hover:underline">
        ← Your leagues
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {league.sport} · {league.division}
        </h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            league.status === 'open'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          {league.status}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-zinc-500">Roster size</dt>
          <dd className="font-medium">
            {league.roster_min}–{league.roster_max}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Max teams</dt>
          <dd className="font-medium">{league.max_teams ?? 'Unlimited'}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Deadline</dt>
          <dd className="font-medium">{league.reg_deadline}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Teams</dt>
          <dd className="font-medium">
            {active.length} active
            {waitlisted.length > 0 && ` · ${waitlisted.length} waitlisted`}
          </dd>
        </div>
      </dl>

      <section className="mt-8 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold">Registration</h2>
        <div className="mt-3 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-sm text-zinc-500">
              Currently{' '}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {league.status}
              </span>
            </p>
            <form action={toggleLeagueStatus} className="mt-2">
              <input type="hidden" name="league_id" value={league.id} />
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500"
              >
                {league.status === 'open'
                  ? 'Close registration'
                  : 'Open registration'}
              </button>
            </form>
          </div>
          <form action={updateDeadline} className="flex items-end gap-2">
            <input type="hidden" name="league_id" value={league.id} />
            <label className="flex flex-col gap-1 text-sm font-medium">
              Deadline
              <input
                type="date"
                name="reg_deadline"
                defaultValue={league.reg_deadline}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500"
            >
              Save
            </button>
          </form>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Shareable registration link</h2>
        <p className="mb-3 mt-1 text-sm text-zinc-500">
          Send this to team captains so they can register their teams.
        </p>
        <CopyField value={registerUrl} />
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Teams</h2>
          <a
            href={`/organizer/leagues/${league.id}/export`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500"
          >
            Export rosters (CSV)
          </a>
        </div>

        {active.length === 0 && waitlisted.length === 0 && (
          <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No teams registered yet.
          </p>
        )}

        {active.length > 0 && (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {active.map((t) => {
              const c = counts.get(t.id) ?? 0
              const s = rosterStatus(c, league.roster_min, league.roster_max)
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-zinc-500">{t.captain_email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500">
                      {c}/{league.roster_max}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}
                    >
                      {s.label}
                    </span>
                    <form action={withdrawTeam}>
                      <input type="hidden" name="team_id" value={t.id} />
                      <input type="hidden" name="league_id" value={league.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        Withdraw
                      </button>
                    </form>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {waitlisted.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold">
            Waitlist{' '}
            <span className="font-normal text-zinc-500">
              (in order — promote when a spot opens)
            </span>
          </h2>
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {waitlisted.map((t) => {
              const c = counts.get(t.id) ?? 0
              const s = rosterStatus(c, league.roster_min, league.roster_max)
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-zinc-400">
                      #{t.waitlist_position}
                    </span>
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-zinc-500">{t.captain_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500">
                      {c}/{league.roster_max}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}
                    >
                      {s.label}
                    </span>
                    <form action={promoteTeam}>
                      <input type="hidden" name="team_id" value={t.id} />
                      <input type="hidden" name="league_id" value={league.id} />
                      <button
                        type="submit"
                        className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        Promote
                      </button>
                    </form>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </main>
  )
}
