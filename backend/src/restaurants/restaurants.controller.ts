/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantsService } from './restaurants.service';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자의 음식점 목록 조회' })
  @ApiResponse({ status: 200, description: '음식점 목록 조회 성공' })
  async getRestaurants(@Request() req: any) {
    return this.restaurantsService.getRestaurantsFromMeals(req.user.id);
  }

  @Post('maps')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '맛집 지도 생성' })
  @ApiResponse({ status: 201, description: '맛집 지도 생성 성공' })
  async createMap(
    @Body()
    createMapDto: {
      title: string;
      description?: string;
      restaurantIds: string[];
      isPublic: boolean;
    },
    @Request() req: any,
  ) {
    return this.restaurantsService.createRestaurantMap(
      req.user.id,
      createMapDto.title,
      createMapDto.description || '',
      createMapDto.restaurantIds,
      createMapDto.isPublic,
    );
  }
}
