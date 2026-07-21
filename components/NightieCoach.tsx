interface Props {
  message: string
  compact?: boolean
  mood?: 'cheer' | 'study' | 'proud'
}

export default function NightieCoach({ message, compact = false, mood = 'cheer' }: Props) {
  const eyeShape = mood === 'proud' ? 'M28 38 Q32 34 36 38' : 'M29 36h5'

  return (
    <div className={`flex items-center ${compact ? 'gap-3' : 'gap-4'}`}>
      <div
        className={`${compact ? 'h-16 w-16' : 'h-24 w-24'} nightie-glow shrink-0 rounded-[28px] bg-gradient-to-br from-violet-400/25 to-answer/15 p-1`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 80 80" className="h-full w-full overflow-visible">
          <path d="M19 31 17 12l16 12M61 31l2-19-16 12" fill="#0c0d12" stroke="#8b7df2" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M15 43c0-17 10-26 25-26s25 9 25 26c0 16-9 27-25 27S15 59 15 43Z" fill="#0c0d12" stroke="#3a3c4d" strokeWidth="2.5" />
          <path d={eyeShape} fill="none" stroke="#b6ff67" strokeWidth="3.5" strokeLinecap="round" />
          <path d={mood === 'proud' ? 'M44 38 Q48 34 52 38' : 'M46 36h5'} fill="none" stroke="#b6ff67" strokeWidth="3.5" strokeLinecap="round" />
          <path d="m38 44 2 2 2-2" fill="#ff9cbc" stroke="#ff9cbc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M40 47c-2 4-6 4-8 2m8-2c2 4 6 4 8 2" fill="none" stroke="#e8e9ef" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M28 47 9 44m19 8L8 54m44-7 19-3m-19 8 20 2" fill="none" stroke="#727687" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M22 65c-5 3-7 7-6 12m42-12c5 3 7 7 6 12" fill="none" stroke="#3a3c4d" strokeWidth="3" strokeLinecap="round" />
          <circle cx="58" cy="20" r="6" fill="#ffca57" />
          <path d="m58 15 1.5 3 3.5.5-2.5 2.5.7 3.5-3.2-1.7-3.2 1.7.7-3.5-2.5-2.5 3.5-.5Z" fill="#fff3c4" />
        </svg>
      </div>
      <div className="min-w-0 flex-1 rounded-2xl border border-violet-300/20 bg-surface-2/90 px-4 py-3 shadow-[0_7px_0_rgba(10,11,16,0.45)]">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">黒猫コーチ・ナイチー</p>
        <p className="mt-1 break-words text-sm font-semibold leading-relaxed text-fg">{message}</p>
      </div>
    </div>
  )
}
