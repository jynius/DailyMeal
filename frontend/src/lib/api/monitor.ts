/**
 * API Performance Monitor (Console-based)
 * 
 * 콘솔 기반 API 성능 모니터링
 * - 🔵 요청 시작 로그
 * - ✅ 성공 로그 (응답 시간 포함)
 * - ⚠️ 느린 API 경고 (>1초)
 * - ❌ 에러 로그
 * - 📊 통계 출력 (콘솔에서 apiStats() 호출)
 * - 🔔 반복 호출 감지
 */

import { logger } from '../logger'

// 콘솔 스타일
const styles = {
  request: 'color: #3b82f6; font-weight: bold',
  success: 'color: #10b981; font-weight: bold',
  slow: 'color: #f59e0b; font-weight: bold',
  error: 'color: #ef4444; font-weight: bold',
  stats: 'color: #8b5cf6; font-weight: bold',
  repeat: 'color: #ec4899; font-weight: bold'
}

export interface ApiMetric {
  endpoint: string
  method: string
  status: number
  duration: number
  timestamp: number
  error?: string
  success: boolean
}

export interface ApiStats {
  endpoint: string
  totalCalls: number
  successCount: number
  errorCount: number
  avgDuration: number
  minDuration: number
  maxDuration: number
  p95Duration: number
  lastCalled: number
}

class ApiPerformanceMonitor {
  private metrics: ApiMetric[] = []
  private readonly MAX_METRICS = 1000
  private readonly SLOW_API_THRESHOLD = 1000 // 1초
  private readonly WARNING_ERROR_RATE = 0.1 // 10%
  private readonly REPEAT_WARNING_THRESHOLD = 10 // 10초 내 10회 호출
  private readonly REPEAT_TIME_WINDOW = 10000 // 10초
  constructor() {
    // 개발 환경에서 콘솔에서 통계 확인 가능하도록 함수 노출
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      (window as any).apiStats = () => this.printStats()
      console.log('%c💡 Tip: 콘솔에서 apiStats()를 호출하면 API 성능 통계를 확인할 수 있습니다.', 'color: #6366f1; font-style: italic')
    }
  }

  /**
   * API 요청 시작
   */
  startRequest(endpoint: string, method: string) {
    const startTime = performance.now()
    const timestamp = Date.now()

    // 🔵 요청 시작 로그
    console.log(`%c🔵 API ${method} ${endpoint}`, styles.request)

    // 반복 호출 감지
    this.checkRepeatedCalls(endpoint, method)

    // 요청 완료 콜백 반환
    return (status: number, error?: string) => {
      const duration = performance.now() - startTime
      const success = status >= 200 && status < 400

      const metric: ApiMetric = {
        endpoint,
        method,
        status,
        duration,
        timestamp,
        error,
        success,
      }

      this.recordMetric(metric)
      this.logMetricToConsole(metric)
      this.checkThresholds(metric)
    }
  }

  /**
   * 메트릭 기록
   */
  private recordMetric(metric: ApiMetric): void {
    this.metrics.push(metric)

    // 최대 개수 초과시 오래된 메트릭 제거
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift()
    }
  }

  /**
   * 메트릭 콘솔 로깅 (개선)
   */
  private logMetricToConsole(metric: ApiMetric): void {
    const durationStr = `${metric.duration.toFixed(0)}ms`
    const statusEmoji = metric.success ? '✅' : '❌'

    if (!metric.success) {
      // 에러
      console.log(
        `%c${statusEmoji} API ${metric.method} ${metric.endpoint} - ${metric.status} [${durationStr}]`,
        styles.error
      )
      if (metric.error) {
        console.error('   Error:', metric.error)
      }
    } else if (metric.duration > this.SLOW_API_THRESHOLD) {
      // 느린 API
      console.log(
        `%c⚠️ SLOW API ${metric.method} ${metric.endpoint} - ${metric.status} [${durationStr}]`,
        styles.slow
      )
    } else {
      // 정상
      console.log(
        `%c${statusEmoji} API ${metric.method} ${metric.endpoint} - ${metric.status} [${durationStr}]`,
        styles.success
      )
    }
  }

  /**
   * 반복 호출 감지
   */
  private checkRepeatedCalls(endpoint: string, method: string): void {
    const now = Date.now()
    const recentCalls = this.metrics.filter(
      m => 
        m.endpoint === endpoint && 
        m.method === method && 
        now - m.timestamp < this.REPEAT_TIME_WINDOW
    )

    if (recentCalls.length >= this.REPEAT_WARNING_THRESHOLD) {
      console.log(
        `%c🔔 반복 호출 감지: ${method} ${endpoint} (${recentCalls.length}회 / 10초)`,
        styles.repeat
      )
    }
  }

  /**
   * 통계 출력
   */
  private printStats(): void {
    if (this.metrics.length === 0) return

    const summary = this.getSummary()
    const slowApis = this.getSlowApis()
    const errorApis = this.getErrorApis()

    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.stats)
    console.log('%c📊 API 성능 통계 (최근 30초)', styles.stats)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.stats)
    console.log(`   총 요청: ${summary.totalRequests}회`)
    console.log(`   성공률: ${summary.successRate.toFixed(1)}%`)
    console.log(`   평균 응답시간: ${summary.avgDuration.toFixed(0)}ms`)
    console.log(`   느린 API: ${summary.slowApiCount}회`)
    console.log(`   에러: ${summary.errorCount}회`)

    if (slowApis.length > 0) {
      console.log('\n%c⚠️ 느린 API (>1초):', styles.slow)
      slowApis.slice(0, 5).forEach(m => {
        console.log(`   ${m.method} ${m.endpoint} - ${m.duration.toFixed(0)}ms`)
      })
    }

    if (errorApis.length > 0) {
      console.log('\n%c❌ 에러 API:', styles.error)
      errorApis.slice(0, 5).forEach(m => {
        console.log(`   ${m.method} ${m.endpoint} - ${m.status} (${m.error || 'Unknown'})`)
      })
    }

    // 엔드포인트별 상위 5개
    const topEndpoints = this.getAllStats()
      .sort((a, b) => b.totalCalls - a.totalCalls)
      .slice(0, 5)

    if (topEndpoints.length > 0) {
      console.log('\n📈 최다 호출 API:')
      topEndpoints.forEach(stat => {
        console.log(`   ${stat.endpoint}: ${stat.totalCalls}회 (평균 ${stat.avgDuration.toFixed(0)}ms)`)
      })
    }

    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', styles.stats)
  }

  /**
   * 메트릭 로깅 (기존 logger와의 통합)
   */
  private logMetric(metric: ApiMetric): void {
    const log = logger

    if (!metric.success) {
      log.error('API request failed', metric.error, 'ApiMonitor')
      log.warn(`${metric.method} ${metric.endpoint} - ${metric.status} (${metric.duration.toFixed(2)}ms)`, 'ApiMonitor')
    } else if (metric.duration > this.SLOW_API_THRESHOLD) {
      log.warn(`Slow API detected: ${metric.method} ${metric.endpoint} - ${metric.duration.toFixed(2)}ms`, 'ApiMonitor')
    } else {
      log.debug(`${metric.method} ${metric.endpoint} - ${metric.status} (${metric.duration.toFixed(2)}ms)`, 'ApiMonitor')
    }
  }

  /**
   * 임계값 확인
   */
  private checkThresholds(metric: ApiMetric): void {
    const stats = this.getEndpointStats(metric.endpoint)

    // 에러율 체크
    const errorRate = stats.errorCount / stats.totalCalls
    if (errorRate >= this.WARNING_ERROR_RATE && stats.totalCalls >= 10) {
      logger.error(
        `High error rate detected: ${metric.endpoint} (${(errorRate * 100).toFixed(1)}%)`,
        null,
        'ApiMonitor'
      )
    }

    // 평균 응답 시간 체크
    if (stats.avgDuration > this.SLOW_API_THRESHOLD && stats.totalCalls >= 5) {
      logger.warn(
        `Consistently slow API: ${metric.endpoint} (avg: ${stats.avgDuration.toFixed(2)}ms)`,
        'ApiMonitor'
      )
    }
  }

  /**
   * 엔드포인트별 통계
   */
  getEndpointStats(endpoint: string): ApiStats {
    const endpointMetrics = this.metrics.filter(m => m.endpoint === endpoint)

    if (endpointMetrics.length === 0) {
      return {
        endpoint,
        totalCalls: 0,
        successCount: 0,
        errorCount: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p95Duration: 0,
        lastCalled: 0,
      }
    }

    const durations = endpointMetrics.map(m => m.duration).sort((a, b) => a - b)
    const successCount = endpointMetrics.filter(m => m.success).length
    const errorCount = endpointMetrics.length - successCount

    return {
      endpoint,
      totalCalls: endpointMetrics.length,
      successCount,
      errorCount,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      lastCalled: Math.max(...endpointMetrics.map(m => m.timestamp)),
    }
  }

  /**
   * 전체 통계
   */
  getAllStats(): ApiStats[] {
    const endpoints = Array.from(new Set(this.metrics.map(m => m.endpoint)))
    return endpoints.map(endpoint => this.getEndpointStats(endpoint))
  }

  /**
   * 최근 메트릭 조회
   */
  getRecentMetrics(count: number = 50): ApiMetric[] {
    return this.metrics.slice(-count)
  }

  /**
   * 느린 API 조회
   */
  getSlowApis(threshold: number = this.SLOW_API_THRESHOLD): ApiMetric[] {
    return this.metrics.filter(m => m.duration > threshold)
  }

  /**
   * 에러 API 조회
   */
  getErrorApis(): ApiMetric[] {
    return this.metrics.filter(m => !m.success)
  }

  /**
   * 메트릭 초기화
   */
  clear(): void {
    this.metrics = []
    logger.info('API metrics cleared', 'ApiMonitor')
  }

  /**
   * 통계 요약
   */
  getSummary(): {
    totalRequests: number
    successRate: number
    avgDuration: number
    slowApiCount: number
    errorCount: number
  } {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        avgDuration: 0,
        slowApiCount: 0,
        errorCount: 0,
      }
    }

    const successCount = this.metrics.filter(m => m.success).length
    const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length
    const slowApiCount = this.metrics.filter(m => m.duration > this.SLOW_API_THRESHOLD).length
    const errorCount = this.metrics.length - successCount

    return {
      totalRequests: this.metrics.length,
      successRate: (successCount / this.metrics.length) * 100,
      avgDuration,
      slowApiCount,
      errorCount,
    }
  }
}

/**
 * 싱글톤 인스턴스
 */
export const apiMonitor = new ApiPerformanceMonitor()

/**
 * 브라우저 전역에 노출 (디버깅용)
 */
if (typeof window !== 'undefined') {
  (window as any).__apiMonitor = apiMonitor
}
