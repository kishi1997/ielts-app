'use client'

import type { ReactNode } from 'react'
import type { VocabQuestion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import MissedProblemButton from '@/components/MissedProblemButton'

interface Props {
  sourceDate: string
  question: VocabQuestion
  prompt: string
  choices: string[]
  answerIndex: number
  mode: 'meaning' | 'word'
  roundNumber: number
  selectedIndex: number | null
  onSelect: (choiceIndex: number) => void
  onNext: () => void
}

export default function VocabQuiz({
  sourceDate,
  question,
  prompt,
  choices,
  answerIndex,
  mode,
  roundNumber,
  selectedIndex,
  onSelect,
  onNext,
}: Props) {
  const isAnswered = selectedIndex !== null
  const isCorrect = selectedIndex === answerIndex

  const notes: { label: string; value: ReactNode }[] = isAnswered
    ? [
        { label: 'Meaning', value: question.meaning },
        {
          label: 'Example',
          value: question.example ? (
            <span className="space-y-1">
              <span className="block font-serif text-base leading-relaxed text-fg">
                {question.example}
              </span>
              {question.exampleJa ? (
                <span className="block leading-relaxed text-fg-soft">
                  （{question.exampleJa}）
                </span>
              ) : null}
            </span>
          ) : null,
        },
        { label: 'Etymology', value: question.etymology },
        { label: 'Memory', value: question.mnemonic },
      ].flatMap((n) => (n.value ? [{ label: n.label, value: n.value }] : []))
    : []

  function choiceClasses(choiceIndex: number) {
    if (!isAnswered) {
      return 'border-border bg-surface text-fg hover:bg-surface-2'
    }
    if (choiceIndex === answerIndex) {
      return 'border-answer/40 bg-answer-bg text-answer'
    }
    if (choiceIndex === selectedIndex) {
      return 'border-error/40 bg-error-bg text-error'
    }
    return 'border-border bg-surface text-fg-faint'
  }

  return (
    <article className="game-card p-4 sm:p-5">
      <div className="mb-5">
        <p className="label-text text-fg-faint">
          {mode === 'word' ? 'Reverse Quiz' : 'Vocabulary Quiz'}
          {roundNumber > 1 ? ` · Round ${roundNumber}` : ''}
        </p>
        <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-fg">
          {prompt}
        </h2>
        {mode === 'word' ? (
          <p className="mt-2 text-sm leading-6 text-fg-soft">
            Pick the English word that matches this meaning.
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        {choices.map((choice, choiceIndex) => (
          <button
            key={choice}
            type="button"
            onClick={() => onSelect(choiceIndex)}
            disabled={isAnswered}
            className={`w-full rounded-lg border px-4 py-3 text-left text-base font-bold transition-colors disabled:cursor-not-allowed ${choiceClasses(choiceIndex)}`}
          >
            {choice}
          </button>
        ))}
      </div>

      {isAnswered ? (
        <div className="mt-5 space-y-4">
          <div className={`rounded-lg border p-4 ${isCorrect ? 'border-answer/30 bg-answer-bg' : 'border-error/35 bg-error-bg'}`}>
            <p className={`text-sm font-black ${isCorrect ? 'text-answer' : 'text-error'}`}>
              {isCorrect ? 'Correct!' : 'Review chance'}
            </p>
            <p className="mt-2 text-sm leading-6 text-fg-soft">
              Answer: “{choices[answerIndex]}”. Read the notes, then save this card if you want to review it later.
            </p>
          </div>

          <div className="flex justify-end">
            <MissedProblemButton
              sourceDate={sourceDate}
              problemType="vocab"
              problemOrder={question.order}
            />
          </div>

          {notes.length > 0 ? (
            <dl className="space-y-4 rounded-lg border border-tip/25 bg-tip-bg p-4">
              <dt className="sr-only">Explanation</dt>
              {notes.map((note) => (
                <div key={note.label} className="grid gap-2 sm:grid-cols-[118px_1fr] sm:items-start">
                  <dt>
                    <span className="inline-flex min-h-9 items-center rounded-lg border border-tip/35 bg-[#2a2209] px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-tip shadow-[0_3px_0_rgba(80,61,4,0.55)]">
                      {note.label}
                    </span>
                  </dt>
                  <dd className="min-w-0 break-words text-sm leading-relaxed text-fg">
                    {note.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="flex justify-end">
            <Button onClick={onNext}>Next</Button>
          </div>
        </div>
      ) : null}
    </article>
  )
}
