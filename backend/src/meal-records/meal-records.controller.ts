/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  ValidationPipe,
  Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { Express } from 'express'
import { MealRecordsService } from './meal-records.service'
import { CreateMealRecordDto, UpdateMealRecordDto } from '../dto/meal-record.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AppLoggerService } from '../common/logger.service'
import { createUploadPath } from '../common/upload.utils'
import { ConfigService } from '../config/config.service'
import { DynamicFilesInterceptor } from '../common/interceptors/dynamic-files.interceptor'

// 파일 업로드 설정은 DynamicFilesInterceptor에서 ConfigService를 통해 처리합니다.

@ApiTags('Meal Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meal-records')
export class MealRecordsController {
  private readonly logger = AppLoggerService.getLogger('MealRecordsController')

  constructor(
    private readonly mealRecordsService: MealRecordsService,
    private readonly configService: ConfigService
  ) {}

  @Post()
  @UseInterceptors(DynamicFilesInterceptor('photos'))
  @ApiOperation({ summary: '식사 기록 생성' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '식사 기록 생성 성공' })
  async create(
    @Body(ValidationPipe) createMealRecordDto: CreateMealRecordDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any
  ) {
    this.logger.info(`🔄 create() called for user: ${req.user.email}`)
    this.logger.debug(
      `📝 Meal data: ${createMealRecordDto.name}, Rating: ${createMealRecordDto.rating}`
    )
    this.logger.debug(`📁 Files received: ${files?.length || 0}`)

    // 다중 사진 경로 처리 (날짜별 폴더 구조 반영)
    const photoPaths: string[] = []
    const fullPhotoPaths: string[] = []
    if (files && files.length > 0) {
      const uploadDir = this.configService.getUploadConfig().dir
      files.forEach((file) => {
        // file.path는 전체 경로, 여기서 /uploads 이후만 추출
        const { urlPath } = createUploadPath(file.filename, {
          uploadDir,
          category: 'meals',
          useDate: true,
        })
        photoPaths.push(urlPath)
        fullPhotoPaths.push(file.path)
        this.logger.debug(`Photo uploaded: ${urlPath}`)
      })
    }

    // GPS 좌표 로그
    if (createMealRecordDto.latitude && createMealRecordDto.longitude) {
      this.logger.debug(
        `GPS coordinates: ${createMealRecordDto.latitude}, ${createMealRecordDto.longitude}`
      )
    }

    const result = await this.mealRecordsService.create(
      createMealRecordDto,
      req.user.id,
      photoPaths,
      fullPhotoPaths
    )

    this.logger.info(`✅ create() completed successfully for meal: ${createMealRecordDto.name}`)
    return result
  }

  @Get()
  @ApiOperation({ summary: '식사 기록 목록 조회' })
  @ApiResponse({ status: 200, description: '식사 기록 목록 조회 성공' })
  findAll(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.mealRecordsService.findAll(req.user.id, page, limit)
  }

  @Get('search')
  @ApiOperation({ summary: '식사 기록 검색' })
  @ApiResponse({ status: 200, description: '식사 기록 검색 성공' })
  search(
    @Request() req: any,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.mealRecordsService.search(req.user.id, query, page, limit)
  }

  @Get('statistics')
  @ApiOperation({ summary: '사용자 통계 조회' })
  @ApiResponse({ status: 200, description: '통계 조회 성공' })
  getStatistics(@Request() req: any) {
    return this.mealRecordsService.getStatistics(req.user.id)
  }

  @Get('locations/frequent')
  @ApiOperation({ summary: '자주 가는 장소 목록 조회' })
  @ApiResponse({ status: 200, description: '자주 가는 장소 목록 조회 성공' })
  getFrequentLocations(@Request() req: any) {
    return this.mealRecordsService.getFrequentLocations(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: '식사 기록 상세 조회' })
  @ApiResponse({ status: 200, description: '식사 기록 상세 조회 성공' })
  @ApiResponse({ status: 404, description: '식사 기록을 찾을 수 없음' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.mealRecordsService.findOne(id, req.user.id)
  }

  @Patch(':id')
  @ApiOperation({ summary: '식사 기록 수정' })
  @ApiResponse({ status: 200, description: '식사 기록 수정 성공' })
  @ApiResponse({ status: 404, description: '식사 기록을 찾을 수 없음' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateMealRecordDto: UpdateMealRecordDto,
    @Request() req: any
  ) {
    return this.mealRecordsService.update(id, updateMealRecordDto, req.user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '식사 기록 삭제' })
  @ApiResponse({ status: 200, description: '식사 기록 삭제 성공' })
  @ApiResponse({ status: 404, description: '식사 기록을 찾을 수 없음' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.mealRecordsService.remove(id, req.user.id)
  }
}
