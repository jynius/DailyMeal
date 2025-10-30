import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ConfigService } from './config/config.service'
import * as fs from 'fs'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)

  // Secrets Manager에서 설정 로드
  const configService = app.get(ConfigService)
  const secretName = configService.get('SECRETS_MANAGER_SECRET_NAME')
  if (process.env.NODE_ENV === 'production' && secretName) {
    await configService.loadFromSecretsManager(secretName)
  }

  // CORS 설정 (Nginx 리버스 프록시 고려)
  app.enableCors({
    origin: [
      'http://localhost:3000', // 개발 환경 (WSL2 내부)
      'http://172.21.114.94:3000', // 개발 환경 (WSL2 IP - port forwarding 대상)
      'http://www.dailymeal.life', // 프로덕션 도메인
      'https://www.dailymeal.life', // HTTPS 프로덕션 도메인
    ],
    credentials: true,
  });

  // 글로벌 API 접두사 설정
  app.setGlobalPrefix('api')

  // 글로벌 검증 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('DailyMeal API')
    .setDescription('데일리밀 식단 기록 앱 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document)

  // 업로드 폴더 생성
  const uploadDir = configService.get('UPLOAD_DIR')
  if (!uploadDir) {
    throw new Error('UPLOAD_DIR must be defined in the environment.');
  }
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const port = configService.get('PORT');
  if (!port) {
    throw new Error('PORT must be defined in the environment.')
  }
  await app.listen(port)

  logger.log(`🚀 DailyMeal API Server running on http://localhost:${port}`)
  logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`)
}

void bootstrap()
