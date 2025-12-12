import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common'
import { LocationsService } from './locations.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ExternalPlatform } from '../entities/external-place-mapping.entity'

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  /**
   * 내 식당 목록 조회
   */
  @Get()
  async getMyLocations(@Request() req) {
    return this.locationsService.getUserLocations(req.user.userId)
  }

  /**
   * 특정 식당 조회
   */
  @Get(':id')
  async getLocation(@Request() req, @Param('id') id: string) {
    return this.locationsService.getUserLocation(req.user.userId, id)
  }

  /**
   * 새 식당 추가
   */
  @Post()
  async createLocation(
    @Request() req,
    @Body()
    body: {
      name: string
      address?: string
      latitude?: number
      longitude?: number
      externalPlatform?: ExternalPlatform
      externalId?: string
      externalName?: string
      externalData?: Record<string, any>
      notes?: string
    }
  ) {
    return this.locationsService.createUserLocation({
      userId: req.user.userId,
      ...body,
    })
  }

  /**
   * 식당 정보 수정 (개인화 정보만)
   */
  @Patch(':id')
  async updateLocation(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { name?: string; notes?: string }
  ) {
    return this.locationsService.updateUserLocation(req.user.userId, id, body)
  }

  /**
   * 식당 삭제
   */
  @Delete(':id')
  async deleteLocation(@Request() req, @Param('id') id: string) {
    await this.locationsService.deleteUserLocation(req.user.userId, id)
    return { message: 'Location deleted successfully' }
  }

  /**
   * 근처 식당 찾기
   */
  @Post('nearby')
  async findNearby(@Body() body: { latitude: number; longitude: number; radius?: number }) {
    return this.locationsService.findNearbyLocationGroups(
      body.latitude,
      body.longitude,
      body.radius || 50
    )
  }

  /**
   * 친구 추천 식당
   */
  @Get('recommendations/friends')
  async getFriendRecommendations(@Request() req) {
    // TODO: 실제로는 FriendsService에서 친구 목록을 가져와야 함
    // 임시로 빈 배열 반환
    const friendIds: string[] = []
    return this.locationsService.getFriendRecommendations(req.user.userId, friendIds)
  }

  /**
   * LocationGroup에 방문한 사용자들 조회
   */
  @Get('groups/:groupId/visitors')
  async getLocationGroupVisitors(@Param('groupId') groupId: string) {
    return this.locationsService.getUsersWhoVisited(groupId)
  }
}
