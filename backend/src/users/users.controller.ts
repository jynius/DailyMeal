/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
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
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UsersService } from './users.service'
import { FindUserDto } from '../dto/find-user.dto'
import { RequestPasswordResetDto, ResetPasswordDto } from '../dto/reset-password.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 아이디 찾기 (이름 기반)
  @Post('find-id')
  async findUserId(@Body() findUserDto: FindUserDto) {
    return this.usersService.findUserIdByName(findUserDto.name)
  }

  // 비밀번호 재설정 요청
  @Post('request-password-reset')
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.usersService.requestPasswordReset(requestPasswordResetDto.email)
  }

  // 비밀번호 재설정
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(resetPasswordDto.token, resetPasswordDto.password)
  }

  // 내 프로필 조회
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req) {
    return this.usersService.getUserProfile(req.user.id)
  }

  // 프로필 업데이트
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateData: { username?: string; email?: string; bio?: string }
  ) {
    return this.usersService.updateProfile(req.user.id, updateData)
  }

  // 프로필 이미지 업로드
  @Post('me/profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(@Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.uploadProfileImage(req.user.id, file)
  }

  // 사용자 통계 조회
  @Get('me/statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Request() req) {
    return this.usersService.getUserStatistics(req.user.id)
  }

  // 비밀번호 변경
  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body() passwordData: { currentPassword: string; newPassword: string }
  ) {
    return this.usersService.changePassword(
      req.user.id,
      passwordData.currentPassword,
      passwordData.newPassword
    )
  }

  // 계정 삭제
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Request() req, @Body() body: { password: string }) {
    return this.usersService.deleteAccount(req.user.id, body.password)
  }

  // 설정 조회
  @Get('me/settings')
  @UseGuards(JwtAuthGuard)
  async getSettings(@Request() req) {
    return this.usersService.getUserSettings(req.user.id)
  }

  // 설정 업데이트
  @Patch('me/settings')
  @UseGuards(JwtAuthGuard)
  async updateSettings(@Request() req, @Body() settings: any) {
    return this.usersService.updateUserSettings(req.user.id, settings)
  }
}
