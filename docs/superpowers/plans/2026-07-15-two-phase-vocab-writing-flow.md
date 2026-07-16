# Two-Phase Vocab-Then-Writing Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the daily IELTS exercise flow into a vocab/idiom quiz phase (10 four-choice questions, must all be correct in one round to advance) followed by a shorter instant-translation writing phase (3-4 one-sentence questions using words from the quiz).

**Architecture:** `DailyContent { vocab, sentences }` replaces the current `Exercise[]` shape end-to-end (types, DB payload, API validation, generation prompt). `ExerciseSession` becomes a two-phase client-side state machine: a `VocabQuiz` presentational component handles one multiple-choice question at a time while `ExerciseSession` owns round/retry state; on a clean round it flips to a `writing` phase that reuses the existing prev/next stepper pattern with a new `SentenceCard` component.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind v4 `@theme` tokens, `@neondatabase/serverless` against Postgres (Neon), no test runner.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-15-two-phase-vocab-writing-flow-design.md` — this plan implements it in full; read it if anything below is ambiguous.
- No automated test framework exists in this repo (`package.json` has no `test` script, no jest/vitest/playwright dependency). Verification substitutes, in order of preference: (a) `npx tsc --noEmit` for type correctness, (b) `curl` against the running `next dev` server for API/SSR-markup smoke checks, (c) a described manual browser walkthrough for interaction behavior the previous two can't cover. Do not invent a test framework to satisfy this plan's TDD template — follow the substitutions given in each task.
- AGENTS.md: this is a modified Next.js — check `node_modules/next/dist/docs/` before writing App Router code. This plan does not introduce any new App Router primitives beyond what `app/[date]/page.tsx` and `app/api/exercises/route.ts` already use, so no new doc lookups are required, but re-verify if a step surprises you.
- `daily_exercises` table and its `exercises` JSONB column keep their existing names — only the JSON shape stored inside changes. No SQL migration file is needed.
- Existing rows in `daily_exercises` use the old `Exercise[]` shape and are incompatible with the new reader code — they must be deleted (Task 2) before the new code is exercised against real dates, or `getExercisesByDate` will return old-shaped JSON that crashes the new components.
- Quiz/session progress is never persisted (no localStorage, no DB writes for progress) — a page reload always resets to the start of the vocab phase. Do not add persistence.
- Dark-only theme via `@theme` tokens in `app/globals.css`. Do not introduce raw hex values in component files — add new tokens to `app/globals.css` instead (Task 3 adds the two needed for correct/incorrect feedback).
- `npm run dev` reads `DATABASE_URL` / `IELTS_API_SECRET` from `.env.local` automatically; standalone Node verification scripts in this plan use `node --env-file=.env.local --input-type=module -e "..."` run from the project root (verified working during planning).

---

### Task 1: Data layer — types, DB access, API validation

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/db.ts`
- Modify: `app/api/exercises/route.ts`

**Interfaces:**
- Produces: `VocabQuestion { order: number; word: string; choices: string[]; answerIndex: number }`, `SentenceQuestion { order: number; word: string; ja_sentence: string; model_answer: string; tips?: string }`, `DailyContent { vocab: VocabQuestion[]; sentences: SentenceQuestion[] }` — all exported from `lib/types.ts`. `getExercisesByDate(date: string): Promise<DailyContent | null>` and `saveExercises(date: string, content: DailyContent): Promise<void>` exported from `lib/db.ts` (same names/signatures shape as before, new payload type). These are consumed by Tasks 3-6.
- Consumes: nothing new (this task has no dependency on other tasks).

- [ ] **Step 1: Replace `lib/types.ts` with the new schema**

Full file contents:

```ts
export interface VocabQuestion {
  order: number
  word: string
  choices: string[]
  answerIndex: number
}

export interface SentenceQuestion {
  order: number
  word: string
  ja_sentence: string
  model_answer: string
  tips?: string
}

export interface DailyContent {
  vocab: VocabQuestion[]
  sentences: SentenceQuestion[]
}
```

- [ ] **Step 2: Update `lib/db.ts` to read/write `DailyContent`**

Full file contents:

```ts
import { neon } from '@neondatabase/serverless'
import type { DailyContent } from './types'

type SqlFunc = ReturnType<typeof neon>

let sql: SqlFunc | null = null

function getSql(): SqlFunc {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    sql = neon(process.env.DATABASE_URL)
  }
  return sql
}

export async function getExercisesByDate(date: string): Promise<DailyContent | null> {
  const rows = await getSql()`
    SELECT exercises FROM daily_exercises WHERE date = ${date}
  ` as any[]
  if (rows.length === 0) return null
  return rows[0].exercises as DailyContent
}

export async function getAllDates(): Promise<string[]> {
  const rows = await getSql()`
    SELECT date::text FROM daily_exercises ORDER BY date DESC
  ` as any[]
  return rows.map((r) => r.date)
}

export async function exerciseExistsForDate(date: string): Promise<boolean> {
  const rows = await getSql()`
    SELECT 1 FROM daily_exercises WHERE date = ${date}
  ` as any[]
  return rows.length > 0
}

export async function saveExercises(date: string, content: DailyContent): Promise<void> {
  await getSql()`
    INSERT INTO daily_exercises (date, exercises)
    VALUES (${date}, ${JSON.stringify(content)})
  `
}
```

- [ ] **Step 3: Update `app/api/exercises/route.ts` validation for the new shape**

Full file contents:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { exerciseExistsForDate, saveExercises } from '@/lib/db'
import type { DailyContent, SentenceQuestion, VocabQuestion } from '@/lib/types'

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${process.env.IELTS_API_SECRET}`
}

function isValidVocabQuestion(q: unknown): q is VocabQuestion {
  if (typeof q !== 'object' || q === null) return false
  const v = q as Record<string, unknown>
  return (
    typeof v.order === 'number' &&
    typeof v.word === 'string' &&
    Array.isArray(v.choices) &&
    v.choices.length === 4 &&
    v.choices.every((c) => typeof c === 'string') &&
    typeof v.answerIndex === 'number' &&
    v.answerIndex >= 0 &&
    v.answerIndex < 4
  )
}

function isValidSentenceQuestion(q: unknown): q is SentenceQuestion {
  if (typeof q !== 'object' || q === null) return false
  const s = q as Record<string, unknown>
  return (
    typeof s.order === 'number' &&
    typeof s.word === 'string' &&
    typeof s.ja_sentence === 'string' &&
    typeof s.model_answer === 'string' &&
    (s.tips === undefined || typeof s.tips === 'string')
  )
}

function isValidDailyContent(body: unknown): body is DailyContent {
  if (typeof body !== 'object' || body === null) return false
  const content = body as Record<string, unknown>
  if (!Array.isArray(content.vocab) || content.vocab.length !== 10) return false
  if (!content.vocab.every(isValidVocabQuestion)) return false
  if (!Array.isArray(content.sentences)) return false
  if (content.sentences.length < 3 || content.sentences.length > 4) return false
  if (!content.sentences.every(isValidSentenceQuestion)) return false
  return true
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }
  const exists = await exerciseExistsForDate(date)
  return NextResponse.json({ exists })
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as { date: string; vocab?: unknown; sentences?: unknown }
  const { date } = body

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }
  if (!isValidDailyContent({ vocab: body.vocab, sentences: body.sentences })) {
    return NextResponse.json(
      { error: 'Body must include vocab (10 items) and sentences (3-4 items) matching the DailyContent schema' },
      { status: 400 },
    )
  }

  const exists = await exerciseExistsForDate(date)
  if (exists) {
    return NextResponse.json({ error: 'Already exists' }, { status: 409 })
  }

  await saveExercises(date, {
    vocab: body.vocab as DailyContent['vocab'],
    sentences: body.sentences as DailyContent['sentences'],
  })
  return NextResponse.json({ success: true }, { status: 201 })
}
```

- [ ] **Step 4: Scoped type-check**

Run: `npx tsc --noEmit 2>&1 | grep -E "lib/types\.ts|lib/db\.ts|app/api/exercises/route\.ts"`
Expected: no output (empty) — these three files have zero type errors.

Note: the full `npx tsc --noEmit` run will still show errors in `components/ExerciseCard.tsx` and `components/ExerciseSession.tsx` at this point (they still reference the removed `Exercise`/`Tip` types). That is expected — those files are fixed in Tasks 4-5. Do not attempt to fix them here.

- [ ] **Step 5: Commit**

```bash
git add lib/types.ts lib/db.ts app/api/exercises/route.ts
git commit -m "feat: switch daily content schema to vocab+sentences (DailyContent)"
```

---

### Task 2: Discard incompatible existing exercise data

**Files:** none (operational step against the Neon Postgres database only)

**Interfaces:**
- Consumes: `DATABASE_URL` from `.env.local` (already present).
- Produces: an empty `daily_exercises` table for the new schema to write into.

- [ ] **Step 1: Confirm what's currently in the table**

Run: `node --env-file=.env.local --input-type=module -e "import { neon } from '@neondatabase/serverless'; const sql = neon(process.env.DATABASE_URL); console.log(await sql\`SELECT date::text FROM daily_exercises ORDER BY date DESC\`)"`

Expected: a JSON array of date rows (old-shape data). Note the dates for your own awareness — they will be deleted in the next step.

- [ ] **Step 2: Truncate the table**

Run: `node --env-file=.env.local --input-type=module -e "import { neon } from '@neondatabase/serverless'; const sql = neon(process.env.DATABASE_URL); await sql\`TRUNCATE TABLE daily_exercises\`; console.log('truncated')"`

Expected: prints `truncated`.

- [ ] **Step 3: Verify the table is empty**

Run: `node --env-file=.env.local --input-type=module -e "import { neon } from '@neondatabase/serverless'; const sql = neon(process.env.DATABASE_URL); console.log(await sql\`SELECT count(*)::int AS n FROM daily_exercises\`)"`

Expected: `[{"n":0}]`

No commit for this task — it's a data operation, not a code change.

---

### Task 3: Vocabulary quiz UI — feedback color tokens + `VocabQuiz` component

**Files:**
- Modify: `app/globals.css`
- Create: `components/VocabQuiz.tsx`

**Interfaces:**
- Consumes: `VocabQuestion` from `lib/types.ts` (Task 1).
- Produces: `VocabQuiz` component with props `{ question: VocabQuestion; roundNumber: number; selectedIndex: number | null; onSelect: (choiceIndex: number) => void; onNext: () => void }` — a presentational component with no internal answer state; the caller (Task 5's `ExerciseSession`) owns `selectedIndex` and round/retry bookkeeping. Consumed by Task 5.

- [ ] **Step 1: Add correct/incorrect feedback color tokens**

In `app/globals.css`, inside the `@theme { ... }` block, add two new tokens right after the existing `--color-tip-bg` line (`app/globals.css:24`):

```css
  --color-tip-bg:    rgba(245, 196, 81, 0.10);

  --color-error:     #f2555c;
  --color-error-bg:  rgba(242, 85, 92, 0.12);
```

- [ ] **Step 2: Create `components/VocabQuiz.tsx`**

Full file contents:

```tsx
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
```

- [ ] **Step 3: Scoped type-check**

Run: `npx tsc --noEmit 2>&1 | grep -E "components/VocabQuiz\.tsx|app/globals\.css"`
Expected: no output (empty).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css components/VocabQuiz.tsx
git commit -m "feat: add VocabQuiz component and error feedback color tokens"
```

---

### Task 4: Writing phase UI — `SentenceCard` component (replaces `ExerciseCard`)

**Files:**
- Delete: `components/ExerciseCard.tsx`
- Create: `components/SentenceCard.tsx`

**Interfaces:**
- Consumes: `SentenceQuestion` from `lib/types.ts` (Task 1).
- Produces: `SentenceCard` component with props `{ exercise: SentenceQuestion }`. Consumed by Task 5.

- [ ] **Step 1: Delete the old component**

```bash
git rm components/ExerciseCard.tsx
```

- [ ] **Step 2: Create `components/SentenceCard.tsx`**

Full file contents:

```tsx
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
```

- [ ] **Step 3: Scoped type-check**

Run: `npx tsc --noEmit 2>&1 | grep -E "components/SentenceCard\.tsx|components/ExerciseCard\.tsx"`
Expected: no output (empty) — `ExerciseCard.tsx` no longer exists so it can't error, and `SentenceCard.tsx` compiles cleanly.

- [ ] **Step 4: Commit**

```bash
git add components/SentenceCard.tsx
git commit -m "feat: replace ExerciseCard with SentenceCard for one-sentence writing phase"
```

---

### Task 5: Session orchestrator — `ExerciseSession` phase state machine + phase-aware `Sidebar`/`MobileHeader`

**Files:**
- Modify: `components/ExerciseSession.tsx`
- Modify: `components/Sidebar.tsx`
- Modify: `components/MobileHeader.tsx`

**Interfaces:**
- Consumes: `DailyContent` (Task 1), `VocabQuiz` (Task 3), `SentenceCard` (Task 4).
- Produces: `ExerciseSession` component with props `{ content: DailyContent }` (renamed from the old `{ exercises: Exercise[] }`). `Sidebar` and `MobileHeader` gain a required `phaseLabel: string` prop alongside their existing `currentDate` / `currentStep` / `totalSteps` props. Consumed by Task 6 (`app/[date]/page.tsx`).

- [ ] **Step 1: Add `phaseLabel` prop to `Sidebar.tsx`**

In `components/Sidebar.tsx`, update the `Props` interface (currently at `components/Sidebar.tsx:4-10`):

```ts
interface Props {
  currentDate: string
  phaseLabel: string
  currentStep: number
  totalSteps: number
  prevDate?: string | null
  nextDate?: string | null
}
```

Update the function signature (currently `components/Sidebar.tsx:12-18`) to destructure `phaseLabel`:

```ts
export default function Sidebar({
  currentDate,
  phaseLabel,
  currentStep,
  totalSteps,
  prevDate = null,
  nextDate = null,
}: Props) {
```

Replace the static `Progress` label text (currently `components/Sidebar.tsx:41-43`):

```tsx
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
                Progress
              </p>
```

with:

```tsx
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
                {phaseLabel}
              </p>
```

- [ ] **Step 2: Add `phaseLabel` prop to `MobileHeader.tsx`**

In `components/MobileHeader.tsx`, update the `Props` interface (currently at `components/MobileHeader.tsx:3-7`):

```ts
interface Props {
  currentDate: string
  phaseLabel: string
  currentStep: number
  totalSteps: number
}
```

Update the function signature (currently `components/MobileHeader.tsx:9-13`):

```ts
export default function MobileHeader({
  currentDate,
  phaseLabel,
  currentStep,
  totalSteps,
}: Props) {
```

Replace the static label text (currently `components/MobileHeader.tsx:21`):

```tsx
          <p className="text-xs font-medium text-fg-soft">IELTS Writing</p>
```

with:

```tsx
          <p className="text-xs font-medium text-fg-soft">{phaseLabel}</p>
```

- [ ] **Step 3: Rewrite `components/ExerciseSession.tsx` as a two-phase state machine**

Full file contents:

```tsx
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
```

- [ ] **Step 4: Scoped type-check**

Run: `npx tsc --noEmit 2>&1 | grep -E "components/ExerciseSession\.tsx|components/Sidebar\.tsx|components/MobileHeader\.tsx"`
Expected: no output (empty).

Note: `app/[date]/page.tsx` will now show a type error because it still passes the old `exercises` prop name — that's expected and fixed in Task 6.

- [ ] **Step 5: Commit**

```bash
git add components/ExerciseSession.tsx components/Sidebar.tsx components/MobileHeader.tsx
git commit -m "feat: make ExerciseSession a two-phase vocab/writing state machine"
```

---

### Task 6: Wire the page route and verify the full build

**Files:**
- Modify: `app/[date]/page.tsx`

**Interfaces:**
- Consumes: `getExercisesByDate` (Task 1), `ExerciseSession` with `{ content: DailyContent }` prop (Task 5).
- Produces: a working `/[date]` route end to end. Nothing downstream consumes this task.

- [ ] **Step 1: Update `app/[date]/page.tsx` to pass `content` instead of `exercises`**

Full file contents:

```tsx
import { notFound } from 'next/navigation'
import { getExercisesByDate, getAllDates } from '@/lib/db'
import ExerciseSession from '@/components/ExerciseSession'

interface Props {
  params: Promise<{ date: string }>
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  try {
    const dates = await getAllDates()
    return dates.map((date) => ({ date }))
  } catch {
    return []
  }
}

export default async function ExercisePage({ params }: Props) {
  const { date } = await params

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()

  const content = await getExercisesByDate(date)
  if (!content) notFound()

  return <ExerciseSession content={content} />
}
```

- [ ] **Step 2: Full project type-check**

Run: `npx tsc --noEmit`
Expected: no output, exit code 0. This confirms every file touched across Tasks 1-6 is mutually consistent (no more references to the old `Exercise`/`Tip` types or the old `exercises` prop anywhere).

- [ ] **Step 3: Full production build**

Run: `npm run build`
Expected: build completes successfully (`Compiled successfully`), no type or lint errors.

- [ ] **Step 4: Seed a test day and smoke-test the route via curl**

From the project root, seed a throwaway date (`2099-01-01`) with a minimal valid payload, then confirm the SSR HTML contains the expected first-question markup:

```bash
npm run dev &
for i in $(seq 1 30); do
  curl -s -o /dev/null "http://localhost:3000/api/exercises?date=2099-01-01" && break
  sleep 1
done
SECRET=$(grep IELTS_API_SECRET .env.local | cut -d= -f2)
curl -s -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET" \
  -d '{
    "date": "2099-01-01",
    "vocab": [
      {"order":1,"word":"meticulous","choices":["綿密な","寛大な","曖昧な","怠惰な"],"answerIndex":0},
      {"order":2,"word":"albeit","choices":["〜にもかかわらず","〜のために","〜と同様に","〜以来"],"answerIndex":0},
      {"order":3,"word":"underpin","choices":["支える","無視する","誇張する","延期する"],"answerIndex":0},
      {"order":4,"word":"a rule of thumb","choices":["経験則","規則違反","例外規定","最終手段"],"answerIndex":0},
      {"order":5,"word":"discrepancy","choices":["食い違い","一致","改善","予測"],"answerIndex":0},
      {"order":6,"word":"in tandem with","choices":["〜と連動して","〜とは無関係に","〜に反して","〜の代わりに"],"answerIndex":0},
      {"order":7,"word":"plausible","choices":["もっともらしい","不可能な","無関係な","一時的な"],"answerIndex":0},
      {"order":8,"word":"take stock of","choices":["〜を評価する","〜を無視する","〜を破棄する","〜を延期する"],"answerIndex":0},
      {"order":9,"word":"inherent","choices":["固有の","一時的な","外部の","偶発的な"],"answerIndex":0},
      {"order":10,"word":"a far cry from","choices":["〜とはかけ離れている","〜に非常に近い","〜の一部である","〜の原因である"],"answerIndex":0}
    ],
    "sentences": [
      {"order":1,"word":"meticulous","ja_sentence":"彼女はいつも綿密な計画を立てる。","model_answer":"She always makes meticulous plans."},
      {"order":2,"word":"underpin","ja_sentence":"この理論は多くの研究を支えている。","model_answer":"This theory underpins a lot of research."},
      {"order":3,"word":"discrepancy","ja_sentence":"二つの報告書には食い違いがある。","model_answer":"There is a discrepancy between the two reports."}
    ]
  }'
echo ""
curl -s "http://localhost:3000/2099-01-01" | grep -o "Vocabulary Quiz" | head -1
curl -s "http://localhost:3000/2099-01-01" | grep -o "meticulous\|albeit\|underpin\|a rule of thumb\|discrepancy\|in tandem with\|plausible\|take stock of\|inherent\|a far cry from" | head -1
kill %1
```

Expected:
- POST response: `{"success":true}`
- First grep: `Vocabulary Quiz`
- Second grep: one of the ten vocab words (confirms the first question renders — which word depends on the random shuffle)

- [ ] **Step 5: Clean up the test day**

```bash
node --env-file=.env.local --input-type=module -e "import { neon } from '@neondatabase/serverless'; const sql = neon(process.env.DATABASE_URL); await sql\`DELETE FROM daily_exercises WHERE date = '2099-01-01'\`; console.log('cleaned up')"
```

Expected: prints `cleaned up`.

- [ ] **Step 6: Manual interaction walkthrough (describe observations)**

With `npm run dev` running, re-run the POST command from Step 4 to re-seed `2099-01-01` (Step 5 deleted it), then open `http://localhost:3000/2099-01-01` in a browser and confirm:
- The card shows "Vocabulary Quiz" and one word with 4 choice buttons.
- Clicking a choice colors the correct answer green and, if wrong, the clicked one red; a "Next" button appears.
- Deliberately answering at least one of the 10 questions incorrectly causes the quiz to restart at question 1 of 10 with a "Round 2" label after the 10th question, instead of advancing to the writing phase.
- Answering all 10 correctly in one full round (no more than one round needed if you always click the first/green-highlighted choice — every seed answer's `answerIndex` is `0`, so clicking the first choice each time passes on round 1) switches the header to "Writing 1/3" and shows the Sentence card with a textarea and a "Show" button that reveals the model answer.
- Previous/Next buttons work in the writing phase and are hidden during the vocab phase.
- Reloading the page mid-session resets back to "Vocabulary 1/10".

Run the cleanup command from Step 5 again afterward to remove the `2099-01-01` test row.

- [ ] **Step 7: Commit**

```bash
git add app/[date]/page.tsx
git commit -m "feat: wire ExerciseSession to the new DailyContent payload"
```

---

### Task 7: Update the `/ielts-daily` generation command

**Files:**
- Modify: `~/.claude/commands/ielts-daily.md` (outside the repo; not tracked by this project's git)

**Interfaces:**
- Consumes: the `DailyContent` JSON schema from Task 1 (`{ vocab: VocabQuestion[10], sentences: SentenceQuestion[3-4] }`) and the `app/api/exercises/route.ts` validation rules it must satisfy.
- Produces: nothing consumed by other tasks — this is the last task.

- [ ] **Step 1: Rewrite the command's generation instructions**

Replace the full contents of `~/.claude/commands/ielts-daily.md` with:

```markdown
---
description: Generate today's vocab quiz + instant-translation exercises and save to the web app DB
---

Generate today's IELTS vocab quiz and instant-translation exercises, and save them to the web app via API.

## Steps

1. Run `date +%Y-%m-%d` to get TODAY.

2. Check if exercises already exist for today:
   Run Bash: `curl -s "https://ielts-app-sepia.vercel.app/api/exercises?date=TODAY"`
   - If response is `{"exists":true}`: output "Already generated today, skipping." and stop.

3. Generate a JSON object with two arrays:

   **`vocab`: exactly 10 items**, each:
   ```json
   {
     "order": 1,
     "word": "meticulous",
     "choices": ["綿密な", "寛大な", "曖昧な", "怠惰な"],
     "answerIndex": 0
   }
   ```
   Rules:
   - Pick 10 IELTS Academic words or idioms, Band 6.5-7.0 level. Any topic/genre — do not restrict to a single theme.
   - Use a different word for each of the 10 items; avoid repeating words used in recent days if you have that context available.
   - `choices` has exactly 4 Japanese options: 1 correct translation + 3 plausible-but-wrong distractors (not obviously silly). Shuffle the correct answer into a random position (don't always put it first) and set `answerIndex` to its 0-based position.

   **`sentences`: 3 or 4 items**, each:
   ```json
   {
     "order": 1,
     "word": "meticulous",
     "ja_sentence": "彼女はいつも綿密な計画を立てる。",
     "model_answer": "She always makes meticulous plans.",
     "tips": "「注意深い」という意味では careful より強い、細部までこだわるニュアンス。"
   }
   ```
   Rules:
   - Choose 3-4 words from the `vocab` list above (a subset, not all 10).
   - `ja_sentence`: one short, natural Japanese sentence.
   - `model_answer`: one English sentence that uses the word/idiom naturally and correctly.
   - `tips`: optional; include only if there's a genuinely useful nuance/synonym note in Japanese. Omit the field entirely rather than leaving it empty.

4. Use the Write tool to save the JSON payload to `/tmp/ielts-TODAY.json`:
   ```json
   {"date": "TODAY", "vocab": [...10 items...], "sentences": [...3-4 items...]}
   ```

5. Read the secret from the local env file and POST to the API:
   ```bash
   SECRET=$(grep IELTS_API_SECRET ~/Documents/ielts-app/.env.local | cut -d= -f2)
   curl -s -X POST https://ielts-app-sepia.vercel.app/api/exercises \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $SECRET" \
     -d @/tmp/ielts-TODAY.json
   ```
   Expected response: `{"success":true}`
   If response is `{"error":"Already exists"}`: output "Already generated today, skipping."
   If response is anything else: output the error and stop.

6. Output: "Today's exercises saved. View at: https://ielts-app-sepia.vercel.app/TODAY"
```

- [ ] **Step 2: Dry-run validate the new prompt's output shape**

Generate one sample day's JSON by hand-following the new prompt rules (10 vocab items, 3-4 sentence items) and save it to the scratchpad, e.g. `/tmp/ielts-dryrun.json`. Then validate it against the same rules `isValidDailyContent` enforces, using a small inline Node check (no server needed):

```bash
node -e "
const fs = require('fs')
const body = JSON.parse(fs.readFileSync('/tmp/ielts-dryrun.json', 'utf8'))
const vocabOk = Array.isArray(body.vocab) && body.vocab.length === 10 &&
  body.vocab.every(v => typeof v.order === 'number' && typeof v.word === 'string' &&
    Array.isArray(v.choices) && v.choices.length === 4 && v.choices.every(c => typeof c === 'string') &&
    typeof v.answerIndex === 'number' && v.answerIndex >= 0 && v.answerIndex < 4)
const sentencesOk = Array.isArray(body.sentences) && body.sentences.length >= 3 && body.sentences.length <= 4 &&
  body.sentences.every(s => typeof s.order === 'number' && typeof s.word === 'string' &&
    typeof s.ja_sentence === 'string' && typeof s.model_answer === 'string' &&
    (s.tips === undefined || typeof s.tips === 'string'))
console.log(JSON.stringify({ vocabOk, sentencesOk }))
"
```

Expected: `{"vocabOk":true,"sentencesOk":true}`. If either is `false`, fix the sample JSON (or the prompt rules, if the sample reveals the prompt is ambiguous) and re-run until both are `true`.

- [ ] **Step 3: No git commit for this step**

`~/.claude/commands/ielts-daily.md` lives outside this repository's git tree — there is nothing to commit here. This task is complete once Steps 1-2 pass.

---

## Final verification checklist

- [ ] `npx tsc --noEmit` passes with zero errors (confirmed in Task 6, Step 2).
- [ ] `npm run build` passes (confirmed in Task 6, Step 3).
- [ ] `daily_exercises` table is empty of old-shape rows (confirmed in Task 2) and free of the `2099-01-01` test row (confirmed in Task 6, Step 5 — run it again if Step 6's manual walkthrough re-seeded it).
- [ ] Manual walkthrough in Task 6 Step 6 confirms: quiz retry-on-wrong-answer, phase transition on a clean round, writing-phase prev/next, and reload-resets-progress.
- [ ] `~/.claude/commands/ielts-daily.md` produces a schema-valid payload (confirmed in Task 7, Step 2).
