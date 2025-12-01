import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

export enum AnalysisPeriod {
  WEEK = '7d',
  MONTH = '30d',
  QUARTER = '90d',
}

export class PatternAnalysisQueryDto {
  @ApiProperty({
    enum: AnalysisPeriod,
    default: AnalysisPeriod.MONTH,
    required: false,
  })
  @IsOptional()
  @IsEnum(AnalysisPeriod)
  period?: AnalysisPeriod = AnalysisPeriod.MONTH
}

export class TimeDistribution {
  @ApiProperty({ example: 15 })
  breakfast: number // 0-100%

  @ApiProperty({ example: 40 })
  lunch: number

  @ApiProperty({ example: 35 })
  dinner: number

  @ApiProperty({ example: 10 })
  lateNight: number
}

export class WeekdayPattern {
  @ApiProperty({ example: { homeCooked: 70, eatingOut: 30 } })
  weekday: { homeCooked: number; eatingOut: number }

  @ApiProperty({ example: { homeCooked: 20, eatingOut: 80 } })
  weekend: { homeCooked: number; eatingOut: number }
}

export class FoodCategory {
  @ApiProperty({ example: '한식' })
  category: string

  @ApiProperty({ example: 50 })
  percentage: number

  @ApiProperty({ example: 45 })
  count: number
}

export class DiningMode {
  @ApiProperty({ example: 60 })
  solo: number // %

  @ApiProperty({ example: 40 })
  group: number // %
}

export class PatternAnalysisResponseDto {
  @ApiProperty({ example: true })
  hasEnoughData: boolean

  @ApiProperty({ example: 'Analyzed successfully', required: false })
  message?: string

  @ApiProperty({ example: 90 })
  totalMeals: number

  @ApiProperty({ example: 85 })
  confidence: number // 0-100

  @ApiProperty({ type: TimeDistribution })
  timeDistribution: TimeDistribution

  @ApiProperty({ type: WeekdayPattern })
  weekdayPattern: WeekdayPattern

  @ApiProperty({ type: [FoodCategory] })
  preferredCategories: FoodCategory[]

  @ApiProperty({ type: DiningMode })
  diningMode: DiningMode

  @ApiProperty({ example: '2024-11-27T00:00:00.000Z' })
  analyzedAt: Date
}
