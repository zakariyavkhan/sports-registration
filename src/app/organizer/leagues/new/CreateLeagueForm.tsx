'use client'

import { useActionState } from 'react'
import { createLeague, type CreateLeagueState } from '@/lib/actions/leagues'

const field =
  'rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100'

export function CreateLeagueForm() {
  const [state, action, pending] = useActionState<CreateLeagueState, FormData>(
    createLeague,
    {}
  )

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Sport
        <input name="sport" required placeholder="Basketball" className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Division
        <input
          name="division"
          required
          placeholder="Recreational"
          className={field}
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Roster min
          <input
            name="roster_min"
            type="number"
            min={1}
            required
            defaultValue={5}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Roster max
          <input
            name="roster_max"
            type="number"
            min={1}
            required
            defaultValue={12}
            className={field}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Max teams{' '}
        <span className="font-normal text-zinc-500">(blank = unlimited)</span>
        <input name="max_teams" type="number" min={1} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Registration deadline
        <input name="reg_deadline" type="date" required className={field} />
      </label>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? 'Creating…' : 'Create league'}
      </button>
    </form>
  )
}
