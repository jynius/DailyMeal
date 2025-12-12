import { Module, Global } from '@nestjs/common'
import { ConfigService } from './config.service'
import { ConfigModule as NestConfigModule } from '@nestjs/config'

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // process.env를 전역적으로 사용 가능하게 함
      envFilePath: '.env', // 단일 .env 파일 사용 (환경별로 내용만 다르게 관리)
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
