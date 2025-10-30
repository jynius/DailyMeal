import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ShareService } from './share.service'
import { ShareController } from './share.controller'
import { MealShare } from '../entities/meal-share.entity'
import { MealRecord } from '../entities/meal-record.entity'
import { User } from '../entities/user.entity'
import { ShareTracking } from '../entities/share-tracking.entity'
import { Friendship } from '../entities/friendship.entity'
import { CryptoModule } from '../common/crypto.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MealShare,
      ShareTracking,
      MealRecord,
      User,
      Friendship,
    ]),
    CryptoModule,
  ],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
