import { NextRequest, NextResponse } from 'next/server'
import { exerciseExistsForDate, saveExercises } from '@/lib/db'
import type { DailyContent, SentenceQuestion, VocabQuestion } from '@/lib/types'

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${process.env.IELTS_API_SECRET}`
}

function isValidVocabQuestion(q: unknown): q is VocabQuestion {
  if (typeof q !== 'object' || q === null) return false
  const v = q as Record<string, unknown>
  return (
    typeof v.order === 'number' &&
    typeof v.word === 'string' &&
    Array.isArray(v.choices) &&
    v.choices.length === 4 &&
    v.choices.every((c) => typeof c === 'string') &&
    typeof v.answerIndex === 'number' &&
    v.answerIndex >= 0 &&
    v.answerIndex < 4
  )
}

function isValidSentenceQuestion(q: unknown): q is SentenceQuestion {
  if (typeof q !== 'object' || q === null) return false
  const s = q as Record<string, unknown>
  return (
    typeof s.order === 'number' &&
    typeof s.word === 'string' &&
    typeof s.ja_sentence === 'string' &&
    typeof s.model_answer === 'string' &&
    (s.tips === undefined || typeof s.tips === 'string')
  )
}

function isValidDailyContent(body: unknown): body is DailyContent {
  if (typeof body !== 'object' || body === null) return false
  const content = body as Record<string, unknown>
  if (!Array.isArray(content.vocab) || content.vocab.length !== 10) return false
  if (!content.vocab.every(isValidVocabQuestion)) return false
  if (!Array.isArray(content.sentences)) return false
  if (content.sentences.length < 3 || content.sentences.length > 4) return false
  if (!content.sentences.every(isValidSentenceQuestion)) return false
  return true
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }
  const exists = await exerciseExistsForDate(date)
  return NextResponse.json({ exists })
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as { date: string; vocab?: unknown; sentences?: unknown }
  const { date } = body

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }
  if (!isValidDailyContent({ vocab: body.vocab, sentences: body.sentences })) {
    return NextResponse.json(
      { error: 'Body must include vocab (10 items) and sentences (3-4 items) matching the DailyContent schema' },
      { status: 400 },
    )
  }

  const exists = await exerciseExistsForDate(date)
  if (exists) {
    return NextResponse.json({ error: 'Already exists' }, { status: 409 })
  }

  await saveExercises(date, {
    vocab: body.vocab as DailyContent['vocab'],
    sentences: body.sentences as DailyContent['sentences'],
  })
  return NextResponse.json({ success: true }, { status: 201 })
}
