import { redirect } from 'next/navigation'
import { getAllDates } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const dates = await getAllDates()

  if (dates.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-4 text-center text-sm text-fg-soft">
        <div className="max-w-sm rounded-lg border border-border bg-surface p-6">
          <h1 className="text-lg font-bold text-fg">No exercises yet</h1>
          <p className="mt-2 leading-relaxed">
            Run /ielts-daily to generate today&apos;s exercises.
          </p>
        </div>
      </main>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const target = dates.includes(today) ? today : dates[0]
  redirect(`/${target}`)
}
