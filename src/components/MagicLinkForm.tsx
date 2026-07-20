'use client'

import { useActionState } from 'react'
import { sendMagicLink, type MagicLinkState } from '@/lib/actions/auth'

export function MagicLinkForm({
  next = '/organizer',
  emailLabel = 'Email',
  buttonLabel = 'Send magic link',
  hiddenFields,
}: {
  next?: string
  emailLabel?: string
  buttonLabel?: string
  hiddenFields?: Record<string, string>
}) {
  const [state, action, pending] = useActionState<MagicLinkState, FormData>(
    sendMagicLink,
    {}
  )

  if (state.sent) {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        Check <span className="font-medium">{state.email}</span> for a sign-in
        link. Open it to continue.
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      {hiddenFields &&
        Object.entries(hiddenFields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      <label className="flex flex-col gap-1 text-sm font-medium">
        {emailLabel}
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@school.edu"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100"
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
        {pending ? 'Sending…' : buttonLabel}
      </button>
    </form>
  )
}
