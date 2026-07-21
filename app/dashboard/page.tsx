import Link from 'next/link'
import Image from 'next/image'
import AppHeader from '@/components/AppHeader'
import { getCurrentUserOrRedirect } from '@/lib/current-user'
import { getActiveMissedProblemCount, getAllDates } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUserOrRedirect()

  const [dates, missedCount] = await Promise.all([
    getAllDates(),
    getActiveMissedProblemCount(user.id),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const targetDate = dates.includes(today) ? today : dates[0]

  return (
    <div className="relative min-h-dvh overflow-hidden bg-bg">
      <div className="playground-backdrop" aria-hidden="true">
        <span className="float-toy float-toy-star">★</span>
        <span className="float-toy float-toy-paw">●</span>
        <span className="float-toy float-toy-yarn" />
        <span className="float-toy float-toy-moon">◔</span>
        <span className="float-toy float-toy-fish">⌁</span>
      </div>
      <AppHeader active="dashboard" userName={user.name} />
      <main className="relative z-10 lg:ml-[268px]">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
          <section className="relative min-h-[330px] overflow-hidden border-y border-white/10 bg-[#0b0f14] shadow-[0_12px_45px_rgba(0,0,0,0.38)]">
            <Image
              src="/images/nightie-hero-room.png"
              alt="星空の書斎で英語を勉強する黒猫コーチのナイチー"
              fill
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,12,0.99)_0%,rgba(5,8,12,0.9)_42%,rgba(5,8,12,0.3)_74%,rgba(5,8,12,0.08)_100%)]" />
            <div className="hero-play-shapes" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="relative z-10 flex min-h-[330px] max-w-2xl flex-col justify-center p-6 sm:p-10">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg border border-[#ffd43b]/25 bg-[#171607]/85 px-3 py-2 text-xs font-black text-[#ffd43b] backdrop-blur">
                ◷ TONIGHT&apos;S WRITING QUEST
              </div>
              <h1 className="max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl">
                書けなかった夜ほど、<span className="text-answer">強くなる。</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/68 sm:text-base">
                ナイチーと一緒に、まず一文。迷った問題は印をつけて、できるようになるまで迎えにいこう。
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {targetDate ? (
                  <a href={`/${targetDate}`} className="game-button min-h-13 px-6 text-base">✦ クエストを始める</a>
                ) : (
                  <span className="rounded-lg border border-white/10 bg-black/30 px-5 py-4 text-sm font-bold text-fg-soft">課題の追加を待っています</span>
                )}
                <Link href="/review" className="game-button-secondary min-h-13 px-6 text-base">↻ 復習リストへ</Link>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="status-card status-card-play border-[#ff6b6b]/30 bg-[#1c0e10]">
              <span className="status-card-icon text-[#ff8787]" aria-hidden="true">♨</span>
              <p className="label-text text-[#ff8787]">NIGHT STREAK</p>
              <p className="mt-4 text-2xl font-black text-white">1 night</p>
              <p className="mt-1 text-xs text-white/45">今日の一文からスタート</p>
            </div>
            <div className="status-card status-card-play border-[#4dabf7]/30 bg-[#071522]">
              <span className="status-card-icon text-[#74c0fc]" aria-hidden="true">◎</span>
              <p className="label-text text-[#74c0fc]">LESSON MAP</p>
              <p className="mt-4 text-2xl font-black text-white">{dates.length} quests</p>
              <p className="mt-1 text-xs text-white/45">Task 1 practice set</p>
            </div>
            <div className="status-card status-card-play border-[#ffd43b]/30 bg-[#191606]">
              <span className="status-card-icon text-[#ffd43b]" aria-hidden="true">◇</span>
              <p className="label-text text-[#ffd43b]">STAR DUST</p>
              <p className="mt-4 text-2xl font-black text-white">{Math.max(0, dates.length - missedCount)} gems</p>
              <p className="mt-1 text-xs text-white/45">復習を終えると獲得</p>
            </div>
          </section>

          <section className="mt-8 grid items-center gap-5 border-y border-white/[0.08] bg-[#0c1117]/80 px-5 py-6 md:grid-cols-[96px_1fr_auto] md:px-7">
            <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-lg border border-[#ffd43b]/25 shadow-[0_6px_0_#030405]">
              <Image
                src="/images/nightie-coach.png"
                alt="黒猫コーチのナイチー"
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </div>
            <div>
              <p className="label-text text-[#ffd43b]">★ ナイチーからのヒント</p>
              <p className="mt-2 text-lg font-black text-white md:text-xl">
                完璧な答えより、比べられる自分の答えを一つ残そう。
              </p>
              <p className="mt-2 text-sm leading-6 text-white/50">
                わからなければ解説を開いて復習リストへ。次に書けたら星を回収。
              </p>
            </div>
            <div className="hidden rounded-lg border border-[#58cc02]/25 bg-[#58cc02]/10 px-4 py-3 text-center md:block">
              <p className="text-xs font-bold text-white/45">NEXT REWARD</p>
              <p className="mt-1 font-black text-answer">First Sentence</p>
            </div>
          </section>

          <section id="lessons" className="mt-10 scroll-mt-24">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="label-text text-answer">LESSON TRAIL</p>
                <h2 className="mt-1 text-3xl font-black text-fg">今夜のクエスト</h2>
              </div>
              <p className="hidden text-sm text-fg-faint sm:block">1つ選んで書き始める</p>
            </div>
            <div className="mb-4 hidden items-center gap-4 rounded-lg border border-answer/20 bg-[#0b1408]/80 px-4 py-3 text-sm text-fg-soft shadow-[0_5px_0_rgba(0,0,0,0.35)] md:flex">
              <div className="cat-tower-mini" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p className="min-w-0 break-words">
                ナイチーの遊び場マップ。上の足場から順に、語彙、英作文、復習へジャンプしよう。
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {dates.slice(0, 4).map((date, index) => (
                <Link key={date} href={`/${date}`} className={`quest-card quest-card-${index % 4}`}>
                  <span className="quest-icon">{['▥', '⌁', '◔', '◎'][index % 4]}</span>
                  <span className="min-w-0">
                    <span className="label-text text-fg-faint">QUEST {String(index + 1).padStart(2, '0')} · Writing</span>
                    <span className="mt-2 block break-words text-lg font-black text-fg">IELTS Writing Practice</span>
                    <span className="mt-3 block break-words text-sm leading-6 text-fg-soft">{date} の語彙と瞬間英作文</span>
                    <span className="mt-5 block h-1.5 rounded-full bg-white/10">
                      <span className="block h-full w-1/5 rounded-full bg-white/25" />
                    </span>
                  </span>
                  <span className="ml-auto shrink-0 text-2xl text-white/35">→</span>
                </Link>
              ))}
            </div>
          </section>

          <section id="review" className="mt-10 scroll-mt-24">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="label-text text-[#ffd43b]">↻ REVIEW</p>
                <h2 className="mt-1 text-3xl font-black text-fg">できなかった問題</h2>
              </div>
              <p className="hidden text-sm text-fg-faint sm:block">できるようになったら外す</p>
            </div>
            <Link href="/review" className="flex items-center gap-4 rounded-lg border border-dashed border-[#ffd43b]/30 bg-[#101407]/80 p-5 transition hover:bg-[#151b0a]">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#ffd43b]/25">
                <Image src="/images/nightie-coach.png" alt="" fill sizes="64px" className="object-cover object-center" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block break-words text-lg font-black text-fg">
                  {missedCount === 0 ? '復習リストは空です' : `${missedCount}問が復習待ちです`}
                </span>
                <span className="mt-1 block break-words text-sm leading-6 text-fg-soft">
                  わからない問題を見つけたら、ナイチーがここで預かります。
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
