/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShareService } from './share.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateShareDto,
  TrackViewDto,
  ConnectFriendDto,
  PublicMealResponseDto,
} from '../dto/share.dto';

@ApiTags('Share')
@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  /**
   * 공유 링크 생성 (인증 필요)
   */
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '식사 기록 공유 링크 생성' })
  @ApiResponse({ status: 201, description: '공유 링크 생성 성공' })
  async createShare(@Body() createShareDto: CreateShareDto, @Request() req) {
    return this.shareService.createShareLink(
      createShareDto.mealId,
      req.user.id,
    );
  }

  /**
   * 공개 Meal 조회 (인증 불필요)
   */
  @Get('meal/:shareId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '공유된 식사 기록 조회 (공개)' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: PublicMealResponseDto,
  })
  async getPublicMeal(
    @Param('shareId') shareId: string,
  ): Promise<PublicMealResponseDto> {
    return this.shareService.getPublicMeal(shareId);
  }

  /**
   * 공유 조회 추적 (비로그인)
   */
  @Post('track-view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '공유 조회 추적' })
  async trackView(
    @Body() trackViewDto: TrackViewDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    await this.shareService.trackView(
      trackViewDto.shareId,
      trackViewDto.ref,
      trackViewDto.sessionId,
      ip,
      userAgent || '',
    );
    return { success: true };
  }

  /**
   * 공유를 통한 친구 연결 (로그인/가입 후)
   */
  @Post('connect-friend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '공유를 통한 친구 연결' })
  async connectFriend(
    @Body() connectFriendDto: ConnectFriendDto,
    @Request() req,
  ) {
    return this.shareService.connectFriend(connectFriendDto.ref, req.user.id);
  }

  /**
   * 내 공유 통계 조회 (인증 필요)
   */
  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '내 공유 통계 조회' })
  async getMyShareStats(@Request() req) {
    return this.shareService.getMyShareStats(req.user.id);
  }
}
