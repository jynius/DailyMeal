import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ConfigService } from './config/config.service'
import * as fs from 'fs'
import { json, urlencoded } from 'express'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)

  // ConfigService 가져오기
  const configService = app.get(ConfigService)

  // 필수 환경 변수 검증
  configService.validateRequiredConfig()

  // Body parser 크기 제한 설정 (이미지 업로드 지원)
  app.use(json({ limit: '50mb' }))
  app.use(urlencoded({ limit: '50mb', extended: true }))
  logger.log('📦 Body parser limit set to 50mb')

  // CORS 설정 (환경 변수 기반)
  const corsOrigins = configService.getCorsOrigins()
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  })

  logger.log(`🔒 CORS enabled for: ${corsOrigins.join(', ')}`)

  // 글로벌 API 접두사 설정
  app.setGlobalPrefix('api')

  // 글로벌 검증 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false, // 명시적 Transform 데코레이터만 사용
      },
      exceptionFactory: (errors) => {
        logger.error('❌ Validation failed:')
        errors.forEach((error) => {
          logger.error(`  - ${error.property}: ${JSON.stringify(error.constraints)}`)
          logger.error(`    Value: ${JSON.stringify(error.value)}`)
        })
        return new ValidationPipe().createExceptionFactory()(errors)
      },
    })
  )

  // Swagger 설정 (환경 변수로 제어)
  const enableSwagger = configService.get('ENABLE_SWAGGER') === 'true'
  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('DailyMeal API')
      .setDescription('데일리밀 식단 기록 앱 API 문서')
      .setVersion('1.0')
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api-docs', app, document)
    logger.log('📚 Swagger documentation enabled at /api-docs')
  }

  // 업로드 폴더 생성 (ConfigService에서 검증된 설정 사용)
  const uploadConfig = configService.getUploadConfig()
  if (!fs.existsSync(uploadConfig.dir)) {
    fs.mkdirSync(uploadConfig.dir, { recursive: true })
    logger.log(`📁 Created upload directory: ${uploadConfig.dir}`)
  }

  // 서버 시작
  const port = configService.get('PORT') || '8000'
  await app.listen(port)

  logger.log(`🚀 DailyMeal API Server running on http://localhost:${port}`)
  logger.log(`🌍 Environment: ${configService.get('NODE_ENV')}`)
  logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`)
}

void bootstrap()
