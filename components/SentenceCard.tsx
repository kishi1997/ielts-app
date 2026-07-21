'use client'

import { useState } from 'react'
import type { SentenceQuestion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import MissedProblemButton from '@/components/MissedProblemButton'

interface Props {
  sourceDate: string
  exercise: SentenceQuestion
}

export default function SentenceCard({ sourceDate, exercise }: Props) {
  const [selfAnswer, setSelfAnswer] = useState('')
  const [showModelAnswer, setShowModelAnswer] = useState(false)
  const explanation = exercise.explanation || exercise.tips

  return (
    <article className="game-card p-4 sm:p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="label-text text-fg-faint">
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
          <p className="mb-2 label-text text-jp">
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
            placeholder="まず自分の英文を書いてみよう..."
            className="min-h-20 resize-y bg-answer-bg text-base"
          />
        </section>

        <section className="rounded-lg border border-answer/25 bg-answer-bg p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="label-text text-answer">
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
            <div className="mt-4 space-y-4">
              <p
                id={`model-answer-${exercise.order}`}
                className="border-l-[3px] border-answer pl-3 font-serif text-lg leading-[1.75] text-fg"
              >
                {exercise.model_answer}
              </p>
            </div>
          ) : null}
        </section>

        {explanation ? (
          <section className="rounded-lg border border-tip/25 bg-tip-bg p-4">
            <p className="mb-2 label-text text-tip">
              Explanation
            </p>
            <p className="break-words text-[15px] leading-relaxed text-fg-soft">{explanation}</p>
          </section>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-fg-faint">
            迷ったら復習リストへ。次に自分で書けたら外せます。
          </p>
          <MissedProblemButton
            sourceDate={sourceDate}
            problemType="sentence"
            problemOrder={exercise.order}
          />
        </div>
      </div>
    </article>
  )
}
