'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { MissedProblem } from '@/lib/types'

export default function ReviewList({ initialProblems }: { initialProblems: MissedProblem[] }) {
  const [problems, setProblems] = useState(initialProblems)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)

  async function resolve(problem: MissedProblem) {
    setBusyId(problem.id)
    setErrorId(null)

    try {
      const response = await fetch('/api/missed-problems', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: problem.id }),
      })
      if (!response.ok) throw new Error('Failed to resolve')
      setProblems((current) => current.filter((item) => item.id !== problem.id))
    } catch {
      setErrorId(problem.id)
    } finally {
      setBusyId(null)
    }
  }

  if (problems.length === 0) {
    return (
      <div className="game-card p-6 text-center sm:p-10">
        <p className="text-5xl" aria-hidden="true">✨</p>
        <h2 className="mt-4 text-xl font-black text-fg">復習ボックスは空っぽ！</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fg-soft">練習中に迷った問題を保存すると、ここで解説つきで振り返れます。</p>
        <Link href="/" className="game-button mt-6 inline-flex">今日の練習へ</Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {problems.map((problem, index) => (
        <article key={problem.id} className="game-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/7 bg-surface-2/55 px-5 py-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-300">
                {problem.problemType === 'vocab' ? 'Vocabulary' : 'Writing'} · 復習 {index + 1}
              </p>
              <h2 className="mt-1 break-words text-lg font-black text-fg">{problem.title}</h2>
            </div>
            <Link href={`/${problem.sourceDate}`} className="shrink-0 rounded-xl border border-border px-3 py-2 text-xs font-bold text-jp hover:bg-jp-bg">
              {problem.sourceDate}
            </Link>
          </div>

          <div className="space-y-4 p-5">
            <section className="rounded-2xl border border-jp/25 bg-jp-bg p-4">
              <p className="label-text text-jp">問題</p>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-fg">{problem.prompt}</p>
            </section>
            <section className="rounded-2xl border border-answer/25 bg-answer-bg p-4">
              <p className="label-text text-answer">答え</p>
              <p className="mt-2 whitespace-pre-line break-words font-serif text-base leading-7 text-fg">{problem.answer}</p>
            </section>
            <section className="rounded-2xl border border-tip/25 bg-tip-bg p-4">
              <p className="label-text text-tip">解説・次に見るポイント</p>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-fg-soft">{problem.explanation}</p>
            </section>

            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-fg-faint">自分の言葉で説明できたらクリア。</p>
              <button
                type="button"
                onClick={() => resolve(problem)}
                disabled={busyId === problem.id}
                className="game-button min-h-11 whitespace-normal"
              >
                {busyId === problem.id ? '更新中…' : '✓ できるようになった'}
              </button>
            </div>
            {errorId === problem.id ? <p className="text-right text-xs font-bold text-error">更新できませんでした。もう一度お試しください。</p> : null}
          </div>
        </article>
      ))}
    </div>
  )
}
