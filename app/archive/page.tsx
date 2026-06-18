import Link from 'next/link'
import { getAllDates } from '@/lib/db'

export const dynamic = 'force-dynamic'

function groupByMonth(dates: string[]): Record<string, string[]> {
  return dates.reduce((acc, date) => {
    const month = date.slice(0, 7)
    if (!acc[month]) acc[month] = []
    acc[month].push(date)
    return acc
  }, {} as Record<string, string[]>)
}

function formatMonth(ym: string): string {
  const [year, month] = ym.split('-')
  return `${year}年${parseInt(month)}月`
}

function formatDayOfWeek(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('ja-JP', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

export default async function ArchivePage() {
  const dates = await getAllDates()
  const grouped = groupByMonth(dates)
  const months = Object.keys(grouped).sort().reverse()

  return (
    <main className="min-h-screen bg-bg px-4 py-8 text-fg">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
              IELTS Writing
            </p>
            <h1 className="mt-1 text-2xl font-bold">Archive</h1>
            <p className="mt-1 text-sm text-fg-soft">{dates.length} days</p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-jp transition-colors hover:bg-surface-2"
          >
            今日へ戻る
          </Link>
        </div>

        {months.map((month) => (
          <section key={month} className="mb-7">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-faint">
              {formatMonth(month)}
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              {grouped[month].map((date, i) => (
                <Link
                  key={date}
                  href={`/${date}`}
                  className={`flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-surface-2 ${
                    i < grouped[month].length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <span>
                    <span className="font-semibold text-fg">{date}</span>
                    <span className="ml-2 text-fg-soft">{formatDayOfWeek(date)}</span>
                  </span>
                  <span className="text-jp">Open</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
