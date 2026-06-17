import Link from 'next/link'

interface Props {
  date: string
  prevDate: string | null
  nextDate: string | null
}

export default function DateNav({ date, prevDate, nextDate }: Props) {
  return (
    <div className="flex items-center justify-between px-1 py-2 mb-2">
      {prevDate ? (
        <Link
          href={`/${prevDate}`}
          className="text-[#007aff] text-sm font-medium"
        >
          ← {prevDate}
        </Link>
      ) : (
        <span className="text-gray-300 text-sm">←</span>
      )}

      <span className="text-sm font-semibold text-gray-600">{date}</span>

      {nextDate ? (
        <Link
          href={`/${nextDate}`}
          className="text-[#007aff] text-sm font-medium"
        >
          {nextDate} →
        </Link>
      ) : (
        <span className="text-gray-300 text-sm">→</span>
      )}
    </div>
  )
}
