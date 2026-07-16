'use client'

import type { VocabQuestion } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface Props {
  question: VocabQuestion
  roundNumber: number
  selectedIndex: number | null
  onSelect: (choiceIndex: number) => void
  onNext: () => void
}

export default function VocabQuiz({
  question,
  roundNumber,
  selectedIndex,
  onSelect,
  onNext,
}: Props) {
  const isAnswered = selectedIndex !== null

  function choiceClasses(choiceIndex: number) {
    if (!isAnswered) {
      return 'border-border bg-surface text-fg hover:bg-surface-2'
    }
    if (choiceIndex === question.answerIndex) {
      return 'border-answer/40 bg-answer-bg text-answer'
    }
    if (choiceIndex === selectedIndex) {
      return 'border-error/40 bg-error-bg text-error'
    }
    return 'border-border bg-surface text-fg-faint'
  }

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
          Vocabulary Quiz{roundNumber > 1 ? ` · Round ${roundNumber}` : ''}
        </p>
        <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-fg">
          {question.word}
        </h2>
      </div>

      <div className="space-y-3">
        {question.choices.map((choice, choiceIndex) => (
          <button
            key={choice}
            type="button"
            onClick={() => onSelect(choiceIndex)}
            disabled={isAnswered}
            className={`w-full rounded-md border px-4 py-3 text-left text-base transition-colors disabled:cursor-not-allowed ${choiceClasses(choiceIndex)}`}
          >
            {choice}
          </button>
        ))}
      </div>

      {isAnswered ? (
        <div className="mt-5 flex justify-end">
          <Button onClick={onNext}>Next</Button>
        </div>
      ) : null}
    </article>
  )
}
