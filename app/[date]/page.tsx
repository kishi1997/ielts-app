import { notFound } from 'next/navigation'
import AppHeader from '@/components/AppHeader'
import ExerciseSession from '@/components/ExerciseSession'
import { getCurrentUserOrRedirect } from '@/lib/current-user'
import { getAllDates, getExercisesByDate } from '@/lib/db'

interface Props {
  params: Promise<{ date: string }>
}

export const dynamic = 'force-dynamic'

export default async function ExercisePage({ params }: Props) {
  const user = await getCurrentUserOrRedirect()

  const { date } = await params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()

  const [content, dates] = await Promise.all([getExercisesByDate(date), getAllDates()])
  if (!content) notFound()

  const index = dates.indexOf(date)
  const newerDate = index > 0 ? dates[index - 1] : null
  const olderDate = index >= 0 && index < dates.length - 1 ? dates[index + 1] : null

  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader active="practice" userName={user.name} />
      <ExerciseSession content={content} currentDate={date} olderDate={olderDate} newerDate={newerDate} />
    </div>
  )
}
