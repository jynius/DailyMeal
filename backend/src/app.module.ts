import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dataSourceOptions } from '../data-source'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { MealRecordsModule } from './meal-records/meal-records.module'
import { FriendsModule } from './friends/friends.module'
import { ShareModule } from './share/share.module'
import { RealTimeModule } from './realtime/realtime.module'
import { RestaurantsModule } from './restaurants/restaurants.module'
import { EmailModule } from './email/email.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { CryptoModule } from './common/crypto.module'
import { AiModule } from './ai/ai.module'
import { LocationsModule } from './locations/locations.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uploadDir = configService.get<string>('UPLOAD_DIR') || '../uploads'
        return [
          {
            rootPath: join(__dirname, '..', '..', uploadDir),
            serveRoot: '/uploads',
          },
        ]
      },
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UsersModule,
    ShareModule,
    RealTimeModule,
    EmailModule,
    MealRecordsModule,
    FriendsModule,
    RestaurantsModule,
    CryptoModule,
    AiModule,
    LocationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
