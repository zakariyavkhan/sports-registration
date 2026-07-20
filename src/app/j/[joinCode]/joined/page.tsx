import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function JoinedPage({
  params,
}: {
  params: Promise<{ joinCode: string }>
}) {
  const { joinCode } = await params
  const supabase = await createClient()

  const { data: rows } = await supabase.rpc('join_info', {
    p_join_code: joinCode,
  })
  const info = rows?.[0]
  if (!info) redirect('/')

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
    </main>
  )
}
