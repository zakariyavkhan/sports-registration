'use client'

import { useActionState } from 'react'
import { sendPlayerMagicLink } from '@/lib/actions/roster'
import type { MagicLinkState } from '@/lib/actions/auth'

const field =
  'rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100'

export function PlayerJoinForm({ joinCode }: { joinCode: string }) {
  const [state, action, pending] = useActionState<MagicLinkState, FormData>(
    sendPlayerMagicLink,
    {}
  )

  if (state.sent) {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        Check <span className="font-medium">{state.email}</span> for a link.
        Open it to confirm your spot on the roster.
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="join_code" value={joinCode} />
      <label className="flex flex-col gap-1 text-sm font-medium">
        Full name
        <input name="player_name" required placeholder="Jordan Lee" className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Student email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@school.edu"
          className={field}
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="waiver" required className="mt-0.5" />
        <span className="text-zinc-600 dark:text-zinc-400">
          I acknowledge that I participate at my own risk and release the
          organizers from liability for injuries sustained during play.
        </span>
      </label>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? 'Sending…' : 'Join roster'}
      </button>
      <p className="text-xs text-zinc-500">
        We&apos;ll email you a one-time link — clicking it confirms your spot. No
        password needed.
      </p>
    </form>
  )
}
