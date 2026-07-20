import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: league } = await supabase
    .from('leagues')
    .select('id, sport, division')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .single()
  if (!league) return new NextResponse('Not found', { status: 404 })

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, admission_status, waitlist_position')
    .eq('league_id', id)
  const { data: roster } = await supabase
    .from('roster_entries')
    .select('team_id, player_name, player_email, is_captain')
    .eq('league_id', id)
    .eq('status', 'confirmed')

  const teamById = new Map((teams ?? []).map((t) => [t.id, t]))
  const sorted = (roster ?? []).slice().sort((a, b) => {
    const ta = teamById.get(a.team_id)?.name ?? ''
    const tb = teamById.get(b.team_id)?.name ?? ''
    if (ta !== tb) return ta.localeCompare(tb)
    return Number(b.is_captain) - Number(a.is_captain)
  })

  const header = [
    'team',
    'admission_status',
    'player_name',
    'player_email',
    'role',
  ]
  const lines = [header.join(',')]
  for (const r of sorted) {
    const t = teamById.get(r.team_id)
    lines.push(
      [
        t?.name ?? '',
        t?.admission_status ?? '',
        r.player_name,
        r.player_email,
        r.is_captain ? 'captain' : 'player',
      ]
        .map((v) => csvCell(String(v)))
        .join(',')
    )
  }

  const filename = `${league.sport}-${league.division}-rosters.csv`
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')

  return new NextResponse(lines.join('\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
    },
  })
}
