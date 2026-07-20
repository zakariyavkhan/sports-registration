import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { removeRosterEntry } from '@/lib/actions/roster'
import { ActionForm } from '@/components/ActionForm'

export default async function JoinedPage({
  params,
}: {
  params: Promise<{ joinCode: string }>
}) {
  const { joinCode } = await params
  const { supabase, user } = await getUser()

  const { data: rows } = await supabase.rpc('join_info', {
    p_join_code: joinCode,
  })
  const info = rows?.[0]
  if (!info) redirect('/')

  // The player's own confirmed entry on this team (RLS returns only their own).
  let myEntryId: string | null = null
  if (user?.email) {
    const { data: entry } = await supabase
      .from('roster_entries')
      .select('id')
      .eq('team_id', info.team_id)
      .eq('player_email', user.email)
      .eq('status', 'confirmed')
      .maybeSingle()
    myEntryId = entry?.id ?? null
  }

  if (!myEntryId) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">
          You&apos;ve left the roster
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You&apos;re no longer on {info.team_name}. You can join another team in
          this league if you&apos;d like.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl dark:bg-emerald-950">
        ✓
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        You&apos;re on the roster
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        You&apos;ve joined <span className="font-medium">{info.team_name}</span>{' '}
        ({info.sport} · {info.division}). Your captain can see you on the roster.
      </p>
      {info.admission_status === 'waitlisted' && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Heads up: this team is currently on the league waitlist. You&apos;re
          set on the roster and ready if a spot opens up.
        </p>
      )}
      <ActionForm action={removeRosterEntry} className="mt-2">
        <input type="hidden" name="entry_id" value={myEntryId} />
        <input
          type="hidden"
          name="revalidate"
          value={`/j/${joinCode}/joined`}
        />
        <button
          type="submit"
          className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
        >
          Leave this team
        </button>
      </ActionForm>
    </main>
  )
}
