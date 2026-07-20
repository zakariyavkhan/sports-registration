import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { Notice } from '@/components/Notice'

export default async function JoinConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ joinCode: string }>
  searchParams: Promise<{ name?: string }>
}) {
  const { joinCode } = await params
  const { name } = await searchParams

  const { supabase, user } = await getUser()
  if (!user?.email) redirect(`/j/${joinCode}`)

  const { data: rows } = await supabase.rpc('join_info', {
    p_join_code: joinCode,
  })
  const info = rows?.[0]
  if (!info) redirect('/')

  // Idempotency + one-team-per-league messaging.
  const { data: existing } = await supabase
    .from('roster_entries')
    .select('team_id')
    .eq('league_id', info.league_id)
    .eq('player_email', user.email)
    .eq('status', 'confirmed')
    .maybeSingle()
  if (existing) {
    if (existing.team_id === info.team_id) redirect(`/j/${joinCode}/joined`)
    return (
      <Notice
        title="Already registered"
        body="You're already on another team in this league — you can only join one team per league."
        href={`/j/${joinCode}`}
      />
    )
  }

  const playerName = (name ?? '').trim() || user.email.split('@')[0]
  const { error } = await supabase.from('roster_entries').insert({
    team_id: info.team_id,
    player_email: user.email,
    player_name: playerName,
    is_captain: false,
  })

  if (error) {
    const body =
      error.code === '23505'
        ? "You're already on a team in this league."
        : error.message
    return <Notice title="Couldn't join" body={body} href={`/j/${joinCode}`} />
  }

  redirect(`/j/${joinCode}/joined`)
}
