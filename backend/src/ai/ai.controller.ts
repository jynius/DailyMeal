import { Controller, Get, Query, UseGuards, Logger, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PatternAnalysisService } from './analysis/pattern-analysis.service'
import { SpendingAnalysisService } from './analysis/spending-analysis.service'
import { RecommendationService } from './recommendation/recommendation.service'
import { PatternAnalysisQueryDto, PatternAnalysisResponseDto } from './dto/pattern-analysis.dto'
import { SpendingAnalysisQueryDto, SpendingAnalysisResponseDto } from './dto/spending-analysis.dto'
import {
  RecommendationQueryDto,
  RecommendationResponseDto,
  RecommendationType,
} from './dto/recommendation.dto'

interface RequestWithUser extends Request {
  user: {
    id: string
    username: string
  }
}

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  private readonly logger = new Logger(AiController.name)

  constructor(
    private readonly patternAnalysisService: PatternAnalysisService,
    private readonly spendingAnalysisService: SpendingAnalysisService,
    private readonly recommendationService: RecommendationService
  ) {}

  @Get('analysis/pattern')
  @ApiOperation({
    summary: '식습관 패턴 분석',
    description:
      '사용자의 식사 기록을 분석하여 시간대별, 요일별 패턴, 선호 카테고리, 혼밥/회식 비율 등을 제공합니다.',
  })
  async analyzePattern(
    @Query() query: PatternAnalysisQueryDto,
    @Req() req: RequestWithUser
  ): Promise<PatternAnalysisResponseDto> {
    const userId: string = req.user.id
    this.logger.log(`Pattern analysis request from user ${userId}`)

    return this.patternAnalysisService.analyzePattern(userId, query.period)
  }

  @Get('analysis/spending')
  @ApiOperation({
    summary: '소비 패턴 분석',
    description:
      '사용자의 외식비 지출을 분석하여 월별 추이, 가성비 식당, 예산 초과 알림 등을 제공합니다.',
  })
  async analyzeSpending(
    @Query() query: SpendingAnalysisQueryDto,
    @Req() req: RequestWithUser
  ): Promise<SpendingAnalysisResponseDto> {
    const userId: string = req.user.id
    this.logger.log(`Spending analysis request from user ${userId}`)

    return this.spendingAnalysisService.analyzeSpending(userId, query.period, {
      alerts: query.alerts,
      trend: query.trend,
      rankBy: query.rankBy,
    })
  }

  @Get('recommendations')
  @ApiOperation({
    summary: '맛집 추천',
    description:
      '친구가 좋아한 맛집, 주변 인기 맛집, 비슷한 취향의 사용자가 좋아한 맛집을 추천합니다.',
  })
  async getRecommendations(
    @Query() query: RecommendationQueryDto,
    @Req() req: RequestWithUser
  ): Promise<RecommendationResponseDto> {
    const userId: string = req.user.id
    const type = query.type || RecommendationType.SOCIAL
    this.logger.log(`Recommendations request from user ${userId}, type: ${type}`)
    this.logger.log(`Query params: ${JSON.stringify(query)}`)

    return this.recommendationService.getRecommendations(userId, type, {
      limit: query.limit,
      maxDistance: query.maxDistance,
      maxPrice: query.maxPrice,
      minRating: query.minRating,
      excludeVisited: query.excludeVisited,
    })
  }
}
