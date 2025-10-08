import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealRecordsService } from './meal-records.service';
import { MealRecordsController } from './meal-records.controller';
import { MealRecord } from '../entities/meal-record.entity';
import { RealTimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealRecord]),
    RealTimeModule
  ],
  controllers: [MealRecordsController],
  providers: [MealRecordsService],
})
export class MealRecordsModule {}