'use client'

import { useState } from 'react'
import { DOMAINS, QUESTIONS, DOMAIN_ACCENT, type DomainId, type Preferences } from '@/lib/onboarding'

interface Props {
  selectedDomains: DomainId[]
  preferences: Preferences
  onBack: () => void
}

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? 'MOCK'

type Status = 'idle' | 'loading' | 'done'

export default function Step3Summary({ selectedDomains, preferences, onBack }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [payload, setPayload] = useState<object | null>(null)

  const handleSubmit = async () => {
    const builtPrefs: Record<string, Record<string, string>> = {}
    for (const domainId of selectedDomains) {
      builtPrefs[domainId] = preferences[domainId] ?? {}
    }

    const p = {
      userId: 'temp_user_001',
      domains: selectedDomains,
      preferences: builtPrefs,
      timestamp: new Date().toISOString(),
    }

    setStatus('loading')
    setPayload(p)

    if (WEBHOOK_URL === 'MOCK') {
      console.log('[MOCK] webhook payload:', JSON.stringify(p, null, 2))
      await new Promise(r => setTimeout(r, 2000))
    } else {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      })
    }

    setStatus('done')
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-[#c4b5fd] animate-spin" />
        <p className="text-white/50 text-sm">취향을 분석하는 중이에요...</p>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="animate-fadeSlideIn">
        <div className="text-center mb-6">
          <p className="text-2xl font-bold mb-1">큐레이터가 준비됐어요 ✨</p>
          <p className="text-xs text-white/40 mt-2">나중에 이 자리에 추천 결과가 표시될 거예요</p>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 overflow-auto max-h-[60vh]">
          <p className="text-xs text-white/30 mb-3 font-mono uppercase tracking-widest">payload</p>
          <pre className="text-xs text-[#a8edce] font-mono whitespace-pre-wrap break-all leading-relaxed">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">이렇게 이해했어요</h2>
      <p className="text-sm text-white/40 mb-6">선택한 취향을 확인해 보세요</p>

      <div className="flex flex-col gap-4 mb-8">
        {selectedDomains.map(domainId => {
          const domain = DOMAINS.find(d => d.id === domainId)!
          const accent = DOMAIN_ACCENT[domainId]
          const qs = QUESTIONS[domainId]
          const prefs = preferences[domainId] ?? {}

          return (
            <div key={domainId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-3" style={{ color: accent }}>
                <span>{domain.emoji}</span>
                <span className="font-semibold text-sm">{domain.label}</span>
              </div>
              <div className="flex flex-col gap-2">
                {qs.map(q => (
                  <div key={q.key} className="flex justify-between items-start gap-4 text-xs">
                    <span className="text-white/35 shrink-0">{q.question}</span>
                    <span style={{ color: accent }} className="font-medium text-right">
                      {prefs[q.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold border border-white/15 text-white/50 hover:border-white/30 hover:text-white/70 transition-all"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          className="flex-[2] py-3.5 rounded-xl font-semibold text-sm bg-[#a8edce] text-black hover:bg-[#b8f5de] transition-all cursor-pointer"
        >
          큐레이션 시작하기
        </button>
      </div>
    </div>
  )
}
