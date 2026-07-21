import { getCloudflareContext } from '@opennextjs/cloudflare'
import { isPreviewMode, PREVIEW_DAILY_CONTENT, PREVIEW_DATE } from './preview-content'
import type { DailyContent, MissedProblem, ProblemType } from './types'

interface DailyExerciseRow {
  exercises: string
}

interface DateRow {
  date: string
}

interface CountRow {
  count: number
}

interface MissedProblemRow {
  id: string
  source_date: string
  problem_type: ProblemType
  problem_order: number
  title: string
  prompt: string
  answer: string
  explanation: string
  created_at: string
  updated_at: string
}

export interface MissedProblemInput {
  problemKey: string
  sourceDate: string
  problemType: ProblemType
  problemOrder: number
  title: string
  prompt: string
  answer: string
  explanation: string
}

function getDb(): D1Database {
  return getCloudflareContext().env.DB
}

export async function ensureUser(user: { id: string; name: string; email?: string | null }): Promise<void> {
  await getDb()
    .prepare(`
      INSERT INTO users (id, name, email)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        email = COALESCE(excluded.email, users.email)
    `)
    .bind(user.id, user.name, user.email ?? null)
    .run()
}

export async function getExercisesByDate(date: string): Promise<DailyContent | null> {
  if (isPreviewMode() && date === PREVIEW_DATE) {
    return PREVIEW_DAILY_CONTENT
  }

  const row = await getDb()
    .prepare('SELECT exercises FROM daily_exercises WHERE date = ?')
    .bind(date)
    .first<DailyExerciseRow>()

  if (!row) return null
  return JSON.parse(row.exercises) as DailyContent
}

export async function getAllDates(): Promise<string[]> {
  if (isPreviewMode()) {
    return [PREVIEW_DATE]
  }

  const { results } = await getDb()
    .prepare('SELECT date FROM daily_exercises ORDER BY date DESC')
    .all<DateRow>()

  return results.map((row) => row.date)
}

export async function exerciseExistsForDate(date: string): Promise<boolean> {
  if (isPreviewMode() && date === PREVIEW_DATE) {
    return true
  }

  const row = await getDb()
    .prepare('SELECT 1 AS found FROM daily_exercises WHERE date = ? LIMIT 1')
    .bind(date)
    .first<{ found: number }>()
  return row !== null
}

export async function saveExercises(date: string, content: DailyContent): Promise<void> {
  await getDb()
    .prepare('INSERT INTO daily_exercises (date, exercises) VALUES (?, ?)')
    .bind(date, JSON.stringify(content))
    .run()
}

export async function getActiveMissedProblems(userId: string): Promise<MissedProblem[]> {
  const { results } = await getDb()
    .prepare(`
      SELECT id, source_date, problem_type, problem_order, title, prompt, answer,
             explanation, created_at, updated_at
      FROM missed_problems
      WHERE user_id = ? AND resolved_at IS NULL
      ORDER BY updated_at DESC
    `)
    .bind(userId)
    .all<MissedProblemRow>()

  return results.map(mapMissedProblem)
}

export async function getActiveMissedProblemCount(userId: string): Promise<number> {
  const row = await getDb()
    .prepare(`
      SELECT COUNT(*) AS count
      FROM missed_problems
      WHERE user_id = ? AND resolved_at IS NULL
    `)
    .bind(userId)
    .first<CountRow>()

  return row?.count ?? 0
}

export async function addMissedProblem(
  userId: string,
  input: MissedProblemInput,
): Promise<void> {
  await getDb()
    .prepare(`
      INSERT INTO missed_problems (
        id, user_id, problem_key, source_date, problem_type, problem_order,
        title, prompt, answer, explanation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, problem_key) DO UPDATE SET
        title = excluded.title,
        prompt = excluded.prompt,
        answer = excluded.answer,
        explanation = excluded.explanation,
        resolved_at = NULL,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    `)
    .bind(
      crypto.randomUUID(),
      userId,
      input.problemKey,
      input.sourceDate,
      input.problemType,
      input.problemOrder,
      input.title,
      input.prompt,
      input.answer,
      input.explanation,
    )
    .run()
}

export async function resolveMissedProblem(id: string, userId: string): Promise<boolean> {
  const result = await getDb()
    .prepare(`
      UPDATE missed_problems
      SET resolved_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ? AND user_id = ? AND resolved_at IS NULL
    `)
    .bind(id, userId)
    .run()

  return (result.meta.changes ?? 0) > 0
}

function mapMissedProblem(row: MissedProblemRow): MissedProblem {
  return {
    id: row.id,
    sourceDate: row.source_date,
    problemType: row.problem_type,
    problemOrder: row.problem_order,
    title: row.title,
    prompt: row.prompt,
    answer: row.answer,
    explanation: row.explanation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
