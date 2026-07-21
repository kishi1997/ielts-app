import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import NightieCoach from '@/components/NightieCoach'
import { getCurrentUserOrRedirect } from '@/lib/current-user'
import { getAllDates } from '@/lib/db'

export const dynamic = 'force-dynamic'

function groupByMonth(dates: string[]): Record<string, string[]> {
  return dates.reduce<Record<string, string[]>>((groups, date) => {
    const month = date.slice(0, 7)
    groups[month] = [...(groups[month] ?? []), date]
    return groups
  }, {})
}

function formatMonth(month: string): string {
  const [year, value] = month.split('-')
  return `${year}年${Number(value)}月`
}

export default async function ArchivePage() {
  const user = await getCurrentUserOrRedirect()

  const dates = await getAllDates()
  const grouped = groupByMonth(dates)

  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader active="archive" userName={user.name} />
      <main className="lg:ml-[268px]">
        <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10">
          <div className="mb-7 grid items-center gap-5 md:grid-cols-[1fr_340px]">
            <div>
              <p className="label-text text-jp">Practice archive</p>
              <h1 className="mt-2 text-3xl font-black text-fg sm:text-4xl">これまでの課題</h1>
              <p className="mt-3 text-sm text-fg-soft">{dates.length}日分の練習から、もう一度挑戦できます。</p>
            </div>
            <NightieCoach compact message="前に解いた問題は、少し時間をあけると良い復習になるよ。" mood="study" />
          </div>

          <div className="space-y-6">
            {Object.keys(grouped).sort().reverse().map((month) => (
              <section key={month} className="game-card overflow-hidden">
                <h2 className="border-b border-white/7 bg-surface-2/60 px-5 py-4 text-sm font-black text-jp">{formatMonth(month)}</h2>
                <div className="grid gap-px bg-border sm:grid-cols-2">
                  {grouped[month].map((date) => (
                    <Link key={date} href={`/${date}`} className="flex min-w-0 items-center justify-between gap-3 bg-surface px-5 py-4 transition hover:bg-surface-2">
                      <span className="min-w-0 break-words font-bold text-fg">{date}</span>
                      <span className="shrink-0 text-sm font-black text-answer">挑戦する →</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
