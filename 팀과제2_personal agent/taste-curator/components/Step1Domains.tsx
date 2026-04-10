'use client'

import { DOMAINS, type DomainId } from '@/lib/onboarding'

interface Props {
  selectedDomains: DomainId[]
  setSelectedDomains: (d: DomainId[]) => void
  onNext: () => void
}

export default function Step1Domains({ selectedDomains, setSelectedDomains, onNext }: Props) {
  const toggle = (id: DomainId) => {
    setSelectedDomains(
      selectedDomains.includes(id)
        ? selectedDomains.filter(d => d !== id)
        : [...selectedDomains, id]
    )
  }

  const canNext = selectedDomains.length > 0

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">어떤 분야의 콘텐츠를 즐기세요?</h2>
      <p className="text-sm text-white/40 mb-6">복수 선택 가능해요</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {DOMAINS.map(d => {
          const selected = selectedDomains.includes(d.id)
          return (
            <button
              key={d.id}
              onClick={() => toggle(d.id)}
              className={[
                'flex flex-col items-center justify-center gap-2 py-7 rounded-2xl border text-sm font-medium transition-all duration-200',
                selected
                  ? 'border-[#c4b5fd] bg-[#c4b5fd]/10 text-[#c4b5fd]'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70',
              ].join(' ')}
            >
              <span className="text-3xl">{d.emoji}</span>
              <span>{d.label}</span>
            </button>
          )
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!canNext}
        className={[
          'w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200',
          canNext
            ? 'bg-[#c4b5fd] text-black hover:bg-[#d4c5ff] cursor-pointer'
            : 'bg-white/5 text-white/20 cursor-not-allowed opacity-40',
        ].join(' ')}
      >
        다음
      </button>
    </div>
  )
}
