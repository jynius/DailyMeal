import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { User } from '../entities/user.entity'
import { MealRecord } from '../entities/meal-record.entity'
import { Friendship } from '../entities/friendship.entity'
import { UserSettings } from '../entities/user-settings.entity'
import { EmailModule } from '../email/email.module'
import { ConfigModule } from '../config/config.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, MealRecord, Friendship, UserSettings]),
    EmailModule,
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
