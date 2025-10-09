import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 내 프로필 조회
  @Get('me')
  async getMyProfile(@Request() req) {
    return this.usersService.getUserProfile(req.user.userId);
  }

  // 프로필 업데이트
  @Patch('me')
  async updateProfile(
    @Request() req,
    @Body() updateData: { username?: string; email?: string; bio?: string },
  ) {
    return this.usersService.updateProfile(req.user.userId, updateData);
  }

  // 프로필 이미지 업로드
  @Post('me/profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadProfileImage(req.user.userId, file);
  }

  // 사용자 통계 조회
  @Get('me/statistics')
  async getStatistics(@Request() req) {
    return this.usersService.getUserStatistics(req.user.userId);
  }

  // 비밀번호 변경
  @Patch('me/password')
  async changePassword(
    @Request() req,
    @Body() passwordData: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(
      req.user.userId,
      passwordData.currentPassword,
      passwordData.newPassword,
    );
  }

  // 계정 삭제
  @Delete('me')
  async deleteAccount(@Request() req, @Body() body: { password: string }) {
    return this.usersService.deleteAccount(req.user.userId, body.password);
  }

  // 설정 조회
  @Get('me/settings')
  async getSettings(@Request() req) {
    return this.usersService.getUserSettings(req.user.userId);
  }

  // 설정 업데이트
  @Patch('me/settings')
  async updateSettings(
    @Request() req,
    @Body() settings: any,
  ) {
    return this.usersService.updateUserSettings(req.user.userId, settings);
  }
}
