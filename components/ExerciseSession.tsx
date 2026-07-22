'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { DailyContent } from '@/lib/types'
import VocabQuiz from '@/components/VocabQuiz'
import SentenceCard from '@/components/SentenceCard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface Props {
  content: DailyContent
  currentDate: string
  olderDate: string | null
  newerDate: string | null
}

function hashSeed(seed: string): number {
  let hash = 2166136261

  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function seededRandom(seed: string): () => number {
  let value = hashSeed(seed)

  return () => {
    value += 0x6D2B79F5
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffledIndexes(length: number, seed: string): number[] {
  const indexes = Array.from({ length }, (_, i) => i)
  const random = seededRandom(seed)

  for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[indexes[i], indexes[j]] = [indexes[j], indexes[i]]
  }
  return indexes
}

export default function ExerciseSession({ content, currentDate, olderDate, newerDate }: Props) {
  const [phase, setPhase] = useState<'vocab' | 'writing'>('vocab')

  const [vocabRound, setVocabRound] = useState(1)
  const [vocabOrder, setVocabOrder] = useState<number[]>(() =>
    shuffledIndexes(content.vocab.length, `${currentDate}:1`),
  )
  const [vocabPosition, setVocabPosition] = useState(0)
  const [vocabSelected, setVocabSelected] = useState<number | null>(null)
  const [vocabWrongInRound, setVocabWrongInRound] = useState<Set<number>>(new Set())

  const [writingIndex, setWritingIndex] = useState(0)

  const currentVocabQuestion = content.vocab[vocabOrder[vocabPosition]]

  function handleVocabSelect(choiceIndex: number) {
    if (vocabSelected !== null) return
    setVocabSelected(choiceIndex)
    if (choiceIndex !== currentVocabQuestion.answerIndex) {
      setVocabWrongInRound((prev) => new Set(prev).add(currentVocabQuestion.order))
    }
  }

  function handleVocabNext() {
    const isLastInRound = vocabPosition === vocabOrder.length - 1
    if (!isLastInRound) {
      setVocabPosition((position) => position + 1)
      setVocabSelected(null)
      return
    }

    if (vocabWrongInRound.size === 0) {
      setPhase('writing')
      return
    }

    const nextRound = vocabRound + 1
    setVocabRound(nextRound)
    setVocabOrder(shuffledIndexes(content.vocab.length, `${currentDate}:${nextRound}`))
    setVocabPosition(0)
    setVocabSelected(null)
    setVocabWrongInRound(new Set())
  }

  const totalWritingSteps = content.sentences.length
  const currentSentence = content.sentences[writingIndex]
  const canGoPreviousWriting = writingIndex > 0
  const canGoNextWriting = writingIndex < totalWritingSteps - 1

  function goPreviousWriting() {
    setWritingIndex((index) => Math.max(0, index - 1))
  }

  function goNextWriting() {
    setWritingIndex((index) => Math.min(totalWritingSteps - 1, index + 1))
  }

  const phaseLabel = phase === 'vocab' ? 'Vocabulary' : 'Writing'
  const currentStep = phase === 'vocab' ? vocabPosition + 1 : writingIndex + 1
  const totalSteps = phase === 'vocab' ? content.vocab.length : totalWritingSteps
  const progressValue = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0
  const phaseHelp =
    phase === 'vocab'
      ? 'Choose an answer, read the notes, and save tricky words for review.'
      : 'Write your own sentence first, then compare it with the model answer and notes.'

  if ((phase === 'vocab' && !currentVocabQuestion) || (phase === 'writing' && !currentSentence)) {
    return (
      <main className="px-4 py-12 text-center text-sm text-fg-soft lg:ml-[268px]">
        No exercises found.
      </main>
    )
  }

  return (
    <main className="px-4 pb-28 pt-7 sm:px-6 sm:pt-10 lg:ml-[268px] lg:pb-12">
      <div className="mx-auto max-w-3xl">
        <section className="mb-5 rounded-lg border border-white/10 bg-surface/90 p-4 shadow-[0_6px_0_rgba(0,0,0,0.4)] sm:p-5">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="label-text text-answer">
                {phaseLabel}
                {phase === 'vocab' && vocabRound > 1 ? ` · Round ${vocabRound}` : ''}
              </p>
              <h1 className="mt-1 break-words text-2xl font-black text-fg">
                {currentDate} のクエスト
              </h1>
              <p className="mt-2 text-sm leading-6 text-fg-soft">{phaseHelp}</p>
            </div>
            <div className="shrink-0 rounded-lg border border-tip/20 bg-tip-bg px-4 py-3 text-center">
              <p className="text-[11px] font-black text-tip">STEP</p>
              <p className="mt-1 text-lg font-black text-fg">{currentStep} / {totalSteps}</p>
            </div>
          </div>
          <Progress value={progressValue} />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {newerDate ? (
                <Link href={`/${newerDate}`} className="rounded-lg border border-border px-3 py-2 text-xs font-black text-fg-soft hover:bg-surface-2">
                  ← Newer quest
                </Link>
              ) : null}
              {olderDate ? (
                <Link href={`/${olderDate}`} className="rounded-lg border border-border px-3 py-2 text-xs font-black text-fg-soft hover:bg-surface-2">
                  Older quest →
                </Link>
              ) : null}
            </div>
            {phase === 'writing' ? (
              <div className="hidden gap-2 sm:flex">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPreviousWriting}
                  disabled={!canGoPreviousWriting}
                >
                  Previous
                </Button>
                <Button size="sm" onClick={goNextWriting} disabled={!canGoNextWriting}>
                  Next
                </Button>
              </div>
            ) : null}
          </div>
        </section>

        {phase === 'vocab' ? (
          <VocabQuiz
            key={`${vocabRound}-${currentVocabQuestion.order}`}
            sourceDate={currentDate}
            question={currentVocabQuestion}
            roundNumber={vocabRound}
            selectedIndex={vocabSelected}
            onSelect={handleVocabSelect}
            onNext={handleVocabNext}
          />
        ) : (
          <SentenceCard
            key={currentSentence.order}
            sourceDate={currentDate}
            exercise={currentSentence}
          />
        )}
      </div>

      {phase === 'writing' ? (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={goPreviousWriting}
              disabled={!canGoPreviousWriting}
            >
              Previous
            </Button>
            <Button className="flex-1" onClick={goNextWriting} disabled={!canGoNextWriting}>
              Next
            </Button>
          </div>
        </nav>
      ) : null}
    </main>
  )
}
