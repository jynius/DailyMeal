import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MealRecordsModule } from './meal-records/meal-records.module';
import { User } from './entities/user.entity';
import { MealRecord } from './entities/meal-record.entity';
import { AppLoggerService, PackageLogger } from './common/logger.service';
import { loggerConfig } from './common/logger.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // DB 설정: 기본은 SQLite, 환경변수(DB_TYPE=postgres)로 Postgres 사용
    TypeOrmModule.forRoot(
      (() => {
        const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
        const common = {
          entities: [User, MealRecord],
          synchronize: process.env.NODE_ENV !== 'production',
          logging: process.env.NODE_ENV === 'development',
        };

        if (dbType === 'postgres' || dbType === 'postgresql') {
          return {
            type: 'postgres' as const,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'dailymeal',
            ...common,
          };
        }

        // 기본: sqlite (파일 경로: backend/data/dev.sqlite)
        return {
          type: 'sqlite' as const,
          database: join(__dirname, '..', 'data', 'dev.sqlite'),
          ...common,
        };
      })(),
    ),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    MealRecordsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: AppLoggerService,
      useFactory: () => {
        const logger = new AppLoggerService(loggerConfig);
        PackageLogger.setGlobalLogger(logger);
        return logger;
      }
    }
  ],
})
export class AppModule {}
