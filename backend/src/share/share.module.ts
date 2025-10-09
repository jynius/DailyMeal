import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { MealShare } from '../entities/meal-share.entity';
import { ShareTracking } from '../entities/share-tracking.entity';
import { MealRecord } from '../entities/meal-record.entity';
import { User } from '../entities/user.entity';
import { Friendship } from '../entities/friendship.entity';
import { CryptoService } from '../common/crypto.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MealShare,
      ShareTracking,
      MealRecord,
      User,
      Friendship,
    ]),
  ],
  controllers: [ShareController],
  providers: [ShareService, CryptoService],
  exports: [ShareService],
})
export class ShareModule {}
