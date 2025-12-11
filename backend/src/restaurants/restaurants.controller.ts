/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
  ParseFloatPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantsService } from './restaurants.service';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('detail/:placeIdOrName')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '음식점 상세 정보 조회 (Kakao Place ID 또는 식당명으로)' })
  @ApiResponse({ status: 200, description: '음식점 상세 정보 조회 성공' })
  async getRestaurantByPlaceId(
    @Request() req: any,
    @Param('placeIdOrName') placeIdOrName: string,
  ) {
    // URL 디코딩
    const decoded = decodeURIComponent(placeIdOrName);
    return this.restaurantsService.getRestaurantDetailByPlaceIdOrName(req.user.id, decoded);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자의 음식점 목록 조회' })
  @ApiResponse({ status: 200, description: '음식점 목록 조회 성공' })
  @ApiQuery({ name: 'lat', required: false, type: Number, description: '현재 위도' })
  @ApiQuery({ name: 'lon', required: false, type: Number, description: '현재 경도' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: '검색 반경 (km)' })
  async getRestaurants(
    @Request() req: any,
    @Query('lat', new DefaultValuePipe(0), ParseFloatPipe) lat: number,
    @Query('lon', new DefaultValuePipe(0), ParseFloatPipe) lon: number,
    @Query('radius', new DefaultValuePipe(5), ParseFloatPipe) radius: number,
  ) {
    const currentLat = lat !== 0 ? lat : undefined;
    const currentLon = lon !== 0 ? lon : undefined;
    return this.restaurantsService.getRestaurantsFromMeals(req.user.id, currentLat, currentLon, radius);
  }

  @Post('maps')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '맛집 지도 생성' })
  @ApiResponse({ status: 201, description: '맛집 지도 생성 성공' })
  @ApiQuery({ name: 'lat', required: false, type: Number, description: '현재 위도' })
  @ApiQuery({ name: 'lon', required: false, type: Number, description: '현재 경도' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: '검색 반경 (km)' })
  async createMap(
    @Body()
    createMapDto: {
      title: string;
      description?: string;
      restaurantIds: string[];
      isPublic: boolean;
    },
    @Request() req: any,
    @Query('lat', new DefaultValuePipe(0), ParseFloatPipe) lat: number,
    @Query('lon', new DefaultValuePipe(0), ParseFloatPipe) lon: number,
    @Query('radius', new DefaultValuePipe(5), ParseFloatPipe) radius: number,
  ) {
    const currentLat = lat !== 0 ? lat : undefined;
    const currentLon = lon !== 0 ? lon : undefined;

    return this.restaurantsService.createRestaurantMap(
      req.user.id,
      createMapDto.title,
      createMapDto.description || '',
      createMapDto.restaurantIds,
      createMapDto.isPublic,
      currentLat,
      currentLon,
      radius,
    );
  }
}
