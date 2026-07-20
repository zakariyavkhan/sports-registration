import Link from 'next/link'
import { requireOrganizer } from '@/lib/organizer'
import { CreateLeagueForm } from './CreateLeagueForm'

export default async function NewLeaguePage() {
  await requireOrganizer()
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-12">
      <Link
        href="/organizer"
        className="text-sm text-zinc-500 hover:underline"
      >
        ← Your leagues
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-semibold tracking-tight">
        New league
      </h1>
      <CreateLeagueForm />
    </main>
  )
}
