import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../data-source';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MealRecordsModule } from './meal-records/meal-records.module';
import { FriendsModule } from './friends/friends.module';
import { ShareModule } from './share/share.module';
import { RealTimeModule } from './realtime/realtime.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UsersModule,
    ShareModule,
    RealTimeModule,
    EmailModule,
    MealRecordsModule,
    FriendsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
