/**
 * Frontend Logger Utility
 * 
 * 백엔드와 유사한 로깅 시스템을 프론트엔드에 제공합니다.
 * 환경별 로그 레벨 제어, 타입 안전성, 일관된 포맷을 제공합니다.
 * 
 * @example
 * ```ts
 * import { logger } from '@/lib/logger'
 * 
 * logger.info('사용자 로그인 성공', 'AuthService')
 * logger.error('API 호출 실패', error, 'MealService')
 * logger.debug('상태 변경:', state, 'Component')
 * ```
 */

import { APP_CONFIG } from './constants'

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableTimestamp: boolean
  enableContext: boolean
  // 모듈별 로그 레벨 설정 (예: { 'AuthService': LogLevel.DEBUG, 'API': LogLevel.TRACE })
  moduleLogLevels: Record<string, LogLevel>
}

class Logger {
  private config: LoggerConfig

  constructor() {
    // APP_CONFIG의 LOG_LEVEL을 LogLevel enum으로 변환
    const logLevelStr = APP_CONFIG.LOG_LEVEL as keyof typeof LogLevel
    const globalLevel = LogLevel[logLevelStr] ?? LogLevel.WARN
    
    this.config = {
      level: globalLevel,
      enableConsole: true,
      enableTimestamp: globalLevel >= LogLevel.DEBUG, // DEBUG 이상이면 타임스탬프 표시
      enableContext: true,
      moduleLogLevels: {}, // 초기에는 빈 객체
    }
    
    // APP_CONFIG에서 모듈별 로그 레벨 설정 로드
    this.loadModuleLevelsFromConfig()
  }

  /**
   * APP_CONFIG에서 모듈별 로그 레벨 로드
   */
  private loadModuleLevelsFromConfig(): void {
    const moduleLevels = APP_CONFIG.MODULE_LOG_LEVELS
    for (const [module, levelStr] of Object.entries(moduleLevels)) {
      const level = LogLevel[levelStr as keyof typeof LogLevel]
      if (level !== undefined) {
        this.config.moduleLogLevels[module] = level
      }
    }
  }

  /**
   * 특정 모듈의 에러 상세 정보 표시 여부 확인
   * (DEBUG 레벨 이상이면 표시)
   * 
   * @example
   * logger.shouldShowErrorDetails('GlobalError')
   * // = shouldLog(LogLevel.DEBUG, 'GlobalError')
   */
  shouldShowErrorDetails(moduleName: string): boolean {
    return this.shouldLog(LogLevel.DEBUG, moduleName)
  }

  /**
   * API Monitor 활성화 여부 확인
   * (DEBUG 레벨 이상이면 활성화)
   * 
   * @example
   * logger.shouldEnableMonitor('APIMonitor')
   */
  shouldEnableMonitor(moduleName: string = 'APIMonitor'): boolean {
    return this.shouldLog(LogLevel.DEBUG, moduleName)
  }

  /**
   * 모듈별 로그 레벨 설정
   * @example
   * logger.setModuleLevel('AuthService', LogLevel.TRACE)
   * logger.setModuleLevel('API', LogLevel.DEBUG)
   */
  setModuleLevel(moduleName: string, level: LogLevel): void {
    this.config.moduleLogLevels[moduleName] = level
  }

  /**
   * 여러 모듈의 로그 레벨을 한번에 설정
   * @example
   * logger.setModuleLevels({
   *   'AuthService': LogLevel.TRACE,
   *   'API': LogLevel.DEBUG,
   *   'Socket': LogLevel.INFO
   * })
   */
  setModuleLevels(levels: Record<string, LogLevel>): void {
    this.config.moduleLogLevels = { ...this.config.moduleLogLevels, ...levels }
  }

  /**
   * 모듈별 로그 레벨 가져오기
   */
  getModuleLevel(moduleName: string): LogLevel | undefined {
    return this.config.moduleLogLevels[moduleName]
  }

  /**
   * 전역 로그 레벨 설정
   */
  setLevel(level: LogLevel): void {
    this.config.level = level
    this.info(`로그 레벨 변경: ${LogLevel[level]}`, 'Logger')
  }

  /**
   * 로그 레벨 확인 (모듈별 설정 우선)
   */
  private shouldLog(level: LogLevel, context?: string): boolean {
    // 모듈별 설정이 있으면 우선 적용
    if (context && this.config.moduleLogLevels[context] !== undefined) {
      return level <= this.config.moduleLogLevels[context]
    }
    // 전역 설정 적용
    return level <= this.config.level
  }

  /**
   * 로그 포맷팅
   */
  private format(level: string, message: string, context?: string, data?: any): string {
    const parts: string[] = []

    if (this.config.enableTimestamp) {
      const now = new Date()
      const time = now.toTimeString().split(' ')[0]
      parts.push(`[${time}]`)
    }

    parts.push(`[${level.toUpperCase()}]`)

    if (this.config.enableContext && context) {
      parts.push(`[${context}]`)
    }

    parts.push(message)

    return parts.join(' ')
  }

  /**
   * 데이터 직렬화 (순환 참조 방지)
   */
  private serialize(data: any): any {
    if (data === null || data === undefined) return data
    
    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: data.stack,
      }
    }

    if (typeof data === 'object') {
      try {
        // 순환 참조 방지
        const seen = new WeakSet()
        return JSON.parse(JSON.stringify(data, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]'
            }
            seen.add(value)
          }
          return value
        }))
      } catch {
        return String(data)
      }
    }

    return data
  }

  /**
   * 에러 로그 (항상 출력)
   */
  error(message: string, error?: any, context?: string): void {
    if (!this.shouldLog(LogLevel.ERROR, context)) return

    const formatted = this.format('ERROR', message, context)
    
    if (this.config.enableConsole) {
      if (error) {
        console.error(formatted, this.serialize(error))
      } else {
        console.error(formatted)
      }
    }
  }

  /**
   * 경고 로그
   */
  warn(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN, context)) return

    const formatted = this.format('WARN', message, context)
    
    if (this.config.enableConsole) {
      if (data !== undefined) {
        console.warn(formatted, this.serialize(data))
      } else {
        console.warn(formatted)
      }
    }
  }

  /**
   * 정보 로그
   */
  info(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO, context)) return

    const formatted = this.format('INFO', message, context)
    
    if (this.config.enableConsole) {
      if (data !== undefined) {
        console.log(formatted, this.serialize(data))
      } else {
        console.log(formatted)
      }
    }
  }

  /**
   * 디버그 로그 (개발 환경에서만)
   */
  debug(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG, context)) return

    const formatted = this.format('DEBUG', message, context)
    
    if (this.config.enableConsole) {
      if (data !== undefined) {
        console.log(formatted, this.serialize(data))
      } else {
        console.log(formatted)
      }
    }
  }

  /**
   * 상세 추적 로그 (개발 환경에서만)
   */
  trace(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.TRACE, context)) return

    const formatted = this.format('TRACE', message, context)
    
    if (this.config.enableConsole) {
      if (data !== undefined) {
        console.log(formatted, this.serialize(data))
      } else {
        console.log(formatted)
      }
    }
  }

  /**
   * 콘솔 출력 토글
   */
  setConsoleEnabled(enabled: boolean): void {
    this.config.enableConsole = enabled
  }
}

/**
 * 싱글톤 Logger 인스턴스
 */
export const logger = new Logger()

/**
 * 컴포넌트별 Logger 팩토리
 * 
 * @example
 * ```ts
 * const log = createLogger('MealCard')
 * log.info('식사 카드 렌더링')
 * log.error('이미지 로딩 실패', error)
 * ```
 */
export function createLogger(context: string) {
  return {
    error: (message: string, error?: any) => logger.error(message, error, context),
    warn: (message: string, data?: any) => logger.warn(message, context, data),
    info: (message: string, data?: any) => logger.info(message, context, data),
    debug: (message: string, data?: any) => logger.debug(message, context, data),
    trace: (message: string, data?: any) => logger.trace(message, context, data),
  }
}

/**
 * 브라우저 전역에 logger 노출 (디버깅용)
 */
if (typeof window !== 'undefined') {
  (window as any).__logger = logger
}
