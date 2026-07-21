import { ensurePreviewUserIfNeeded, getCurrentUserOrRedirect } from '@/lib/current-user'
import { addMissedProblem, getExercisesByDate, resolveMissedProblem } from '@/lib/db'
import type { ProblemType } from '@/lib/types'

interface ProblemReference {
  sourceDate: string
  problemType: ProblemType
  problemOrder: number
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  return origin === null || origin === new URL(request.url).origin
}

function isProblemReference(value: unknown): value is ProblemReference {
  if (typeof value !== 'object' || value === null) return false
  const body = value as Record<string, unknown>
  return (
    typeof body.sourceDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(body.sourceDate) &&
    (body.problemType === 'vocab' || body.problemType === 'sentence') &&
    Number.isInteger(body.problemOrder) &&
    Number(body.problemOrder) > 0
  )
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'Invalid origin' }, { status: 403 })

  const user = await getCurrentUserOrRedirect()
  await ensurePreviewUserIfNeeded(user)

  const body: unknown = await request.json()
  if (!isProblemReference(body)) {
    return Response.json({ error: 'Invalid problem reference' }, { status: 400 })
  }

  const content = await getExercisesByDate(body.sourceDate)
  if (!content) return Response.json({ error: 'Exercise not found' }, { status: 404 })

  if (body.problemType === 'vocab') {
    const problem = content.vocab.find((item) => item.order === body.problemOrder)
    if (!problem) return Response.json({ error: 'Problem not found' }, { status: 404 })

    const explanation = [
      problem.meaning && `意味: ${problem.meaning}`,
      problem.example && `例文: ${problem.example}`,
      problem.etymology && `語源: ${problem.etymology}`,
      problem.mnemonic && `覚え方: ${problem.mnemonic}`,
    ].filter(Boolean).join('\n') || '正解の意味と選択肢を見比べて、もう一度声に出して確認しよう。'

    await addMissedProblem(user.id, {
      problemKey: `${body.sourceDate}:vocab:${problem.order}`,
      sourceDate: body.sourceDate,
      problemType: 'vocab',
      problemOrder: problem.order,
      title: problem.word,
      prompt: `${problem.word} の意味として最も近いものを選ぶ`,
      answer: problem.choices[problem.answerIndex] ?? problem.meaning ?? '',
      explanation,
    })
  } else {
    const problem = content.sentences.find((item) => item.order === body.problemOrder)
    if (!problem) return Response.json({ error: 'Problem not found' }, { status: 404 })

    await addMissedProblem(user.id, {
      problemKey: `${body.sourceDate}:sentence:${problem.order}`,
      sourceDate: body.sourceDate,
      problemType: 'sentence',
      problemOrder: problem.order,
      title: `${problem.word} を使う英作文`,
      prompt: problem.ja_sentence,
      answer: problem.model_answer,
      explanation: problem.explanation || problem.tips || '日本語とモデル答案を対応させ、使える表現を一つ書き出そう。',
    })
  }

  return Response.json({ saved: true }, { status: 201 })
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'Invalid origin' }, { status: 403 })

  const user = await getCurrentUserOrRedirect()

  const body: unknown = await request.json()
  if (typeof body !== 'object' || body === null || typeof (body as { id?: unknown }).id !== 'string') {
    return Response.json({ error: 'Invalid problem id' }, { status: 400 })
  }

  const resolved = await resolveMissedProblem((body as { id: string }).id, user.id)
  if (!resolved) return Response.json({ error: 'Problem not found' }, { status: 404 })
  return Response.json({ resolved: true })
}
