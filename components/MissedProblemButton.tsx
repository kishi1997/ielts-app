'use client'

import { useState } from 'react'
import type { ProblemType } from '@/lib/types'

interface Props {
  sourceDate: string
  problemType: ProblemType
  problemOrder: number
}

export default function MissedProblemButton({ sourceDate, problemType, problemOrder }: Props) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function save() {
    if (state === 'saving' || state === 'saved') return
    setState('saving')

    try {
      const response = await fetch('/api/missed-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceDate, problemType, problemOrder }),
      })

      if (!response.ok) throw new Error('Failed to save')
      setState('saved')
    } catch {
      setState('error')
    }
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={state === 'saving' || state === 'saved'}
      className="min-h-11 min-w-0 rounded-xl border border-error/35 bg-error-bg px-4 py-2 text-sm font-black text-error shadow-[0_4px_0_rgba(124,36,49,0.65)] transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-75"
    >
      <span className="break-words">
        {state === 'saving' && '保存中…'}
        {state === 'saved' && '✓ 復習リストに保存済み'}
        {state === 'error' && 'もう一度保存する'}
        {state === 'idle' && 'まだできない問題に追加'}
      </span>
    </button>
  )
}
