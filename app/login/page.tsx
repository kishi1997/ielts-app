import { redirect } from 'next/navigation'
import Image from 'next/image'
import { auth, signIn } from '@/auth'
import NightieCoach from '@/components/NightieCoach'
import { isAuthBypassEnabled } from '@/lib/current-user'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  if (isAuthBypassEnabled()) redirect('/dashboard')

  const session = await auth()
  if (session?.user) redirect('/dashboard')

  return (
    <main className="relative min-h-dvh overflow-hidden bg-bg">
      <Image
        src="/images/nightie-hero-room.png"
        alt=""
        fill
        sizes="100vw"
        className="-scale-x-100 object-cover object-[36%_center]"
        priority
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,12,0.92)_0%,rgba(5,8,12,0.64)_44%,rgba(5,8,12,0.2)_72%,rgba(5,8,12,0.5)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_44%,rgba(255,212,59,0.14),transparent_28%),radial-gradient(circle_at_76%_42%,rgba(88,204,2,0.1),transparent_25%)]" />

      <div className="relative z-10 flex min-h-dvh items-center px-4 py-8 sm:px-8">
        <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(340px,380px)]">
          <section className="flex min-h-[420px] flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#ffd43b]/25 bg-[#171607]/85 px-3 py-2 text-xs font-black text-[#ffd43b] backdrop-blur">
              ✦ IELTS VOCABULARY & SENTENCE WRITING
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight text-white sm:text-6xl">
              Build your words<br /><span className="text-answer">Boost your IELTS</span>
            </h1>
            <div className="mt-5 max-w-xl space-y-2 text-base leading-8 text-white/68">
              <p>
                毎日、IELTS向けの<span className="font-black text-white">英単語10問</span>と
                <span className="font-black text-white">英作文4問</span>を配信
              </p>
              <p>
                4択の語彙クイズで意味を確認し、短い日本語文を英語にする練習ができます
              </p>
              <p>
                迷ったカードはあとで見直せます
              </p>
            </div>
            <div className="mt-8 grid max-w-xl gap-2 text-xs font-black text-fg-soft sm:grid-cols-3">
              <div className="rounded-lg border border-answer/25 bg-answer/10 p-3 text-answer backdrop-blur">
                Vocabulary Quiz
                <span className="mt-1 block text-[11px] font-bold text-white/55">IELTS 6.5-7.0語彙</span>
              </div>
              <div className="rounded-lg border border-[#4dabf7]/25 bg-[#4dabf7]/10 p-3 text-[#8fd0ff] backdrop-blur">
                Sentence Writing
                <span className="mt-1 block text-[11px] font-bold text-white/55">日本語→英語の瞬間練習</span>
              </div>
              <div className="rounded-lg border border-[#ffd43b]/25 bg-[#ffd43b]/10 p-3 text-[#ffd43b] backdrop-blur">
                Review List
                <span className="mt-1 block text-[11px] font-bold text-white/55">苦手だけを保存</span>
              </div>
            </div>
            <div className="mt-5 max-w-xl rounded-2xl border border-white/10 bg-black/35 p-4 shadow-[0_7px_0_rgba(0,0,0,0.28)] backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Today&apos;s mini lesson</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-[0.88fr_1.12fr]">
                <div className="rounded-xl border border-answer/20 bg-[#1b1007]/80 p-3">
                  <p className="text-[10px] font-black uppercase text-answer">Meaning</p>
                  <p className="mt-1 text-lg font-black text-white">foster</p>
                  <p className="mt-1 text-xs text-white/58">育む・促進する</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b1118]/80 p-3">
                  <p className="text-[10px] font-black uppercase text-[#8fd0ff]">Example</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-white">
                    Group projects can foster communication skills.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/58">
                    （グループ活動はコミュニケーション能力を育むことができる。）
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="game-card login-card-glass flex flex-col justify-center p-6 backdrop-blur-sm sm:p-8">
            <NightieCoach message="IELTSの語彙と一文英作文を、毎日少しずつ増やしていこう。" mood="cheer" />
            <div className="my-7 h-px bg-border" />
            <h2 className="text-xl font-black text-fg">無料で学習をはじめる</h2>
            <p className="mt-2 text-sm leading-6 text-fg-soft">
              Googleアカウントでログインして、英単語クイズ・英作文練習・復習リストを保存します。
            </p>
            <form
              className="mt-6"
              action={async () => {
                'use server'
                await signIn('google', { redirectTo: '/dashboard' })
              }}
            >
              <button className="flex min-h-13 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 font-bold text-[#1f1f1f] shadow-[0_4px_0_#c8cdd8] transition hover:bg-[#f8fafd] active:translate-y-0.5 active:shadow-[0_2px_0_#c8cdd8]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
                </svg>
                Google でログイン
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
