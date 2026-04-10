'use client'

import { DOMAINS, QUESTIONS, DOMAIN_ACCENT, type DomainId, type Preferences } from '@/lib/onboarding'

interface Props {
  selectedDomains: DomainId[]
  preferences: Preferences
  setPreferences: (p: Preferences) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2Preferences({
  selectedDomains,
  preferences,
  setPreferences,
  onNext,
  onBack,
}: Props) {
  const setAnswer = (domain: DomainId, key: string, value: string) => {
    setPreferences({
      ...preferences,
      [domain]: { ...preferences[domain], [key]: value },
    })
  }

  const isComplete = selectedDomains.every(domainId => {
    const qs = QUESTIONS[domainId]
    const prefs = preferences[domainId] ?? {}
    return qs.every(q => prefs[q.key] !== undefined)
  })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">취향을 좀 더 알려주세요</h2>
      <p className="text-sm text-white/40 mb-6">각 질문에서 하나씩 선택해 주세요</p>

      <div className="flex flex-col gap-8 mb-8">
        {selectedDomains.map(domainId => {
          const domain = DOMAINS.find(d => d.id === domainId)!
          const accent = DOMAIN_ACCENT[domainId]
          const qs = QUESTIONS[domainId]
          const prefs = preferences[domainId] ?? {}

          return (
            <div key={domainId}>
              <div
                className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10"
                style={{ color: accent }}
              >
                <span className="text-lg">{domain.emoji}</span>
                <span className="font-semibold">{domain.label}</span>
              </div>

              <div className="flex flex-col gap-5">
                {qs.map((q, qi) => (
                  <div key={q.key}>
                    <p className="text-xs text-white/50 mb-2.5">
                      Q{qi + 1}. {q.question}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map(opt => {
                        const selected = prefs[q.key] === opt
                        return (
                          <button
                            key={opt}
                            onClick={() => setAnswer(domainId, q.key, opt)}
                            style={
                              selected
                                ? { borderColor: accent, color: accent, backgroundColor: `${accent}18` }
                                : {}
                            }
                            className={[
                              'px-3.5 py-1.5 rounded-full text-xs border transition-all duration-150',
                              selected
                                ? ''
                                : 'border-white/15 text-white/40 hover:border-white/30 hover:text-white/60',
                            ].join(' ')}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
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
          onClick={onNext}
          disabled={!isComplete}
          className={[
            'flex-[2] py-3.5 rounded-xl font-semibold text-sm transition-all duration-200',
            isComplete
              ? 'bg-[#c4b5fd] text-black hover:bg-[#d4c5ff] cursor-pointer'
              : 'bg-white/5 text-white/20 cursor-not-allowed opacity-40',
          ].join(' ')}
        >
          다음
        </button>
      </div>
    </div>
  )
}
