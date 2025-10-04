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
  UploadedFile,
  Query,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MealRecordsService } from './meal-records.service';
import { CreateMealRecordDto, UpdateMealRecordDto } from '../dto/meal-record.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Meal Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meal-records')
export class MealRecordsController {
  constructor(private readonly mealRecordsService: MealRecordsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('이미지 파일만 업로드 가능합니다'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({ summary: '식사 기록 생성' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '식사 기록 생성 성공' })
  async create(
    @Body(ValidationPipe) createMealRecordDto: CreateMealRecordDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const photoPath = file ? `/uploads/${file.filename}` : undefined;
    return this.mealRecordsService.create(
      createMealRecordDto,
      req.user.id,
      photoPath,
    );
  }

  @Get()
  @ApiOperation({ summary: '식사 기록 목록 조회' })
  @ApiResponse({ status: 200, description: '식사 기록 목록 조회 성공' })
  findAll(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.mealRecordsService.findAll(req.user.id, page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: '식사 기록 검색' })
  @ApiResponse({ status: 200, description: '식사 기록 검색 성공' })
  search(
    @Request() req: any,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.mealRecordsService.search(req.user.id, query, page, limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: '사용자 통계 조회' })
  @ApiResponse({ status: 200, description: '통계 조회 성공' })
  getStatistics(@Request() req: any) {
    return this.mealRecordsService.getStatistics(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '식사 기록 상세 조회' })
  @ApiResponse({ status: 200, description: '식사 기록 상세 조회 성공' })
  @ApiResponse({ status: 404, description: '식사 기록을 찾을 수 없음' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.mealRecordsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '식사 기록 수정' })
  @ApiResponse({ status: 200, description: '식사 기록 수정 성공' })
  @ApiResponse({ status: 404, description: '식사 기록을 찾을 수 없음' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateMealRecordDto: UpdateMealRecordDto,
    @Request() req: any,
  ) {
    return this.mealRecordsService.update(id, updateMealRecordDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '식사 기록 삭제' })
  @ApiResponse({ status: 200, description: '식사 기록 삭제 성공' })
  @ApiResponse({ status: 404, description: '식사 기록을 찾을 수 없음' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.mealRecordsService.remove(id, req.user.id);
  }
}