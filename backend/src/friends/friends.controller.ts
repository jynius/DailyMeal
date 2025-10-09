import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  // 친구 요청 보내기
  @Post('request')
  async sendFriendRequest(
    @Request() req,
    @Body('email') email: string,
  ) {
    return this.friendsService.sendFriendRequest(req.user.userId, email);
  }

  // 친구 요청 수락
  @Post(':id/accept')
  async acceptFriendRequest(@Request() req, @Param('id') id: string) {
    return this.friendsService.acceptFriendRequest(id, req.user.userId);
  }

  // 친구 요청 거절
  @Post(':id/reject')
  async rejectFriendRequest(@Request() req, @Param('id') id: string) {
    return this.friendsService.rejectFriendRequest(id, req.user.userId);
  }

  // 받은 친구 요청 목록
  @Get('requests/received')
  async getReceivedRequests(@Request() req) {
    return this.friendsService.getPendingRequests(req.user.userId);
  }

  // 보낸 친구 요청 목록
  @Get('requests/sent')
  async getSentRequests(@Request() req) {
    return this.friendsService.getSentRequests(req.user.userId);
  }

  // 친구 요청 취소 (보낸 요청)
  @Delete('requests/:id')
  async cancelFriendRequest(@Request() req, @Param('id') id: string) {
    return this.friendsService.cancelFriendRequest(id, req.user.userId);
  }

  // 구버전 호환 (deprecated)
  @Get('requests')
  async getPendingRequests(@Request() req) {
    return this.friendsService.getPendingRequests(req.user.userId);
  }

  // 내 친구 목록
  @Get()
  async getFriends(@Request() req) {
    return this.friendsService.getFriends(req.user.userId);
  }

  // 친구 삭제
  @Delete(':friendId')
  async removeFriend(@Request() req, @Param('friendId') friendId: string) {
    return this.friendsService.removeFriend(req.user.userId, friendId);
  }

  // 친구 검색 (이메일 또는 이름)
  @Get('search')
  // 친구 검색 (이메일 또는 이름)
  @Get('search')
  async searchUsers(@Request() req, @Query('query') query: string) {
    return this.friendsService.searchUsers(query, req.user.userId);
  }

  // 친구 알림 설정 토글
  @Patch(':friendId/notification')
  async toggleNotification(
    @Request() req,
    @Param('friendId') friendId: string,
    @Body('enabled') enabled: boolean,
  ) {
    return this.friendsService.toggleNotification(req.user.userId, friendId, enabled);
  }

  // 친구 검색 (이메일) - 구버전 호환
  @Get('search/:email')
  async searchUserByEmail(@Request() req, @Param('email') email: string) {
    return this.friendsService.searchUserByEmail(email, req.user.userId);
  }
}
