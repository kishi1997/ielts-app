import { Progress } from '@/components/ui/progress'

interface Props {
  currentDate: string
  currentStep: number
  totalSteps: number
}

export default function MobileHeader({
  currentDate,
  currentStep,
  totalSteps,
}: Props) {
  const progressValue = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-fg">{currentDate}</p>
          <p className="text-xs font-medium text-fg-soft">IELTS Writing</p>
        </div>
        <p className="shrink-0 text-sm font-bold text-answer">
          {currentStep} / {totalSteps}
        </p>
      </div>
      <Progress value={progressValue} className="mt-3 h-1.5" />
    </header>
  )
}
