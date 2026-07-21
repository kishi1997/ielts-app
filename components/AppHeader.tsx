import Link from 'next/link'
import Image from 'next/image'
import { signOut } from '@/auth'

interface Props {
  active: 'dashboard' | 'practice' | 'review' | 'archive'
  userName?: string | null
}

const links = [
  { href: '/dashboard', label: 'Quest Home', key: 'dashboard', icon: '⌂', group: 'TONIGHT' },
  { href: '/', label: 'Lesson Trail', key: 'practice', icon: '▱', group: 'TONIGHT' },
  { href: '/review', label: 'Review List', key: 'review', icon: '↻', group: 'TONIGHT' },
  { href: '/archive', label: 'Archive', key: 'archive', icon: '◷', group: 'MY ROOM' },
] as const

export default function AppHeader({ active, userName }: Props) {
  const initial = userName?.trim().slice(0, 1).toLowerCase() || 'n'

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] overflow-hidden border-r border-white/12 bg-[#070a0e]/96 px-3 py-4 shadow-[12px_0_40px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:flex lg:flex-col">
        <div className="sidebar-play-shapes" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <Link href="/dashboard" className="mb-8 flex min-w-0 items-center gap-3 rounded-lg border border-[#ffd43b]/25 bg-[#11140d] p-3 shadow-[0_6px_0_#030405]">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#ffd43b]/35">
            <Image
              src="/images/nightie-coach.png"
              alt="黒猫コーチのナイチー"
              fill
              sizes="56px"
              className="object-cover object-center"
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-white">Writing Quest</span>
            <span className="block truncate text-xs font-black text-answer">with ナイチー</span>
          </span>
        </Link>

        <nav className="space-y-7" aria-label="メインナビゲーション">
          {['TONIGHT', 'MY ROOM'].map((group) => (
            <div key={group}>
              <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-wide text-white/35">{group}</p>
              <div className="space-y-1">
                {links.filter((link) => link.group === group).map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-black transition ${
                      active === link.key
                        ? 'bg-[#58cc02] text-[#092100] shadow-[0_5px_0_#2c7100]'
                        : 'text-white/58 hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center text-base" aria-hidden="true">{link.icon}</span>
                    <span className="truncate">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto rounded-lg border border-[#4dabf7]/20 bg-[#071522] p-3">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black text-[#74c0fc]">COACH NOTE</p>
              <p className="mt-2 text-xs leading-5 text-white/60">迷った問題はナイチーに預けて、次に書けたら外そう。</p>
            </div>
            <div className="cat-tower-mini shrink-0" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 rounded-full bg-[#58cc02]" />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080b10]/90 backdrop-blur-xl lg:ml-[268px]">
        <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
          <Link href="/dashboard" className="mr-auto flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-answer text-lg font-black text-[#092100] shadow-[0_4px_0_#2c7100]">✦</span>
            <span className="truncate text-xs font-black uppercase tracking-wide text-fg-soft sm:text-sm">Night Study Mode</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex lg:hidden" aria-label="タブナビゲーション">
            {links.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                  active === link.key ? 'bg-surface-2 text-answer' : 'text-fg-soft hover:bg-surface hover:text-fg'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/20 bg-[#8a6d61] text-sm font-black text-white shadow-[0_3px_0_rgba(0,0,0,0.45)]">
            {initial}
          </div>
        </div>

        <nav className="flex overflow-x-auto border-t border-white/5 px-3 py-2 md:hidden" aria-label="モバイルナビゲーション">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-black ${active === link.key ? 'bg-surface-2 text-answer' : 'text-fg-soft'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="fixed bottom-4 left-4 z-50 hidden lg:block">
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <button className="rounded-lg border border-white/15 bg-white/8 px-4 py-2 text-sm font-black text-white/62 transition hover:bg-white/12 hover:text-white" title="ログアウト">
            Sign Out
          </button>
        </form>
      </div>
    </>
  )
}
