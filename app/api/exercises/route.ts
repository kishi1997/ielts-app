import { NextRequest, NextResponse } from 'next/server'
import { isAuthBypassEnabled } from '@/lib/current-user'
import { exerciseExistsForDate, saveExercises } from '@/lib/db'
import type { DailyContent, SentenceQuestion, VocabQuestion } from '@/lib/types'

const MAX_BODY_BYTES = 120_000

async function digestText(value: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
}

async function timingSafeTextEqual(a: string, b: string): Promise<boolean> {
  const [aDigest, bDigest] = await Promise.all([digestText(a), digestText(b)])
  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (a: ArrayBuffer | ArrayBufferView, b: ArrayBuffer | ArrayBufferView) => boolean
  }
  if (subtle.timingSafeEqual) {
    return subtle.timingSafeEqual(aDigest, bDigest)
  }

  const aBytes = new Uint8Array(aDigest)
  const bBytes = new Uint8Array(bDigest)
  let diff = aBytes.length ^ bBytes.length
  for (let index = 0; index < Math.max(aBytes.length, bBytes.length); index += 1) {
    diff |= (aBytes[index] ?? 0) ^ (bBytes[index] ?? 0)
  }
  return diff === 0
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  if (isAuthBypassEnabled()) return true
  const expected = process.env.IELTS_API_SECRET
  const auth = request.headers.get('Authorization')
  if (!expected || !auth?.startsWith('Bearer ')) return false
  return timingSafeTextEqual(auth.slice('Bearer '.length), expected)
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
    v.answerIndex < 4 &&
    (v.meaning === undefined || typeof v.meaning === 'string') &&
    (v.etymology === undefined || typeof v.etymology === 'string') &&
    (v.synonyms === undefined || typeof v.synonyms === 'string') &&
    (v.usageTip === undefined || typeof v.usageTip === 'string') &&
    (v.mnemonic === undefined || typeof v.mnemonic === 'string') &&
    (v.example === undefined || typeof v.example === 'string') &&
    (v.exampleJa === undefined || typeof v.exampleJa === 'string')
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
    (s.tips === undefined || typeof s.tips === 'string') &&
    (s.explanation === undefined || typeof s.explanation === 'string')
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
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request body is too large' }, { status: 413 })
  }

  let body: { date?: unknown; vocab?: unknown; sentences?: unknown }
  try {
    body = (await request.json()) as { date?: unknown; vocab?: unknown; sentences?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { date } = body

  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
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
