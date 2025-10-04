import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateMealRecordDto {
  @ApiProperty({ example: '크림파스타', description: '메뉴 이름' })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: '홍대 이탈리안 레스토랑', 
    description: '식사 장소',
    required: false 
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ 
    example: 4, 
    description: '별점 (1-5점)',
    minimum: 1,
    maximum: 5
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  rating: number;

  @ApiProperty({ 
    example: '정말 맛있었어요!', 
    description: '간단한 메모',
    required: false 
  })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({ 
    example: 18000, 
    description: '가격',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  price?: number;
}

export class UpdateMealRecordDto {
  @ApiProperty({ example: '크림파스타', description: '메뉴 이름', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    example: '홍대 이탈리안 레스토랑', 
    description: '식사 장소',
    required: false 
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ 
    example: 4, 
    description: '별점 (1-5점)',
    minimum: 1,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  rating?: number;

  @ApiProperty({ 
    example: '정말 맛있었어요!', 
    description: '간단한 메모',
    required: false 
  })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({ 
    example: 18000, 
    description: '가격',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  price?: number;
}