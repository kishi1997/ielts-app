import Link from 'next/link'

interface Props {
  date: string
  prevDate: string | null
  nextDate: string | null
}

export default function DateNav({ date, prevDate, nextDate }: Props) {
  const dayOfWeek = formatDayOfWeek(date)

  return (
    <nav className="flex items-center justify-between gap-3 lg:flex-col lg:items-stretch">
      {prevDate ? (
        <Link
          href={`/${prevDate}`}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-jp transition-colors hover:bg-surface-2"
        >
          <span className="lg:hidden">Prev</span>
          <span className="hidden lg:inline">Previous</span>
        </Link>
      ) : (
        <span className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-fg-faint">
          <span className="lg:hidden">Prev</span>
          <span className="hidden lg:inline">Previous</span>
        </span>
      )}

      <div className="min-w-0 text-center lg:rounded-lg lg:border lg:border-border lg:bg-surface lg:px-3 lg:py-4">
        <p className="truncate text-sm font-bold text-fg">{date}</p>
        <p className="mt-0.5 text-xs font-medium text-fg-soft">{dayOfWeek}</p>
      </div>

      {nextDate ? (
        <Link
          href={`/${nextDate}`}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-jp transition-colors hover:bg-surface-2"
        >
          <span className="lg:hidden">Next</span>
          <span className="hidden lg:inline">Next</span>
        </Link>
      ) : (
        <span className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-fg-faint">
          <span className="lg:hidden">Next</span>
          <span className="hidden lg:inline">Next</span>
        </span>
      )}
    </nav>
  )
}

function formatDayOfWeek(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('ja-JP', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}
