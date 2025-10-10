import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShareDto {
  @ApiProperty({ description: '공유할 meal의 ID' })
  @IsUUID()
  mealId: string;
}

export class TrackViewDto {
  @ApiProperty({ description: '공유 ID' })
  @IsString()
  shareId: string;

  @ApiProperty({ description: '암호화된 공유자 정보' })
  @IsString()
  ref: string;

  @ApiProperty({ description: '세션 ID (브라우저 고유 ID)' })
  @IsString()
  sessionId: string;
}

export class ConnectFriendDto {
  @ApiProperty({ description: '암호화된 공유자 정보' })
  @IsString()
  ref: string;
}

export class PublicMealResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  photos?: string[];

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  rating?: number;

  @ApiProperty({ required: false })
  memo?: string;

  @ApiProperty({ required: false })
  price?: number;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty()
  createdAt: string; // "2025년 1월" 형식으로 변환

  @ApiProperty()
  sharerName: string; // 공유한 사람 이름

  @ApiProperty({ required: false })
  sharerProfileImage?: string;

  @ApiProperty()
  viewCount: number;
}
