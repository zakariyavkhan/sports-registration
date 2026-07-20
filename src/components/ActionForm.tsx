'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

/**
 * A form bound to a server action that refreshes the current route once the
 * action resolves, so mutations paint immediately without a manual reload.
 */
export function ActionForm({
  action,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<void>
  children: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
          await action(formData)
          router.refresh()
        })
      }}
    >
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  )
}
