interface Props {
  currentStep: 1 | 2 | 3
}

const STEPS = [
  { n: 1 as const, label: '도메인' },
  { n: 2 as const, label: '취향' },
  { n: 3 as const, label: '확인' },
]

export default function StepIndicator({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-center">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                currentStep > s.n
                  ? 'bg-[#a8edce] text-black'
                  : currentStep === s.n
                  ? 'bg-[#c4b5fd] text-black'
                  : 'bg-white/10 text-white/30',
              ].join(' ')}
            >
              {currentStep > s.n ? '✓' : s.n}
            </div>
            <span
              className={[
                'text-xs mt-1 transition-colors duration-300',
                currentStep === s.n
                  ? 'text-[#c4b5fd]'
                  : currentStep > s.n
                  ? 'text-[#a8edce]'
                  : 'text-white/25',
              ].join(' ')}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={[
                'w-16 h-px mx-3 mb-5 transition-colors duration-500',
                currentStep > s.n ? 'bg-[#a8edce]/50' : 'bg-white/10',
              ].join(' ')}
            />
          )}
        </div>
      ))}
    </div>
  )
}
