import Link from 'next/link'

export function Notice({
  title,
  body,
  href,
  linkLabel = '← Back',
}: {
  title: string
  body: string
  href: string
  linkLabel?: string
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
      <Link
        href={href}
        className="text-sm text-zinc-900 underline dark:text-zinc-100"
      >
        {linkLabel}
      </Link>
    </main>
  )
}
