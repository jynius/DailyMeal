import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // process.env를 전역적으로 사용 가능하게 함
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
