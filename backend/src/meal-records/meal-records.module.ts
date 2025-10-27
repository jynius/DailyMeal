import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealRecordsService } from './meal-records.service';
import { MealRecordsController } from './meal-records.controller';
import { MealRecord } from '../entities/meal-record.entity';
import { User } from '../entities/user.entity';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [TypeOrmModule.forFeature([MealRecord, User])],
  controllers: [MealRecordsController],
  providers: [MealRecordsService, ConfigService],
})
export class MealRecordsModule {}
