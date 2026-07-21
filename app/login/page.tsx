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
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,12,0.98)_0%,rgba(5,8,12,0.9)_45%,rgba(5,8,12,0.38)_100%)]" />

      <div className="relative z-10 flex min-h-dvh items-center px-4 py-8 sm:px-8">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_380px]">
          <section className="flex min-h-[420px] flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#ffd43b]/25 bg-[#171607]/85 px-3 py-2 text-xs font-black text-[#ffd43b] backdrop-blur">
              ✦ IELTS WRITING QUEST
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight text-white sm:text-6xl">
              答えを見るだけで、<br /><span className="text-answer">終わらせない。</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/68">
              解説を読み、迷った問題をためて、できるまで戻る。黒猫コーチ「ナイチー」と毎日の Writing を少しずつ攻略しよう。
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-2 text-center text-xs font-black text-fg-soft">
              <div className="rounded-lg border border-white/10 bg-black/30 p-3 backdrop-blur">解説で理解</div>
              <div className="rounded-lg border border-white/10 bg-black/30 p-3 backdrop-blur">迷いを保存</div>
              <div className="rounded-lg border border-white/10 bg-black/30 p-3 backdrop-blur">できたら解除</div>
            </div>
          </section>

          <section className="game-card flex flex-col justify-center p-6 backdrop-blur-md sm:p-8">
            <NightieCoach message="おかえり！ 今日も一問ずつ、分かるを増やそう。" mood="cheer" />
            <div className="my-7 h-px bg-border" />
            <h2 className="text-xl font-black text-fg">学習をつづける</h2>
            <p className="mt-2 text-sm leading-6 text-fg-soft">
              Googleアカウントでログインして、復習リストと学習セッションを保存します。
            </p>
            <form
              className="mt-6"
              action={async () => {
                'use server'
                await signIn('google', { redirectTo: '/dashboard' })
              }}
            >
              <button className="flex min-h-13 w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 font-black text-slate-800 shadow-[0_6px_0_#b8bdc8] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#b8bdc8]">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 text-lg font-bold text-blue-600">G</span>
                Google でログイン
              </button>
            </form>
            <p className="mt-5 text-center text-[11px] leading-5 text-fg-faint">
              AI添削・有料機能は使用しません。学習記録は Cloudflare D1 に保存されます。
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
