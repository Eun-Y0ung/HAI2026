'use client'

import { useState } from 'react'
import StepIndicator from '@/components/StepIndicator'
import Step1Domains from '@/components/Step1Domains'
import Step2Preferences from '@/components/Step2Preferences'
import Step3Summary from '@/components/Step3Summary'
import type { DomainId, Preferences } from '@/lib/onboarding'

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedDomains, setSelectedDomains] = useState<DomainId[]>([])
  const [preferences, setPreferences] = useState<Preferences>({})

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tight">Taste Curator</h1>
          <p className="text-sm text-white/35 mt-1">당신의 취향으로 시작하는 큐레이션</p>
        </div>

        {/* Step progress */}
        <StepIndicator currentStep={step} />

        {/* Step content — key prop triggers re-mount → CSS animation fires */}
        <div key={step} className="animate-fadeSlideIn mt-10">
          {step === 1 && (
            <Step1Domains
              selectedDomains={selectedDomains}
              setSelectedDomains={setSelectedDomains}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2Preferences
              selectedDomains={selectedDomains}
              preferences={preferences}
              setPreferences={setPreferences}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3Summary
              selectedDomains={selectedDomains}
              preferences={preferences}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </main>
  )
}
