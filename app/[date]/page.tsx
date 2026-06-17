import { notFound } from 'next/navigation'
import { getExercisesByDate, getAllDates } from '@/lib/db'
import ExerciseCard from '@/components/ExerciseCard'
import DateNav from '@/components/DateNav'

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

  const exercises = await getExercisesByDate(date)
  if (!exercises) notFound()

  const allDates = await getAllDates()
  const currentIndex = allDates.indexOf(date)
  const prevDate = allDates[currentIndex + 1] ?? null
  const nextDate = currentIndex > 0 ? allDates[currentIndex - 1] : null

  return (
    <main className="max-w-xl mx-auto px-1.5 pb-8">
      <div className="pt-3 pb-1 px-1">
        <h1 className="text-base font-bold">IELTS Writing Practice</h1>
        <p className="text-xs text-gray-400 mt-0.5">{date} · 10 Exercises</p>
      </div>

      <DateNav date={date} prevDate={prevDate} nextDate={nextDate} />

      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.order} exercise={exercise} />
      ))}
    </main>
  )
}
