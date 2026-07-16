import { neon } from '@neondatabase/serverless'
import type { DailyContent } from './types'

type SqlFunc = ReturnType<typeof neon>

let sql: SqlFunc | null = null

function getSql(): SqlFunc {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    sql = neon(process.env.DATABASE_URL)
  }
  return sql
}

export async function getExercisesByDate(date: string): Promise<DailyContent | null> {
  const rows = await getSql()`
    SELECT exercises FROM daily_exercises WHERE date = ${date}
  ` as any[]
  if (rows.length === 0) return null
  return rows[0].exercises as DailyContent
}

export async function getAllDates(): Promise<string[]> {
  const rows = await getSql()`
    SELECT date::text FROM daily_exercises ORDER BY date DESC
  ` as any[]
  return rows.map((r) => r.date)
}

export async function exerciseExistsForDate(date: string): Promise<boolean> {
  const rows = await getSql()`
    SELECT 1 FROM daily_exercises WHERE date = ${date}
  ` as any[]
  return rows.length > 0
}

export async function saveExercises(date: string, content: DailyContent): Promise<void> {
  await getSql()`
    INSERT INTO daily_exercises (date, exercises)
    VALUES (${date}, ${JSON.stringify(content)})
  `
}
