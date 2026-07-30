import { ensurePreviewUserIfNeeded, getCurrentUserOrRedirect } from '@/lib/current-user'
import { exerciseExistsForDate, markQuestComplete } from '@/lib/db'

interface CompletionReference {
  sourceDate: string
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  return origin === null || origin === new URL(request.url).origin
}

function isCompletionReference(value: unknown): value is CompletionReference {
  if (typeof value !== 'object' || value === null) return false
  const body = value as Record<string, unknown>
  return typeof body.sourceDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.sourceDate)
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'Invalid origin' }, { status: 403 })

  const user = await getCurrentUserOrRedirect()
  await ensurePreviewUserIfNeeded(user)

  const body: unknown = await request.json()
  if (!isCompletionReference(body)) {
    return Response.json({ error: 'Invalid completion reference' }, { status: 400 })
  }

  const exists = await exerciseExistsForDate(body.sourceDate)
  if (!exists) return Response.json({ error: 'Exercise not found' }, { status: 404 })

  await markQuestComplete(user.id, { sourceDate: body.sourceDate })
  return Response.json({ completed: true })
}
