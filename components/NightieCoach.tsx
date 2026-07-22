import Image from 'next/image'

interface Props {
  message: string
  compact?: boolean
  mood?: 'cheer' | 'study' | 'proud'
}

export default function NightieCoach({ message, compact = false }: Props) {
  return (
    <div className={`flex items-center ${compact ? 'gap-3' : 'gap-4'}`}>
      <div
        className={`${compact ? 'h-16 w-16 rounded-2xl' : 'h-24 w-24 rounded-[28px]'} nightie-glow relative shrink-0 overflow-hidden border border-[#ffd43b]/25 bg-gradient-to-br from-violet-400/25 to-answer/15 p-1 shadow-[0_7px_0_rgba(10,11,16,0.45)]`}
        aria-hidden="true"
      >
        <Image
          src="/images/nightie-coach.png"
          alt=""
          fill
          sizes={compact ? '64px' : '96px'}
          className="rounded-[inherit] object-cover object-center"
        />
      </div>
      <div className="min-w-0 flex-1 rounded-2xl border border-violet-300/20 bg-surface-2/90 px-4 py-3 shadow-[0_7px_0_rgba(10,11,16,0.45)]">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">黒猫コーチ・ナイチー</p>
        <p className="mt-1 break-words text-sm font-semibold leading-relaxed text-fg">{message}</p>
      </div>
    </div>
  )
}
