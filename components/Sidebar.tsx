import DateNav from '@/components/DateNav'
import { Progress } from '@/components/ui/progress'

interface Props {
  currentDate: string
  phaseLabel: string
  currentStep: number
  totalSteps: number
  prevDate?: string | null
  nextDate?: string | null
}

export default function Sidebar({
  currentDate,
  phaseLabel,
  currentStep,
  totalSteps,
  prevDate = null,
  nextDate = null,
}: Props) {
  const progressValue = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-border bg-surface px-5 py-6 lg:block">
      <div className="flex h-full flex-col">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
            IELTS Writing
          </p>
          <h1 className="mt-1 text-xl font-bold text-fg">Practice Session</h1>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
            Date
          </p>
          <DateNav date={currentDate} prevDate={prevDate} nextDate={nextDate} />
        </div>

        <div className="mt-8 rounded-lg border border-border bg-surface-2 p-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
                {phaseLabel}
              </p>
              <p className="mt-1 text-2xl font-bold text-fg">
                {currentStep} / {totalSteps}
              </p>
            </div>
            <span className="text-sm font-semibold text-answer">
              {Math.round(progressValue)}%
            </span>
          </div>
          <Progress value={progressValue} />
        </div>

        <div className="mt-auto text-xs leading-relaxed text-fg-faint">
          Draft answers stay only in this browser session.
        </div>
      </div>
    </aside>
  )
}
