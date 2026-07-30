import Link from 'next/link'
import Image from 'next/image'
import AppHeader from '@/components/AppHeader'
import { getCurrentUserOrRedirect } from '@/lib/current-user'
import { getActiveMissedProblemCount, getAllDates, getIncompleteQuestDates } from '@/lib/db'

export const dynamic = 'force-dynamic'

const APP_TIME_ZONE = 'America/Vancouver'
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarDay {
  key: string
  date: string | null
  day: number | null
  hasQuest: boolean
  isIncomplete: boolean
  isCompleted: boolean
  isToday: boolean
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

function getLocalTodayParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  }
}

function getMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

function buildMonthCalendar(
  year: number,
  month: number,
  today: string,
  exerciseDateSet: Set<string>,
  incompleteDateSet: Set<string>,
): CalendarDay[] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7

  return Array.from({ length: totalCells }, (_, cellIndex) => {
    const day = cellIndex - firstWeekday + 1
    if (day < 1 || day > daysInMonth) {
      return {
        key: `blank-${cellIndex}`,
        date: null,
        day: null,
        hasQuest: false,
        isIncomplete: false,
        isCompleted: false,
        isToday: false,
      }
    }

    const date = toDateKey(year, month, day)
    const hasQuest = exerciseDateSet.has(date)
    const isIncomplete = incompleteDateSet.has(date)

    return {
      key: date,
      date,
      day,
      hasQuest,
      isIncomplete,
      isCompleted: hasQuest && !isIncomplete,
      isToday: date === today,
    }
  })
}

export default async function DashboardPage() {
  const user = await getCurrentUserOrRedirect()

  const [dates, missedCount, incompleteDates] = await Promise.all([
    getAllDates(),
    getActiveMissedProblemCount(user.id),
    getIncompleteQuestDates(user.id),
  ])

  const todayParts = getLocalTodayParts()
  const today = toDateKey(todayParts.year, todayParts.month, todayParts.day)
  const targetDate = incompleteDates[0] ?? (dates.includes(today) ? today : dates[0])
  const completedCount = Math.max(0, dates.length - incompleteDates.length)
  const exerciseDateSet = new Set(dates)
  const incompleteDateSet = new Set(incompleteDates)
  const calendarDays = buildMonthCalendar(
    todayParts.year,
    todayParts.month,
    today,
    exerciseDateSet,
    incompleteDateSet,
  )
  const monthLabel = getMonthLabel(todayParts.year, todayParts.month)

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="playground-backdrop" aria-hidden="true">
        <span className="float-toy float-toy-guild-mark" />
        <span className="float-toy float-toy-scroll" />
        <span className="float-toy float-toy-lantern" />
        <span className="float-toy float-toy-moon">◔</span>
        <span className="float-toy float-toy-bone" />
        <span className="float-toy float-toy-banner" />
        <span className="float-toy float-toy-stone" />
      </div>
      <AppHeader active="dashboard" userName={user.name} />
      <main className="relative z-10 lg:ml-[268px]">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
          <section className="relative min-h-[330px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14]/58 shadow-[0_12px_45px_rgba(0,0,0,0.38)] backdrop-blur-[2px]">
            <Image
              src="/images/nightie-guild-hero-cat.webp"
              alt="夕暮れの学習ギルド拠点"
              fill
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover object-center opacity-45"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,12,0.96)_0%,rgba(5,8,12,0.86)_42%,rgba(5,8,12,0.4)_74%,rgba(5,8,12,0.16)_100%)]" />
            <div className="hero-play-shapes" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="relative z-10 flex min-h-[330px] max-w-2xl flex-col justify-center p-6 sm:p-10">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg border border-[#ffd43b]/25 bg-[#171607]/85 px-3 py-2 text-xs font-black text-[#ffd43b] backdrop-blur">
                <Image src="/images/nightie-guild-crest.png" alt="" width={22} height={22} className="h-5 w-5 object-contain" />
                DAILY PRACTICE
              </div>
              <h1 className="max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl">
                Words first<br /><span className="text-answer">Then one sentence</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/68 sm:text-base">
                今日の練習は、単語10問と短い英作文4問
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {targetDate ? (
                  <a href={`/${targetDate}`} className="game-button min-h-13 px-6 text-base">
                    <Image
                      src="/images/nightie-quest-arrow.png"
                      alt=""
                      width={34}
                      height={29}
                      className="h-7 w-8 object-contain"
                    />
                    {incompleteDates.length > 0 ? '未完了から始める' : '今日の練習を始める'}
                  </a>
                ) : (
                  <span className="rounded-lg border border-white/10 bg-black/30 px-5 py-4 text-sm font-bold text-fg-soft">課題の追加を待っています</span>
                )}
                <Link href="/review" className="game-button-secondary min-h-13 px-6 text-base">↻ できなかった問題</Link>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="status-card status-card-play border-[#ff6b6b]/30 bg-[#1c0e10]">
              <Image src="/images/nightie-quest-arrow.png" alt="" width={46} height={39} className="status-card-image" aria-hidden="true" />
              <p className="label-text text-[#ff8787]">OPEN</p>
              <p className="mt-4 text-2xl font-black text-white">{incompleteDates.length}件</p>
              <p className="mt-1 text-xs text-white/45">Oldest first</p>
            </div>
            <div className="status-card status-card-play border-[#4dabf7]/30 bg-[#071522]">
              <Image src="/images/nightie-guild-crest.png" alt="" width={42} height={42} className="status-card-image" aria-hidden="true" />
              <p className="label-text text-[#74c0fc]">DONE</p>
              <p className="mt-4 text-2xl font-black text-white">{completedCount}件</p>
              <p className="mt-1 text-xs text-white/45">Finished quests</p>
            </div>
            <div className="status-card status-card-play border-[#ffd43b]/30 bg-[#191606]">
              <Image src="/images/nightie-paw-icon.png" alt="" width={42} height={42} className="status-card-image" aria-hidden="true" />
              <p className="label-text text-[#ffd43b]">REVIEW</p>
              <p className="mt-4 text-2xl font-black text-white">{missedCount}件</p>
              <p className="mt-1 text-xs text-white/45">Saved cards</p>
            </div>
          </section>

          <section id="lessons" className="mt-10 scroll-mt-24">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="label-text text-answer">THIS MONTH</p>
                <h2 className="mt-1 text-3xl font-black text-fg">Quest Calendar</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-fg-soft">
                  Check what is done, then jump into open vocabulary practice from the calendar.
                </p>
              </div>
              <div className="w-fit rounded-xl border border-answer/25 bg-answer-bg px-4 py-3">
                <p className="label-text text-answer">{monthLabel}</p>
              </div>
            </div>

            <div className="game-card p-3 sm:p-5">
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="px-1 pb-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-fg-faint sm:text-xs"
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((calendarDay) => {
                  if (!calendarDay.date || !calendarDay.day) {
                    return (
                      <div
                        key={calendarDay.key}
                        className="min-h-[74px] rounded-xl border border-transparent bg-white/[0.015] opacity-40 sm:min-h-[94px]"
                        aria-hidden="true"
                      />
                    )
                  }

                  const baseClasses = calendarDay.hasQuest
                    ? 'border-white/10 bg-surface/90 shadow-[0_4px_0_rgba(0,0,0,0.35)]'
                    : 'border-white/[0.04] bg-white/[0.02] opacity-45'
                  const todayClasses = calendarDay.isToday ? 'ring-1 ring-answer/60' : ''

                  return (
                    <div
                      key={calendarDay.key}
                      className={`relative flex min-h-[74px] flex-col rounded-xl border p-2 transition sm:min-h-[94px] sm:p-3 ${baseClasses} ${todayClasses}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className={`text-sm font-black ${calendarDay.hasQuest ? 'text-fg' : 'text-fg-faint'}`}>
                          {calendarDay.day}
                        </span>
                        {calendarDay.isToday ? (
                          <span className="rounded-full border border-answer/35 bg-answer-bg px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-answer sm:text-[9px]">
                            Today
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-auto flex min-h-9 items-end justify-between gap-1">
                        {calendarDay.isCompleted ? (
                          <div className="flex min-w-0 items-center gap-1.5">
                            <Image
                              src="/images/nightie-guild-crest.png"
                              alt="Completed"
                              width={30}
                              height={30}
                              className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                            />
                            <span className="hidden truncate text-[10px] font-black uppercase tracking-[0.1em] text-answer sm:block">
                              Done
                            </span>
                          </div>
                        ) : calendarDay.isIncomplete ? (
                          <>
                            <span className="hidden truncate text-[10px] font-black uppercase tracking-[0.1em] text-fg-faint sm:block">
                              Open
                            </span>
                            <Link
                              href={`/${calendarDay.date}`}
                              aria-label={`Start quest for ${calendarDay.date}`}
                              className="ml-auto grid h-8 w-10 shrink-0 place-items-center transition hover:-translate-y-0.5 sm:h-9 sm:w-12"
                            >
                              <Image
                                src="/images/nightie-quest-arrow.png"
                                alt=""
                                width={42}
                                height={36}
                                className="h-8 w-10 object-contain drop-shadow-[0_3px_0_rgba(111,50,0,0.5)] sm:h-9 sm:w-12"
                              />
                            </Link>
                          </>
                        ) : (
                          <span className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-white/20">
                            No quest
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section id="review" className="mt-10 scroll-mt-24">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="label-text text-[#ffd43b]">↻ REVIEW</p>
                <h2 className="mt-1 text-3xl font-black text-fg">Review Box</h2>
              </div>
              <p className="hidden text-sm text-fg-faint sm:block">Turn tricky cards into wins</p>
            </div>
            <Link href="/review" className="flex items-center gap-4 rounded-lg border border-dashed border-[#ffd43b]/30 bg-[#141006]/80 p-5 transition hover:bg-[#1c1608]">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#ffd43b]/25">
                <Image src="/images/nightie-coach.png" alt="" fill sizes="64px" className="object-cover object-center" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block break-words text-lg font-black text-fg">
                  {missedCount === 0 ? 'No cards waiting' : `${missedCount} cards ready for review`}
                </span>
                <span className="mt-1 block break-words text-sm leading-6 text-fg-soft">
                  Save tricky cards here and revisit them anytime
                </span>
              </span>
              <span className="hidden rounded-lg bg-[#ffd43b]/12 px-4 py-2 text-sm font-black text-[#ffd43b] sm:block">
                REVIEW
              </span>
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}
