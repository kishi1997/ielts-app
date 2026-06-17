import Link from 'next/link'
import { getAllDates } from '@/lib/db'

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

export default async function ArchivePage() {
  const dates = await getAllDates()
  const grouped = groupByMonth(dates)
  const months = Object.keys(grouped).sort().reverse()

  return (
    <main className="max-w-xl mx-auto px-3 pb-8">
      <div className="pt-3 pb-3">
        <h1 className="text-base font-bold">Archive</h1>
        <p className="text-xs text-gray-400 mt-0.5">{dates.length} days</p>
      </div>

      {months.map((month) => (
        <div key={month} className="mb-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            {formatMonth(month)}
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {grouped[month].map((date, i) => (
              <Link
                key={date}
                href={`/${date}`}
                className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 ${
                  i < grouped[month].length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <span>{date}</span>
                <span className="text-[#007aff]">→</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </main>
  )
}
