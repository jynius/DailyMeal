import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MealRecordsModule } from './meal-records/meal-records.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { FriendsModule } from './friends/friends.module';
import { UsersModule } from './users/users.module';
import { ShareModule } from './share/share.module';
import { User } from './entities/user.entity';
import { MealRecord } from './entities/meal-record.entity';
import { Friendship } from './entities/friendship.entity';
import { UserSettings } from './entities/user-settings.entity';
import { MealShare } from './entities/meal-share.entity';
import { ShareTracking } from './entities/share-tracking.entity';
import { AppLoggerService, PackageLogger } from './common/logger.service';
import { loggerConfig } from './common/logger.config';
import { RealTimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // PostgreSQL 데이터베이스 설정
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'dailymeal',
      entities: [User, MealRecord, Friendship, UserSettings, MealShare, ShareTracking],
      synchronize: false, // 프로덕션에서는 절대 true로 설정하지 말것
      logging: process.env.NODE_ENV === 'development',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    MealRecordsModule,
    RestaurantsModule,
    FriendsModule,
    UsersModule,
    ShareModule,
    RealTimeModule,
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
