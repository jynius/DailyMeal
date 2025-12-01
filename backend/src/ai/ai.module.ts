import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MealRecord } from '../entities/meal-record.entity'
import { User } from '../entities/user.entity'
import { Friendship } from '../entities/friendship.entity'
import { PatternAnalysisService } from './analysis/pattern-analysis.service'
import { SpendingAnalysisService } from './analysis/spending-analysis.service'
import { RecommendationService } from './recommendation/recommendation.service'
import { AiController } from './ai.controller'

@Module({
  imports: [TypeOrmModule.forFeature([MealRecord, User, Friendship])],
  controllers: [AiController],
  providers: [PatternAnalysisService, SpendingAnalysisService, RecommendationService],
  exports: [PatternAnalysisService, SpendingAnalysisService, RecommendationService],
})
export class AiModule {}
