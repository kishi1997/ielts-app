'use client'

import { useState } from 'react'
import type { SentenceQuestion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  exercise: SentenceQuestion
}

export default function SentenceCard({ exercise }: Props) {
  const [selfAnswer, setSelfAnswer] = useState('')
  const [showModelAnswer, setShowModelAnswer] = useState(false)

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
            Sentence {exercise.order}
          </p>
          <h2 className="mt-1 text-lg font-bold leading-tight text-fg">
            Instant Translation
          </h2>
        </div>
        <span className="rounded-md border border-phrase/25 bg-phrase-bg px-2.5 py-1 font-serif text-sm text-phrase">
          {exercise.word}
        </span>
      </div>

      <div className="space-y-5">
        <section className="rounded-lg border border-jp/25 bg-jp-bg p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-jp">
            Japanese Prompt
          </p>
          <p className="text-base leading-[1.8] text-fg">{exercise.ja_sentence}</p>
        </section>

        <section>
          <label
            htmlFor={`self-answer-${exercise.order}`}
            className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-answer"
          >
            Your Answer
          </label>
          <Textarea
            id={`self-answer-${exercise.order}`}
            value={selfAnswer}
            onChange={(event) => setSelfAnswer(event.target.value)}
            placeholder="Write your answer here..."
            className="min-h-20 resize-y bg-answer-bg text-base"
          />
        </section>

        <section className="rounded-lg border border-answer/25 bg-answer-bg p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-answer">
              Model Answer
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModelAnswer((current) => !current)}
              aria-expanded={showModelAnswer}
              aria-controls={`model-answer-${exercise.order}`}
            >
              {showModelAnswer ? 'Hide' : 'Show'}
            </Button>
          </div>
          {showModelAnswer ? (
            <p
              id={`model-answer-${exercise.order}`}
              className="mt-3 border-l-[3px] border-answer pl-3 font-serif text-lg leading-[1.75] text-fg"
            >
              {exercise.model_answer}
            </p>
          ) : null}
        </section>

        {exercise.tips ? (
          <section className="rounded-lg border border-tip/25 bg-tip-bg p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-tip">
              Tips
            </p>
            <p className="text-[15px] leading-relaxed text-fg-soft">{exercise.tips}</p>
          </section>
        ) : null}
      </div>
    </article>
  )
}
