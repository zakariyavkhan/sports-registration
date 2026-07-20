import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isRegistrationOpen } from '@/lib/auth'
import { PlayerJoinForm } from './PlayerJoinForm'

export default async function JoinPage({
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
  if (!info) notFound()

  const confirmed = Number(info.confirmed_count)
  const open = isRegistrationOpen({
    status: info.league_status,
    reg_deadline: info.reg_deadline,
  })
  const full = confirmed >= info.roster_max
  const withdrawn = info.admission_status === 'withdrawn'
  const canJoin = open && !full && !withdrawn

  const blockedReason = withdrawn
    ? 'This team has withdrawn from the league.'
    : !open
      ? 'Registration for this league is closed.'
      : full
        ? 'This team’s roster is full.'
        : null

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div>
        <p className="text-sm font-medium text-zinc-500">Join a team</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {info.team_name}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {info.sport} · {info.division} · {confirmed}/{info.roster_max} players
          {info.admission_status === 'waitlisted' && ' · team is waitlisted'}
        </p>
      </div>

      {canJoin ? (
        <PlayerJoinForm joinCode={joinCode} />
      ) : (
        <div className="rounded-lg border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {blockedReason}
        </div>
      )}
    </main>
  )
}
