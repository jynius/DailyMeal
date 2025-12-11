'use client'

import { useState } from 'react'
import { Brain, TrendingUp, DollarSign } from 'lucide-react'
import { AnalysisPeriod, SpendingPeriod } from '@/lib/api'
import { usePatternAnalysis, useSpendingAnalysis } from '@/hooks/use-ai'
import Spinner from '@/components/ui/spinner'
import PatternAnalysisCard from '@/components/ai/PatternAnalysisCard'
import SpendingAnalysisCard from '@/components/ai/SpendingAnalysisCard'

export default function AIInsightsPage() {
  const [patternPeriod, setPatternPeriod] = useState<AnalysisPeriod>(AnalysisPeriod.MONTH)
  const [spendingPeriod, setSpendingPeriod] = useState<SpendingPeriod>(SpendingPeriod.MONTH)

  const { data: patternData, isLoading: patternLoading } = usePatternAnalysis(patternPeriod)
  const { data: spendingData, isLoading: spendingLoading } = useSpendingAnalysis(spendingPeriod)

  const isLoading = patternLoading || spendingLoading

  if (isLoading) {
    return <Spinner container="page" text="AI 분석 중..." />
  }

  return (
    <div className="pb-20">
      <div className="p-4 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <Brain size={32} className="text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI 인사이트</h1>
            <p className="text-sm text-gray-600">당신의 식사 패턴을 분석합니다</p>
          </div>
        </div>

        {/* 식사 패턴 분석 */}
        <section className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              <h2 className="font-semibold text-gray-900">식사 패턴 분석</h2>
            </div>
            <select
              title="분석 기간 선택"
              value={patternPeriod}
              onChange={(e) => setPatternPeriod(e.target.value as AnalysisPeriod)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value={AnalysisPeriod.WEEK}>1주일</option>
              <option value={AnalysisPeriod.MONTH}>1개월</option>
              <option value={AnalysisPeriod.QUARTER}>3개월</option>
            </select>
          </div>
          {patternData && <PatternAnalysisCard data={patternData} />}
        </section>

        {/* 지출 분석 */}
        <section className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-green-500" />
              <h2 className="font-semibold text-gray-900">지출 분석</h2>
            </div>
            <select
              title="지출 기간 선택"
              value={spendingPeriod}
              onChange={(e) => setSpendingPeriod(e.target.value as SpendingPeriod)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value={SpendingPeriod.MONTH}>1개월</option>
              <option value={SpendingPeriod.QUARTER}>3개월</option>
              <option value={SpendingPeriod.YEAR}>1년</option>
            </select>
          </div>
          {spendingData && <SpendingAnalysisCard data={spendingData} />}
        </section>
      </div>
    </div>
  )
}
