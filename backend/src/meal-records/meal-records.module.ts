import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealRecordsService } from './meal-records.service';
import { MealRecordsController } from './meal-records.controller';
import { MealRecord } from '../entities/meal-record.entity';
import { User } from '../entities/user.entity';
import { RealTimeModule } from '../realtime/realtime.module';
import { ConfigModule } from '../config/config.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealRecord, User]),
    RealTimeModule,
    ConfigModule,
    LocationsModule,
  ],
  controllers: [MealRecordsController],
  providers: [MealRecordsService],
})
export class MealRecordsModule {}
