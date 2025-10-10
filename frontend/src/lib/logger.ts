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
  productionLevel: LogLevel
}

class Logger {
  private config: LoggerConfig
  private isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    
    this.config = {
      level: this.isProduction ? LogLevel.WARN : LogLevel.DEBUG,
      enableConsole: true,
      enableTimestamp: !this.isProduction,
      enableContext: true,
      productionLevel: LogLevel.WARN,
    }
  }

  /**
   * 로그 레벨 확인
   */
  private shouldLog(level: LogLevel): boolean {
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
    if (!this.shouldLog(LogLevel.ERROR)) return

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
    if (!this.shouldLog(LogLevel.WARN)) return

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
    if (!this.shouldLog(LogLevel.INFO)) return

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
    if (!this.shouldLog(LogLevel.DEBUG)) return

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
    if (!this.shouldLog(LogLevel.TRACE)) return

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
   * 로그 레벨 동적 변경 (디버깅용)
   */
  setLevel(level: LogLevel): void {
    this.config.level = level
    this.info(`로그 레벨 변경: ${LogLevel[level]}`, 'Logger')
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
