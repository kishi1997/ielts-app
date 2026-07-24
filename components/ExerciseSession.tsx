'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { DailyContent } from '@/lib/types'
import VocabQuiz from '@/components/VocabQuiz'
import SentenceCard from '@/components/SentenceCard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type Phase = 'vocab' | 'vocabResult' | 'writing' | 'writingResult'

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

function shuffledValues<T>(values: T[], seed: string): T[] {
  const indexes = shuffledIndexes(values.length, seed)
  return indexes.map((index) => values[index])
}

function buildReverseVocabChoices(content: DailyContent, questionOrder: number, seed: string) {
  const question = content.vocab.find((item) => item.order === questionOrder)
  const correctWord = question?.word ?? ''
  const distractors = content.vocab
    .filter((item) => item.order !== questionOrder)
    .map((item) => item.word)
    .filter((word, index, words) => word && word !== correctWord && words.indexOf(word) === index)

  const selectedDistractors = shuffledValues(distractors, `${seed}:distractors`).slice(0, 3)
  const choices = shuffledValues([correctWord, ...selectedDistractors], `${seed}:choices`)
  const answerIndex = choices.indexOf(correctWord)

  return { choices, answerIndex: Math.max(0, answerIndex) }
}

export default function ExerciseSession({ content, currentDate, olderDate, newerDate }: Props) {
  const [phase, setPhase] = useState<Phase>('vocab')

  const [vocabRound, setVocabRound] = useState(1)
  const [vocabOrder, setVocabOrder] = useState<number[]>(() =>
    shuffledIndexes(content.vocab.length, `${currentDate}:1`),
  )
  const [vocabPosition, setVocabPosition] = useState(0)
  const [vocabSelected, setVocabSelected] = useState<number | null>(null)
  const [vocabWrongInRound, setVocabWrongInRound] = useState<Set<number>>(new Set())

  const [writingIndex, setWritingIndex] = useState(0)

  const currentVocabQuestion = content.vocab[vocabOrder[vocabPosition]]
  const isReverseVocabRound = vocabRound > 1
  const reverseVocab = currentVocabQuestion
    ? buildReverseVocabChoices(
        content,
        currentVocabQuestion.order,
        `${currentDate}:${vocabRound}:${currentVocabQuestion.order}`,
      )
    : { choices: [], answerIndex: 0 }
  const currentVocabChoices = isReverseVocabRound
    ? reverseVocab.choices
    : currentVocabQuestion?.choices ?? []
  const currentVocabAnswerIndex = isReverseVocabRound
    ? reverseVocab.answerIndex
    : currentVocabQuestion?.answerIndex ?? 0
  const currentVocabPrompt = isReverseVocabRound
    ? currentVocabQuestion?.choices[currentVocabQuestion.answerIndex] ||
      currentVocabQuestion?.meaning ||
      currentVocabQuestion?.word ||
      ''
    : currentVocabQuestion?.word ?? ''
  const vocabCorrectCount = Math.max(0, content.vocab.length - vocabWrongInRound.size)

  function handleVocabSelect(choiceIndex: number) {
    if (vocabSelected !== null || !currentVocabQuestion) return
    setVocabSelected(choiceIndex)
    if (choiceIndex !== currentVocabAnswerIndex) {
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

    setPhase('vocabResult')
  }

  function startNextVocabRound() {
    const nextRound = vocabRound + 1
    setVocabRound(nextRound)
    setVocabOrder(shuffledIndexes(content.vocab.length, `${currentDate}:${nextRound}`))
    setVocabPosition(0)
    setVocabSelected(null)
    setVocabWrongInRound(new Set())
    setPhase('vocab')
  }

  const totalWritingSteps = content.sentences.length
  const currentSentence = content.sentences[writingIndex]
  const canGoPreviousWriting = writingIndex > 0
  const isLastWritingStep = writingIndex >= totalWritingSteps - 1

  function goPreviousWriting() {
    setWritingIndex((index) => Math.max(0, index - 1))
  }

  function goNextWriting() {
    if (isLastWritingStep) {
      setPhase('writingResult')
      return
    }

    setWritingIndex((index) => Math.min(totalWritingSteps - 1, index + 1))
  }

  const phaseLabel =
    phase === 'writing' ? 'Writing' : phase === 'writingResult' ? 'Quest Complete' : 'Vocabulary'
  const currentStep =
    phase === 'writing'
      ? writingIndex + 1
      : phase === 'writingResult'
        ? totalWritingSteps
      : phase === 'vocabResult'
        ? content.vocab.length
        : vocabPosition + 1
  const totalSteps = phase === 'writing' || phase === 'writingResult' ? totalWritingSteps : content.vocab.length
  const progressValue = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0
  const phaseHelp =
    phase === 'writing'
      ? 'Write your own sentence first, then compare it with the model answer and notes.'
      : phase === 'writingResult'
        ? 'Nice work. Head home or review the cards you saved.'
      : phase === 'vocabResult'
        ? 'Check your score, then flip the cards and try the full set again.'
        : isReverseVocabRound
          ? 'Choose the English word, read the notes, and lock it in.'
          : 'Choose an answer, read the notes, and save tricky words for review.'

  if (
    (phase === 'vocab' && !currentVocabQuestion) ||
    (phase === 'writing' && !currentSentence) ||
    (phase === 'writingResult' && totalWritingSteps === 0) ||
    (phase === 'vocabResult' && content.vocab.length === 0)
  ) {
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
                <Button size="sm" onClick={goNextWriting}>
                  {isLastWritingStep ? 'Finish' : 'Next'}
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
            prompt={currentVocabPrompt}
            choices={currentVocabChoices}
            answerIndex={currentVocabAnswerIndex}
            mode={isReverseVocabRound ? 'word' : 'meaning'}
            roundNumber={vocabRound}
            selectedIndex={vocabSelected}
            onSelect={handleVocabSelect}
            onNext={handleVocabNext}
          />
        ) : phase === 'vocabResult' ? (
          <VocabRoundResult
            correctCount={vocabCorrectCount}
            totalCount={content.vocab.length}
            roundNumber={vocabRound}
            onTryAgain={startNextVocabRound}
          />
        ) : phase === 'writingResult' ? (
          <WritingCompleteResult totalCount={totalWritingSteps} />
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
            <Button className="flex-1" onClick={goNextWriting}>
              {isLastWritingStep ? 'Finish' : 'Next'}
            </Button>
          </div>
        </nav>
      ) : null}
    </main>
  )
}

interface WritingCompleteResultProps {
  totalCount: number
}

function WritingCompleteResult({ totalCount }: WritingCompleteResultProps) {
  return (
    <article className="game-card overflow-hidden p-0">
      <div className="relative isolate p-5 sm:p-7">
        <div className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full bg-answer/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-tip/15 blur-3xl" />
        <div className="pointer-events-none absolute right-7 top-7 text-5xl opacity-20 motion-safe:animate-bounce">
          ★
        </div>
        <div className="pointer-events-none absolute bottom-8 left-8 text-4xl opacity-20 motion-safe:animate-pulse">
          🐾
        </div>

        <p className="label-text text-answer">Quest Complete</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="text-3xl font-black leading-tight text-fg sm:text-4xl">
              Tonight&apos;s words are in your paws
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-fg-soft">
              You finished {totalCount} writing cards. Keep the streak warm, or visit the Review Box before the next quest.
            </p>
          </div>
          <div className="rounded-2xl border border-answer/30 bg-answer-bg px-6 py-5 text-center shadow-[0_7px_0_rgba(111,50,0,0.45)]">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-answer">
              Writing
            </p>
            <p className="mt-1 font-serif text-5xl font-black text-fg sm:text-6xl">
              {String(totalCount).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-tip/25 bg-tip-bg p-4">
          <p className="text-sm font-black text-tip">Nightie says: good work, keep one card moving</p>
          <p className="mt-2 text-sm leading-6 text-fg-soft">
            Review saved cards while the sentence patterns are still fresh.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-answer/90"
          >
            Quest Home
          </Link>
          <Link
            href="/review"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-input bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
          >
            Review Box
          </Link>
        </div>
      </div>
    </article>
  )
}

interface VocabRoundResultProps {
  correctCount: number
  totalCount: number
  roundNumber: number
  onTryAgain: () => void
}

function VocabRoundResult({
  correctCount,
  totalCount,
  roundNumber,
  onTryAgain,
}: VocabRoundResultProps) {
  const score = `${String(correctCount).padStart(2, '0')}/${String(totalCount).padStart(2, '0')}`
  const missedCount = Math.max(0, totalCount - correctCount)

  return (
    <article className="game-card overflow-hidden p-0">
      <div className="relative isolate p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-answer/20 blur-3xl" />
        <div className="pointer-events-none absolute right-20 top-20 text-4xl opacity-20 motion-safe:animate-pulse">
          🐾
        </div>

        <p className="label-text text-answer">Round {roundNumber} Result</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="text-3xl font-black leading-tight text-fg sm:text-4xl">
              Almost there
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-fg-soft">
              Nightie flipped the cards for the next run. This time, match the Japanese meaning to the English word.
            </p>
          </div>
          <div className="rounded-2xl border border-answer/30 bg-answer-bg px-6 py-5 text-center shadow-[0_7px_0_rgba(111,50,0,0.45)]">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-answer">
              Score
            </p>
            <p className="mt-1 font-serif text-5xl font-black text-fg sm:text-6xl">
              {score}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-tip/25 bg-tip-bg p-4">
          <p className="text-sm font-black text-tip">Almost there. Let&apos;s flip the cards</p>
          <p className="mt-2 text-sm leading-6 text-fg-soft">
            {missedCount} cards slipped away. Save tricky cards for review, then try the full set again.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button onClick={onTryAgain} className="w-full bg-answer/90 sm:w-auto">
            Try Again
          </Button>
        </div>
      </div>
    </article>
  )
}
