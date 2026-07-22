import Link from 'next/link'
import Image from 'next/image'
import { signOut } from '@/auth'

interface Props {
  active: 'dashboard' | 'practice' | 'review' | 'archive'
  userName?: string | null
}

const links = [
  { href: '/dashboard', label: 'Quest Home', key: 'dashboard', icon: 'home', group: 'TONIGHT' },
  { href: '/dashboard#lessons', label: 'Lesson Trail', key: 'practice', icon: 'trail', group: 'TONIGHT' },
  { href: '/dashboard#review', label: 'Review List', key: 'review', icon: 'review', group: 'TONIGHT' },
  { href: '/archive', label: 'Archive', key: 'archive', icon: 'archive', group: 'MY ROOM' },
] as const

function SidebarIcon({ type }: { type: (typeof links)[number]['icon'] }) {
  const className = 'h-[19px] w-[19px] stroke-current stroke-[2.4] text-current'

  if (type === 'home') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M4 10.7 12 4l8 6.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 10.2v8.3h4.1v-5h2.8v5h4.1v-8.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (type === 'trail') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M5 5.5h5.7v5.7H5zM13.3 5.5H19M13.3 9H17" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 15.2c2.1-1.4 4-.7 5.8.6 2 1.5 4.5 2.1 8.2-.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (type === 'review') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M5.6 8.6A7.2 7.2 0 0 1 18 6.9l1.2 1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.4 5.3v3.5h-3.5M18.4 15.4A7.2 7.2 0 0 1 6 17.1l-1.2-1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.6 18.7v-3.5h3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 4.8v7.4l5 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.4 12a7.4 7.4 0 1 1-2.2-5.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.2 3.8v3h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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
        <div className="sidebar-nightie-perch" aria-hidden="true">
          <Image
            src="/images/nightie-floating.webp"
            alt=""
            width={150}
            height={150}
            sizes="150px"
            className="sidebar-floating-nightie"
          />
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
                        ? 'bg-answer text-[#2b1100] shadow-[0_5px_0_#9a4600]'
                        : 'text-white/58 hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md leading-none" aria-hidden="true">
                      <SidebarIcon type={link.icon} />
                    </span>
                    <span className="truncate">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080b10]/90 backdrop-blur-xl lg:ml-[268px]">
        <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
          <Link href="/dashboard" className="mr-auto flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-answer text-lg font-black text-[#2b1100] shadow-[0_4px_0_#9a4600]">✦</span>
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
