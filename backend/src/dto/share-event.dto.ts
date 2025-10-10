import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SharePlatform {
  NATIVE = 'native',
  COPY_LINK = 'copy_link',
  KAKAO = 'kakao',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  DOWNLOAD = 'download',
}

export class ShareEventDto {
  @ApiProperty({
    example: 'kakao',
    description: '공유 플랫폼',
    enum: SharePlatform,
  })
  @IsEnum(SharePlatform)
  platform: SharePlatform;

  @ApiProperty({
    example: '12345',
    description: '공유된 식사 기록 ID',
  })
  @IsString()
  mealRecordId: string;

  @ApiProperty({
    example: 'meal_detail',
    description: '공유 발생 위치 (meal_detail, meal_card, feed)',
    required: false,
  })
  @IsOptional()
  @IsString()
  source?: string;
}
