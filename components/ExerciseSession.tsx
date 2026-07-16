'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { DailyContent } from '@/lib/types'
import VocabQuiz from '@/components/VocabQuiz'
import SentenceCard from '@/components/SentenceCard'
import MobileHeader from '@/components/MobileHeader'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface Props {
  content: DailyContent
}

function shuffledIndexes(length: number): number[] {
  const indexes = Array.from({ length }, (_, i) => i)
  for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indexes[i], indexes[j]] = [indexes[j], indexes[i]]
  }
  return indexes
}

export default function ExerciseSession({ content }: Props) {
  const pathname = usePathname()
  const [phase, setPhase] = useState<'vocab' | 'writing'>('vocab')

  const [vocabRound, setVocabRound] = useState(1)
  const [vocabOrder, setVocabOrder] = useState<number[]>(() =>
    shuffledIndexes(content.vocab.length),
  )
  const [vocabPosition, setVocabPosition] = useState(0)
  const [vocabSelected, setVocabSelected] = useState<number | null>(null)
  const [vocabWrongInRound, setVocabWrongInRound] = useState<Set<number>>(new Set())

  const [writingIndex, setWritingIndex] = useState(0)

  const currentDate = useMemo(() => {
    const segment = pathname.split('/').filter(Boolean)[0]
    return segment ?? ''
  }, [pathname])

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

    setVocabRound((round) => round + 1)
    setVocabOrder(shuffledIndexes(content.vocab.length))
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

  if (phase === 'writing' && !currentSentence) {
    return (
      <main className="min-h-screen bg-bg px-4 py-12 text-center text-sm text-fg-soft">
        No exercises available.
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <MobileHeader
        currentDate={currentDate}
        phaseLabel={phaseLabel}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
      <Sidebar
        currentDate={currentDate}
        phaseLabel={phaseLabel}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      <main className="px-4 pb-28 pt-24 lg:ml-72 lg:px-8 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-5 hidden rounded-lg border border-border bg-surface p-4 lg:block">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
                  {phaseLabel}
                  {phase === 'vocab' && vocabRound > 1 ? ` · Round ${vocabRound}` : ''}
                </p>
                <p className="mt-1 text-lg font-bold text-fg">
                  {currentStep} / {totalSteps}
                </p>
              </div>
              {phase === 'writing' ? (
                <div className="flex gap-2">
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
            <Progress value={progressValue} />
          </div>

          {phase === 'vocab' ? (
            <VocabQuiz
              question={currentVocabQuestion}
              roundNumber={vocabRound}
              selectedIndex={vocabSelected}
              onSelect={handleVocabSelect}
              onNext={handleVocabNext}
            />
          ) : (
            <SentenceCard exercise={currentSentence} />
          )}
        </div>
      </main>

      {phase === 'writing' ? (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
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
    </div>
  )
}
