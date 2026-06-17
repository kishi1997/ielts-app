import { NextRequest, NextResponse } from 'next/server'
import { exerciseExistsForDate, saveExercises } from '@/lib/db'
import type { Exercise } from '@/lib/types'

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${process.env.IELTS_API_SECRET}`
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

  const body = await request.json() as { date: string; exercises: Exercise[] }
  const { date, exercises } = body

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }
  if (!Array.isArray(exercises) || exercises.length !== 10) {
    return NextResponse.json({ error: 'exercises must be an array of 10 items' }, { status: 400 })
  }

  const exists = await exerciseExistsForDate(date)
  if (exists) {
    return NextResponse.json({ error: 'Already exists' }, { status: 409 })
  }

  await saveExercises(date, exercises)
  return NextResponse.json({ success: true }, { status: 201 })
}
