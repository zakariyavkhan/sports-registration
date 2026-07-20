'use client'

import { useActionState } from 'react'
import { sendCaptainMagicLink } from '@/lib/actions/teams'
import type { MagicLinkState } from '@/lib/actions/auth'

const field =
  'rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100'

export function CaptainRegisterForm({ leagueId }: { leagueId: string }) {
  const [state, action, pending] = useActionState<MagicLinkState, FormData>(
    sendCaptainMagicLink,
    {}
  )

  if (state.sent) {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        Check <span className="font-medium">{state.email}</span> for a sign-in
        link. Open it to finish creating your team.
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="league_id" value={leagueId} />
      <label className="flex flex-col gap-1 text-sm font-medium">
        Team name
        <input
          name="team_name"
          required
          placeholder="Court Kings"
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Your email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@school.edu"
          className={field}
        />
      </label>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? 'Sending…' : 'Register team'}
      </button>
      <p className="text-xs text-zinc-500">
        We&apos;ll email you a one-time link. Clicking it creates your team and
        makes you the captain — no password needed.
      </p>
    </form>
  )
}
