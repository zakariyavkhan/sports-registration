import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireOrganizer } from '@/lib/organizer'
import { getOrigin } from '@/lib/origin'
import { CopyField } from '@/components/CopyField'

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

  const origin = await getOrigin()
  const registerUrl = `${origin}/l/${league.id}`

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
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

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
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
      </dl>

      <section className="mt-10">
        <h2 className="text-sm font-semibold">Shareable registration link</h2>
        <p className="mb-3 mt-1 text-sm text-zinc-500">
          Send this to team captains so they can register their teams.
        </p>
        <CopyField value={registerUrl} />
      </section>
    </main>
  )
}
