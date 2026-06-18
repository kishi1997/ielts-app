'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Exercise } from '@/lib/types'
import ExerciseCard from '@/components/ExerciseCard'
import MobileHeader from '@/components/MobileHeader'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface Props {
  exercises: Exercise[]
}

export default function ExerciseSession({ exercises }: Props) {
  const pathname = usePathname()
  const [currentIndex, setCurrentIndex] = useState(0)
  const totalSteps = exercises.length
  const currentStep = totalSteps > 0 ? currentIndex + 1 : 0
  const progressValue = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0
  const currentExercise = exercises[currentIndex]

  const currentDate = useMemo(() => {
    const segment = pathname.split('/').filter(Boolean)[0]
    return segment ?? ''
  }, [pathname])

  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < totalSteps - 1

  function goPrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1))
  }

  function goNext() {
    setCurrentIndex((index) => Math.min(totalSteps - 1, index + 1))
  }

  if (!currentExercise) {
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
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
      <Sidebar
        currentDate={currentDate}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      <main className="px-4 pb-28 pt-24 lg:ml-72 lg:px-8 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-5 hidden rounded-lg border border-border bg-surface p-4 lg:block">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
                  Current Step
                </p>
                <p className="mt-1 text-lg font-bold text-fg">
                  {currentStep} / {totalSteps}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrevious}
                  disabled={!canGoPrevious}
                >
                  Previous
                </Button>
                <Button size="sm" onClick={goNext} disabled={!canGoNext}>
                  Next
                </Button>
              </div>
            </div>
            <Progress value={progressValue} />
          </div>

          <ExerciseCard exercise={currentExercise} />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={goPrevious}
            disabled={!canGoPrevious}
          >
            Previous
          </Button>
          <Button className="flex-1" onClick={goNext} disabled={!canGoNext}>
            Next
          </Button>
        </div>
      </nav>
    </div>
  )
}
