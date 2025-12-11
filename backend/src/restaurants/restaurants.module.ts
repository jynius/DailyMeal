import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { MealRecord } from '../entities/meal-record.entity';
import { KakaoPlace } from '../entities/kakao-place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MealRecord, KakaoPlace])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
