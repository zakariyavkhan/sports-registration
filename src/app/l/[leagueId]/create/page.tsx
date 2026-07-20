import { redirect } from 'next/navigation'
import { getUser, isRegistrationOpen } from '@/lib/auth'
import { Notice } from '@/components/Notice'

export default async function CreateTeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ leagueId: string }>
  searchParams: Promise<{ name?: string }>
}) {
  const { leagueId } = await params
  const { name } = await searchParams
  const teamName = (name ?? '').trim()

  const { supabase, user } = await getUser()
  if (!user?.email) redirect(`/l/${leagueId}`)
  if (!teamName) redirect(`/l/${leagueId}`)

  // Idempotency: if this captain already has a spot in the league, go to it
  // rather than creating a second team (also makes refresh safe).
  const { data: existing } = await supabase
    .from('roster_entries')
    .select('team_id')
    .eq('league_id', leagueId)
    .eq('player_email', user.email)
    .eq('status', 'confirmed')
    .maybeSingle()
  if (existing) redirect(`/t/${existing.team_id}`)

  const { data: league } = await supabase
    .from('leagues')
    .select('status, reg_deadline')
    .eq('id', leagueId)
    .single()
  if (!league) redirect('/')

  if (!isRegistrationOpen(league)) {
    return (
      <Notice
        title="Registration closed"
        body="This league is no longer accepting new teams."
        href={`/l/${leagueId}`}
      />
    )
  }

  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .insert({ league_id: leagueId, name: teamName, captain_email: user.email })
    .select('id')
    .single()
  if (teamErr || !team) {
    return (
      <Notice
        title="Couldn't create team"
        body={teamErr?.message ?? 'Please try again.'}
        href={`/l/${leagueId}`}
      />
    )
  }

  const { error: rosterErr } = await supabase.from('roster_entries').insert({
    team_id: team.id,
    player_email: user.email,
    player_name: user.email.split('@')[0],
    is_captain: true,
  })
  if (rosterErr) {
    // Roll back the orphan team (e.g. captain already in league via a race).
    await supabase.from('teams').delete().eq('id', team.id)
    return (
      <Notice
        title="Couldn't create team"
        body={rosterErr.message}
        href={`/l/${leagueId}`}
      />
    )
  }

  redirect(`/t/${team.id}`)
}
