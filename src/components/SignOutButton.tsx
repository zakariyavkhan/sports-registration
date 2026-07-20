'use client'

import { signOut } from '@/lib/actions/auth'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-zinc-500 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
      >
        Sign out
      </button>
    </form>
  )
}
