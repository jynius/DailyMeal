import { AppLogLevel, LoggerConfig } from './logger.service';

export const loggerConfig: LoggerConfig = {
  level: AppLogLevel.DEBUG,
  enableConsole: true,
  enableFile: false, // 개발 중에는 파일 로깅 비활성화
  logDir: './logs',
  packageLevels: {
    // 패키지별 로그 레벨 설정 (Java logback.xml 스타일)
    auth: AppLogLevel.DEBUG,
    'meal-records': AppLogLevel.DEBUG,
    AuthService: AppLogLevel.DEBUG,
    JwtStrategy: AppLogLevel.DEBUG,
    JwtAuthGuard: AppLogLevel.DEBUG,
    MealRecordsService: AppLogLevel.INFO,
    MealRecordsController: AppLogLevel.DEBUG,

    // 라이브러리 로그 (실제 운영에서는 WARN 이상으로)
    TypeOrmModule: AppLogLevel.WARN,
    DatabaseLogger: AppLogLevel.ERROR,
    PassportModule: AppLogLevel.WARN,
  },
};
