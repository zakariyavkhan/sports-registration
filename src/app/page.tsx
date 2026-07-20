import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-20">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Intramural team registration
        </h1>
        <p className="mt-3 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Stand up a league, let captains register teams, and let players join a
          roster with one link — no spreadsheets.
        </p>
      </div>
      <div>
        <Link
          href="/organizer"
          className="inline-flex items-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Organizer sign in →
        </Link>
        <p className="mt-3 text-sm text-zinc-500">
          Captains and players: open the link your organizer shared with you.
        </p>
      </div>
    </main>
  )
}
