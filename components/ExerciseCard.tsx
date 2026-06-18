'use client'

import { useState } from 'react'
import type { Exercise } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  exercise: Exercise
}

export default function ExerciseCard({ exercise }: Props) {
  const [selfAnswer, setSelfAnswer] = useState('')
  const [showModelAnswer, setShowModelAnswer] = useState(false)

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
            Exercise {exercise.order}
          </p>
          <h2 className="mt-1 text-lg font-bold leading-tight text-fg">
            {exercise.topic}
          </h2>
        </div>
        <span className="rounded-full border border-jp/30 bg-jp-bg px-2.5 py-1 text-xs font-semibold text-jp">
          Practice
        </span>
      </div>

      <div className="space-y-5">
        <section className="rounded-lg border border-jp/25 bg-jp-bg p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-jp">
            Japanese Prompt
          </p>
          <p className="text-base leading-[1.8] text-fg">{exercise.ja_paragraph}</p>
        </section>

        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-phrase">
            Required Phrases
          </p>
          <div className="flex flex-wrap gap-2">
            {exercise.phrases.map((phrase) => (
              <span
                key={phrase}
                className="rounded-md border border-phrase/25 bg-phrase-bg px-2.5 py-1 font-serif text-[15px] leading-relaxed text-phrase"
              >
                {phrase}
              </span>
            ))}
          </div>
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
            className="min-h-44 resize-y bg-answer-bg text-base"
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

        <section className="rounded-lg border border-tip/25 bg-tip-bg p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-tip">
            Tips
          </p>
          <ul className="space-y-2 text-[15px] leading-relaxed text-fg-soft">
            {exercise.tips.map((tip) => (
              <li key={tip.phrase} className="flex gap-2">
                <code className="rounded bg-surface-2 px-1.5 py-0.5 font-serif text-sm text-tip">
                  {tip.phrase}
                </code>
                <span>{tip.synonyms.join(' / ')}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  )
}
