import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateMealRecordDto {
  @ApiProperty({ example: '크림파스타', description: '메뉴 이름' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '홍대 이탈리안 레스토랑',
    description: '식사 장소',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: 4,
    description: '별점 (1-5점) - 나중에 평가 가능',
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }: { value: number | string | undefined }) =>
    value !== undefined ? parseInt(String(value)) : undefined,
  )
  rating?: number;

  @ApiProperty({
    example: '정말 맛있었어요!',
    description: '간단한 메모',
    required: false,
  })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({
    example: 18000,
    description: '가격',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: number | string | undefined }) =>
    value ? parseFloat(String(value)) : undefined,
  )
  price?: number;

  @ApiProperty({
    example: 37.5665,
    description: 'GPS 위도',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: number | string | undefined }) =>
    value ? parseFloat(String(value)) : undefined,
  )
  latitude?: number;

  @ApiProperty({
    example: 126.978,
    description: 'GPS 경도',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: number | string | undefined }) =>
    value ? parseFloat(String(value)) : undefined,
  )
  longitude?: number;

  @ApiProperty({
    example: '서울특별시 마포구 홍익로 39',
    description: '상세 주소',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'restaurant',
    description: '식사 카테고리 (home: 집밥, delivery: 배달, restaurant: 식당)',
    enum: ['home', 'delivery', 'restaurant'],
    required: false,
  })
  @IsOptional()
  @IsIn(['home', 'delivery', 'restaurant'])
  category?: 'home' | 'delivery' | 'restaurant';

  @ApiProperty({
    example: ['uuid-1', 'uuid-2'],
    description: '같이 식사한 친구 ID 배열',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }: { value: string | string[] | undefined }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as string[];
      } catch {
        return [];
      }
    }
    return (value as string[]) || [];
  })
  companionIds?: string[];

  @ApiProperty({
    example: '철수, 영희',
    description: '같이 식사한 사람 이름 (텍스트)',
    required: false,
  })
  @IsOptional()
  @IsString()
  companionNames?: string;
}

export class UpdateMealRecordDto {
  @ApiProperty({
    example: '크림파스타',
    description: '메뉴 이름',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: '홍대 이탈리안 레스토랑',
    description: '식사 장소',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: 4,
    description: '별점 (1-5점)',
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }: { value: number | string | undefined }) =>
    parseInt(String(value)),
  )
  rating?: number;

  @ApiProperty({
    example: '정말 맛있었어요!',
    description: '간단한 메모',
    required: false,
  })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({
    example: 18000,
    description: '가격',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: number | string | undefined }) =>
    value ? parseFloat(String(value)) : undefined,
  )
  price?: number;

  @ApiProperty({
    example: 37.5665,
    description: 'GPS 위도',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: number | string | undefined }) =>
    value ? parseFloat(String(value)) : undefined,
  )
  latitude?: number;

  @ApiProperty({
    example: 126.978,
    description: 'GPS 경도',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: number | string | undefined }) =>
    value ? parseFloat(String(value)) : undefined,
  )
  longitude?: number;

  @ApiProperty({
    example: '서울특별시 마포구 홍익로 39',
    description: '상세 주소',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'restaurant',
    description: '식사 카테고리 (home: 집밥, delivery: 배달, restaurant: 식당)',
    enum: ['home', 'delivery', 'restaurant'],
    required: false,
  })
  @IsOptional()
  @IsIn(['home', 'delivery', 'restaurant'])
  category?: 'home' | 'delivery' | 'restaurant';

  @ApiProperty({
    example: ['uuid-1', 'uuid-2'],
    description: '같이 식사한 친구 ID 배열',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  companionIds?: string[];

  @ApiProperty({
    example: '철수, 영희',
    description: '같이 식사한 사람 이름 (텍스트)',
    required: false,
  })
  @IsOptional()
  @IsString()
  companionNames?: string;
}
