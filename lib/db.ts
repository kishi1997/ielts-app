import { neon } from '@neondatabase/serverless'
import type { Exercise } from './types'

const sql = neon(process.env.DATABASE_URL!)

export async function getExercisesByDate(date: string): Promise<Exercise[] | null> {
  const rows = await sql`
    SELECT exercises FROM daily_exercises WHERE date = ${date}
  `
  if (rows.length === 0) return null
  return rows[0].exercises as Exercise[]
}

export async function getAllDates(): Promise<string[]> {
  const rows = await sql`
    SELECT date::text FROM daily_exercises ORDER BY date DESC
  `
  return rows.map((r) => r.date)
}

export async function exerciseExistsForDate(date: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM daily_exercises WHERE date = ${date}
  `
  return rows.length > 0
}

export async function saveExercises(date: string, exercises: Exercise[]): Promise<void> {
  await sql`
    INSERT INTO daily_exercises (date, exercises)
    VALUES (${date}, ${JSON.stringify(exercises)})
  `
}
