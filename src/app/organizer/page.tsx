import Link from 'next/link'
import { requireOrganizer } from '@/lib/organizer'
import { SignOutButton } from '@/components/SignOutButton'

export default async function OrganizerDashboard() {
  const { supabase, email } = await requireOrganizer()

  const { data: leagues } = await supabase
    .from('leagues')
    .select('id, sport, division, roster_min, roster_max, reg_deadline, status')
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your leagues</h1>
          <p className="text-sm text-zinc-500">{email}</p>
        </div>
        <SignOutButton />
      </header>

      <Link
        href="/organizer/leagues/new"
        className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        + New league
      </Link>

      <div className="mt-8 flex flex-col gap-3">
        {!leagues?.length && (
          <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No leagues yet. Create your first one to get a shareable
            registration link.
          </p>
        )}
        {leagues?.map((l) => (
          <Link
            key={l.id}
            href={`/organizer/leagues/${l.id}`}
            className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <div>
              <p className="font-medium">
                {l.sport}{' '}
                <span className="font-normal text-zinc-500">· {l.division}</span>
              </p>
              <p className="text-sm text-zinc-500">
                Roster {l.roster_min}–{l.roster_max} · deadline {l.reg_deadline}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                l.status === 'open'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {l.status}
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
