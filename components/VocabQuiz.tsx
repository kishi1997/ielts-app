'use client'

import type { VocabQuestion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import MissedProblemButton from '@/components/MissedProblemButton'

interface Props {
  sourceDate: string
  question: VocabQuestion
  roundNumber: number
  selectedIndex: number | null
  onSelect: (choiceIndex: number) => void
  onNext: () => void
}

export default function VocabQuiz({
  sourceDate,
  question,
  roundNumber,
  selectedIndex,
  onSelect,
  onNext,
}: Props) {
  const isAnswered = selectedIndex !== null
  const isCorrect = selectedIndex === question.answerIndex

  const notes: { label: string; value: string }[] = isAnswered
    ? [
        { label: '意味', value: question.meaning },
        { label: '例文', value: question.example },
        { label: '例文の和訳', value: question.exampleJa },
        { label: '語源', value: question.etymology },
        { label: '覚え方', value: question.mnemonic },
      ].flatMap((n) => (n.value ? [{ label: n.label, value: n.value }] : []))
    : []

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
    <article className="game-card p-4 sm:p-5">
      <div className="mb-5">
        <p className="label-text text-fg-faint">
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
              {isCorrect ? '正解！' : 'ここは復習チャンス'}
            </p>
            <p className="mt-2 text-sm leading-6 text-fg-soft">
              答えは「{question.choices[question.answerIndex]}」。分からなかったら解説を見て、あとで解き直せるよう保存しよう。
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="rounded-lg border border-tip/25 bg-tip-bg px-4 py-3 text-sm font-black text-tip">
              解説は下に表示中
            </p>
            <MissedProblemButton
              sourceDate={sourceDate}
              problemType="vocab"
              problemOrder={question.order}
            />
          </div>

          {notes.length > 0 ? (
            <dl className="space-y-3 rounded-lg border border-tip/25 bg-tip-bg p-4">
              <dt className="label-text text-tip">Explanation</dt>
              {notes.map((note) => (
                <div key={note.label}>
                  <dt className="label-text text-tip">{note.label}</dt>
                  <dd className="mt-1 break-words text-sm leading-relaxed text-fg">{note.value}</dd>
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
