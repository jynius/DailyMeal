/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { Injectable } from '@nestjs/common'
import * as winston from 'winston'

export enum AppLogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'verbose',
}

export interface LoggerConfig {
  level: AppLogLevel
  enableConsole: boolean
  enableFile: boolean
  logDir: string
  packageLevels: Record<string, AppLogLevel>
}

@Injectable()
export class AppLoggerService {
  private logger: winston.Logger
  private config: LoggerConfig

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: AppLogLevel.INFO,
      enableConsole: true,
      enableFile: true,
      logDir: './logs',
      packageLevels: {
        auth: AppLogLevel.DEBUG,
        'meal-records': AppLogLevel.INFO,
        database: AppLogLevel.WARN,
        ...config.packageLevels,
      },
      ...config,
    }

    this.initializeLogger()
  }

  private initializeLogger() {
    const transports: winston.transport[] = []

    // 콘솔 출력
    if (this.config.enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, trace }) => {
              const contextStr = context ? `[${context}]` : ''
              const traceStr = trace ? `\n${trace}` : ''
              return `${timestamp} ${level.toUpperCase().padEnd(7)} ${contextStr} ${message}${traceStr}`
            })
          ),
        })
      )
    }

    // 파일 출력
    if (this.config.enableFile) {
      // 전체 로그
      transports.push(
        new winston.transports.File({
          filename: `${this.config.logDir}/app.log`,
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        })
      )

      // 에러 로그만
      transports.push(
        new winston.transports.File({
          filename: `${this.config.logDir}/error.log`,
          level: 'error',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        })
      )
    }

    this.logger = winston.createLogger({
      level: this.config.level,
      transports,
    })
  }

  /**
   * 패키지별 로그 레벨 확인
   */
  private shouldLog(level: AppLogLevel, context?: string): boolean {
    if (!context) return true

    const packageLevel = this.config.packageLevels[context] || this.config.level
    const levels = Object.values(AppLogLevel)
    const currentLevelIndex = levels.indexOf(packageLevel)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex <= currentLevelIndex
  }

  error(message: string, trace?: string, context?: string) {
    if (this.shouldLog(AppLogLevel.ERROR, context)) {
      this.logger.error(message, { context, trace })
    }
  }

  warn(message: string, context?: string) {
    if (this.shouldLog(AppLogLevel.WARN, context)) {
      this.logger.warn(message, { context })
    }
  }

  info(message: string, context?: string) {
    if (this.shouldLog(AppLogLevel.INFO, context)) {
      this.logger.info(message, { context })
    }
  }

  debug(message: string, context?: string) {
    if (this.shouldLog(AppLogLevel.DEBUG, context)) {
      this.logger.debug(message, { context })
    }
  }

  trace(message: string, context?: string) {
    if (this.shouldLog(AppLogLevel.TRACE, context)) {
      this.logger.verbose(message, { context })
    }
  }

  /**
   * 패키지별 로거 팩토리 (Java Logger.getLogger() 스타일)
   */
  static getLogger(context: string): PackageLogger {
    return new PackageLogger(context)
  }

  /**
   * 설정 업데이트
   */
  setLevel(packageName: string, level: AppLogLevel) {
    this.config.packageLevels[packageName] = level
  }

  getLevel(packageName: string): AppLogLevel {
    return this.config.packageLevels[packageName] || this.config.level
  }
}

/**
 * 패키지별 로거 (Java 스타일)
 */
export class PackageLogger {
  private static globalLogger: AppLoggerService

  constructor(private readonly context: string) {
    if (!PackageLogger.globalLogger) {
      PackageLogger.globalLogger = new AppLoggerService()
    }
  }

  static setGlobalLogger(logger: AppLoggerService) {
    PackageLogger.globalLogger = logger
  }

  error(message: string, error?: Error) {
    const trace = error?.stack
    PackageLogger.globalLogger.error(message, trace, this.context)
  }

  warn(message: string) {
    PackageLogger.globalLogger.warn(message, this.context)
  }

  info(message: string) {
    PackageLogger.globalLogger.info(message, this.context)
  }

  debug(message: string) {
    PackageLogger.globalLogger.debug(message, this.context)
  }

  trace(message: string) {
    PackageLogger.globalLogger.trace(message, this.context)
  }

  // Java 스타일 별칭
  log = this.info
}

/**
 * 데코레이터로 자동 로깅 (AOP 스타일)
 */
export function LogMethod(level: AppLogLevel = AppLogLevel.DEBUG) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const logger = AppLoggerService.getLogger(target.constructor.name)

    descriptor.value = function (...args: any[]) {
      // 순환 참조 안전한 stringify 함수
      const safeStringify = (obj: any): string => {
        const seen = new WeakSet()
        return JSON.stringify(obj, (key, val) => {
          if (val != null && typeof val === 'object') {
            if (seen.has(val)) return '[Circular]'
            seen.add(val)
          }
          // Request 객체나 복잡한 객체들은 간단히 표현
          if (val && typeof val === 'object' && val.constructor) {
            if (val.constructor.name === 'IncomingMessage') return '[Request]'
            if (val.constructor.name === 'Socket') return '[Socket]'
            if (val.constructor.name === 'Buffer') return `[Buffer ${val.length}]`
          }
          return val
        })
      }

      logger.debug(`🔄 ${propertyName}() called with args: ${safeStringify(args)}`)

      try {
        const result = method.apply(this, args)

        // Promise 처리
        if (result instanceof Promise) {
          return result
            .then((res) => {
              logger.debug(`✅ ${propertyName}() completed successfully`)
              return res
            })
            .catch((error) => {
              logger.error(`❌ ${propertyName}() failed`, error)
              throw error
            })
        }

        logger.debug(`✅ ${propertyName}() completed successfully`)
        return result
      } catch (error) {
        logger.error(`❌ ${propertyName}() failed`, error as Error)
        throw error
      }
    }
  }
}
