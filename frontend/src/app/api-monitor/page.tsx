'use client'

import { useEffect, useState } from 'react'
import { apiMonitor, type ApiStats } from '@/lib/api/monitor'
import { createLogger } from '@/lib/logger'
import { ArrowLeft, Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const log = createLogger('ApiMonitorPage')

export default function ApiMonitorPage() {
  const [stats, setStats] = useState<ApiStats[]>([])
  const [summary, setSummary] = useState({
    totalRequests: 0,
    successRate: 0,
    avgDuration: 0,
    slowApiCount: 0,
    errorCount: 0,
  })
  const [sortBy, setSortBy] = useState<'calls' | 'duration' | 'errors'>('calls')

  useEffect(() => {
    refreshStats()
    
    // 10초마다 자동 새로고침
    const interval = setInterval(refreshStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const refreshStats = () => {
    const allStats = apiMonitor.getAllStats()
    const summaryData = apiMonitor.getSummary()
    
    log.debug('Stats refreshed', { statsCount: allStats.length })
    
    setStats(allStats)
    setSummary(summaryData)
  }

  const sortedStats = [...stats].sort((a, b) => {
    switch (sortBy) {
      case 'calls':
        return b.totalCalls - a.totalCalls
      case 'duration':
        return b.avgDuration - a.avgDuration
      case 'errors':
        return b.errorCount - a.errorCount
      default:
        return 0
    }
  })

  const handleClear = () => {
    if (confirm('모든 모니터링 데이터를 초기화하시겠습니까?')) {
      apiMonitor.clear()
      refreshStats()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">API 성능 모니터링</h1>
              <p className="text-sm text-gray-600">실시간 API 성능 분석</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
          >
            데이터 초기화
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">총 요청</span>
            </div>
            <p className="text-2xl font-bold">{summary.totalRequests}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">성공률</span>
            </div>
            <p className="text-2xl font-bold">{summary.successRate.toFixed(1)}%</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600">평균 응답</span>
            </div>
            <p className="text-2xl font-bold">{summary.avgDuration.toFixed(0)}ms</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-600">느린 API</span>
            </div>
            <p className="text-2xl font-bold">{summary.slowApiCount}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">에러</span>
            </div>
            <p className="text-2xl font-bold">{summary.errorCount}</p>
          </div>
        </div>

        {/* 정렬 버튼 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSortBy('calls')}
            className={`px-4 py-2 rounded-lg text-sm ${
              sortBy === 'calls' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            호출 횟수
          </button>
          <button
            onClick={() => setSortBy('duration')}
            className={`px-4 py-2 rounded-lg text-sm ${
              sortBy === 'duration' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            평균 응답시간
          </button>
          <button
            onClick={() => setSortBy('errors')}
            className={`px-4 py-2 rounded-lg text-sm ${
              sortBy === 'errors' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            에러 횟수
          </button>
        </div>

        {/* API 통계 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">엔드포인트</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">호출</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">성공</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">에러</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">평균</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">최소</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">최대</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">P95</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedStats.map((stat, index) => {
                const errorRate = (stat.errorCount / stat.totalCalls) * 100
                const isSlowApi = stat.avgDuration > 1000
                const hasErrors = errorRate > 10

                return (
                  <tr key={index} className={hasErrors ? 'bg-red-50' : isSlowApi ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{stat.endpoint}</td>
                    <td className="px-4 py-3 text-sm text-center">{stat.totalCalls}</td>
                    <td className="px-4 py-3 text-sm text-center text-green-600">{stat.successCount}</td>
                    <td className="px-4 py-3 text-sm text-center text-red-600">{stat.errorCount}</td>
                    <td className="px-4 py-3 text-sm text-center font-medium">{stat.avgDuration.toFixed(0)}ms</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-500">{stat.minDuration.toFixed(0)}ms</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-500">{stat.maxDuration.toFixed(0)}ms</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-500">{stat.p95Duration.toFixed(0)}ms</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {stats.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>아직 수집된 데이터가 없습니다.</p>
              <p className="text-sm mt-2">API 요청을 하면 통계가 표시됩니다.</p>
            </div>
          )}
        </div>

        {/* 하단 안내 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2">💡 디버깅 팁</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• 브라우저 콘솔에서 <code className="bg-white px-2 py-1 rounded">window.__apiMonitor</code> 사용 가능</li>
            <li>• 노란색 배경: 평균 응답시간 &gt; 1초</li>
            <li>• 빨간색 배경: 에러율 &gt; 10%</li>
            <li>• 10초마다 자동 새로고침</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
