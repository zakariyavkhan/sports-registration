import Link from 'next/link'
import { MagicLinkForm } from '@/components/MagicLinkForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div>
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Organizer sign in
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Enter your email and we&apos;ll send you a one-time sign-in link.
        </p>
      </div>
      {error === 'link' && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          That sign-in link was invalid or expired. Request a new one below.
        </p>
      )}
      <MagicLinkForm next="/organizer" buttonLabel="Send sign-in link" />
    </main>
  )
}
