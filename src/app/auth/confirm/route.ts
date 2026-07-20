import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const nextParam = searchParams.get('next') ?? '/organizer'

  // Only allow same-origin redirects to avoid an open redirect.
  let next = '/organizer'
  try {
    const nextUrl = nextParam.startsWith('http')
      ? new URL(nextParam)
      : new URL(nextParam, origin)
    if (nextUrl.origin === origin) next = nextUrl.pathname + nextUrl.search
  } catch {
    // keep default
  }

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) return NextResponse.redirect(new URL(next, origin))
  }

  return NextResponse.redirect(new URL('/login?error=link', origin))
}
