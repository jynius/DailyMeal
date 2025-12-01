import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

export enum SpendingPeriod {
  MONTH = '30d',
  QUARTER = '90d',
  YEAR = '1y',
}

export class SpendingAnalysisQueryDto {
  @ApiProperty({
    enum: SpendingPeriod,
    default: SpendingPeriod.MONTH,
    required: false,
  })
  @IsOptional()
  @IsEnum(SpendingPeriod)
  period?: SpendingPeriod = SpendingPeriod.MONTH

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  alerts?: boolean = true

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  trend?: boolean = false

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  rankBy?: 'valueForMoney' | 'total'
}

export class MonthlySpending {
  @ApiProperty({ example: '2024-11' })
  month: string

  @ApiProperty({ example: 250000 })
  total: number

  @ApiProperty({ example: 8333 })
  average: number // per meal

  @ApiProperty({ example: 30 })
  mealCount: number
}

export class ValueForMoneyRestaurant {
  @ApiProperty({ example: 1 })
  restaurantId: number

  @ApiProperty({ example: 'OO식당' })
  restaurantName: string

  @ApiProperty({ example: 12000 })
  averagePrice: number

  @ApiProperty({ example: 4.5 })
  rating: number

  @ApiProperty({ example: 3.75 })
  valueScore: number // rating / (price/10000)

  @ApiProperty({ example: 5 })
  visitCount: number
}

export class SpendingAlert {
  @ApiProperty({ enum: ['BUDGET_EXCEED', 'UNUSUAL_HIGH', 'TREND_CHANGE'] })
  type: 'BUDGET_EXCEED' | 'UNUSUAL_HIGH' | 'TREND_CHANGE'

  @ApiProperty({ enum: ['info', 'warning', 'critical'] })
  severity: 'info' | 'warning' | 'critical'

  @ApiProperty({ example: '이번 달 예산 초과가 예상됩니다' })
  message: string

  @ApiProperty({ example: 375000, required: false })
  expected?: number

  @ApiProperty({ example: 300000, required: false })
  usual?: number

  @ApiProperty({ example: 25, required: false })
  increase?: number // %
}

export class SpendingTrend {
  @ApiProperty({ enum: ['increasing', 'decreasing', 'stable'] })
  direction: 'increasing' | 'decreasing' | 'stable'

  @ApiProperty({ example: 50 })
  percentage: number

  @ApiProperty({ example: '지난달 대비 50% 증가' })
  message: string
}

export class SpendingAnalysisResponseDto {
  @ApiProperty({ example: true })
  hasEnoughData: boolean

  @ApiProperty({ example: 'Analyzed successfully', required: false })
  message?: string

  @ApiProperty({ type: [MonthlySpending] })
  monthlyTrend: MonthlySpending[]

  @ApiProperty({ type: [ValueForMoneyRestaurant], required: false })
  bestValueRestaurants?: ValueForMoneyRestaurant[]

  @ApiProperty({ type: [SpendingAlert], required: false })
  alerts?: SpendingAlert[]

  @ApiProperty({ type: SpendingTrend, required: false })
  trend?: SpendingTrend

  @ApiProperty({ example: '2024-11-27T00:00:00.000Z' })
  analyzedAt: Date
}
