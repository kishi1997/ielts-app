import { notFound } from 'next/navigation'
import { getExercisesByDate, getAllDates } from '@/lib/db'
import ExerciseSession from '@/components/ExerciseSession'

interface Props {
  params: Promise<{ date: string }>
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  try {
    const dates = await getAllDates()
    return dates.map((date) => ({ date }))
  } catch {
    return []
  }
}

export default async function ExercisePage({ params }: Props) {
  const { date } = await params

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()

  const content = await getExercisesByDate(date)
  if (!content) notFound()

  return <ExerciseSession content={content} />
}
