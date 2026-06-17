import { redirect } from 'next/navigation'
import { getAllDates } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const dates = await getAllDates()

  if (dates.length === 0) {
    return (
      <main className="max-w-xl mx-auto px-3 pt-8 text-center text-gray-400 text-sm">
        No exercises yet. Run /ielts-daily to generate today&apos;s exercises.
      </main>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const target = dates.includes(today) ? today : dates[0]
  redirect(`/${target}`)
}
