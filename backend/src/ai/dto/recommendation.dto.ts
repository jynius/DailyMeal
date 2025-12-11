import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsOptional, Max, Min, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'

export enum RecommendationType {
  SOCIAL = 'social',
  POPULAR = 'popular',
  COLLABORATIVE = 'collaborative',
}

export class RecommendationQueryDto {
  @ApiProperty({
    enum: RecommendationType,
    default: RecommendationType.SOCIAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(RecommendationType)
  type?: RecommendationType = RecommendationType.SOCIAL

  @ApiProperty({ required: false, default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : value) as number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10

  @ApiProperty({ required: false, example: 5000, description: 'meters' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value as string) : value) as number)
  @IsNumber()
  maxDistance?: number

  @ApiProperty({ required: false, example: 15000 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value as string) : value) as number)
  @IsNumber()
  maxPrice?: number

  @ApiProperty({ required: false, example: 4.0 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value as string) : value) as number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number

  @ApiProperty({ required: false, example: true, description: 'Exclude visited restaurants' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value as boolean
  })
  @IsBoolean()
  excludeVisited?: boolean
}

export class FriendWhoLiked {
  @ApiProperty({ example: 'friend-uuid-123' })
  friendId: string

  @ApiProperty({ example: '철수' })
  friendName: string

  @ApiProperty({ example: 4.5 })
  rating: number
}

export class RecommendationItem {
  @ApiProperty({ example: 1, required: false })
  restaurantId?: number

  @ApiProperty({ example: '12345678', required: false })
  placeId?: string

  @ApiProperty({ example: 'OO식당' })
  restaurantName: string

  @ApiProperty({ example: '서울시 강남구...' })
  address: string

  @ApiProperty({ example: '한식 > 찌개류', required: false })
  categoryName?: string

  @ApiProperty({ example: '김치찌개', required: false })
  menuCategory?: string

  @ApiProperty({ type: [String], example: ['김치찌개', '된장찌개'], required: false })
  popularMenus?: string[]

  @ApiProperty({ example: 1500 })
  distance: number // meters

  @ApiProperty({ example: 12000, required: false })
  averagePrice?: number

  @ApiProperty({ example: 4.5, required: false })
  rating?: number

  @ApiProperty({ example: '친구 3명이 좋아한 맛집' })
  reason: string

  @ApiProperty({ type: [FriendWhoLiked], required: false })
  likedByFriends?: FriendWhoLiked[]

  @ApiProperty({ example: 150, required: false })
  visitCount?: number // by all users

  @ApiProperty({ example: 5, required: false })
  similarUsers?: number

  @ApiProperty({ example: false })
  visited: boolean
}

export class RecommendationResponseDto {
  @ApiProperty({ enum: RecommendationType })
  type: RecommendationType

  @ApiProperty({ type: [RecommendationItem] })
  recommendations: RecommendationItem[]

  @ApiProperty({ example: 10 })
  count: number

  @ApiProperty({ example: '2024-11-27T00:00:00.000Z' })
  generatedAt: Date
}
