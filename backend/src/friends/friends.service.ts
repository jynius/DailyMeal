import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from '../entities/friendship.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 친구 요청 보내기
  async sendFriendRequest(userId: string, friendEmail: string) {
    // 이메일로 사용자 찾기
    const friend = await this.userRepository.findOne({
      where: { email: friendEmail },
    });

    if (!friend) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    if (friend.id === userId) {
      throw new Error('자기 자신에게 친구 요청을 보낼 수 없습니다.');
    }

    // 이미 친구 관계가 있는지 확인
    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        { userId, friendId: friend.id },
        { userId: friend.id, friendId: userId },
      ],
    });

    if (existingFriendship) {
      throw new Error('이미 친구 관계가 존재합니다.');
    }

    const friendship = this.friendshipRepository.create({
      userId,
      friendId: friend.id,
      status: 'pending',
    });

    return this.friendshipRepository.save(friendship);
  }

  // 친구 요청 수락
  async acceptFriendRequest(friendshipId: string, userId: string) {
    const friendship = await this.friendshipRepository.findOne({
      where: { id: friendshipId, friendId: userId, status: 'pending' },
    });

    if (!friendship) {
      throw new Error('친구 요청을 찾을 수 없습니다.');
    }

    friendship.status = 'accepted';
    return this.friendshipRepository.save(friendship);
  }

  // 친구 요청 거절
  async rejectFriendRequest(friendshipId: string, userId: string) {
    const friendship = await this.friendshipRepository.findOne({
      where: { id: friendshipId, friendId: userId, status: 'pending' },
    });

    if (!friendship) {
      throw new Error('친구 요청을 찾을 수 없습니다.');
    }

    friendship.status = 'rejected';
    return this.friendshipRepository.save(friendship);
  }

  // 내가 받은 친구 요청 목록
  async getPendingRequests(userId: string) {
    const requests = await this.friendshipRepository.find({
      where: { friendId: userId, status: 'pending' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return requests.map((req) => ({
      id: req.id,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
      },
      createdAt: req.createdAt,
    }));
  }

  // 내 친구 목록
  async getFriends(userId: string) {
    const friendships = await this.friendshipRepository.find({
      where: [
        { userId, status: 'accepted' },
        { friendId: userId, status: 'accepted' },
      ],
      relations: ['user', 'friend'],
      order: { createdAt: 'DESC' },
    });

    return friendships.map((friendship) => {
      const friend =
        friendship.userId === userId ? friendship.friend : friendship.user;
      return {
        id: friend.id,
        email: friend.email,
        name: friend.name,
        createdAt: friendship.createdAt,
      };
    });
  }

  // 친구 삭제
  async removeFriend(userId: string, friendId: string) {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { userId, friendId, status: 'accepted' },
        { userId: friendId, friendId: userId, status: 'accepted' },
      ],
    });

    if (!friendship) {
      throw new Error('친구 관계를 찾을 수 없습니다.');
    }

    return this.friendshipRepository.remove(friendship);
  }

  // 친구 검색 (이메일)
  async searchUserByEmail(email: string, currentUserId: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || user.id === currentUserId) {
      return null;
    }

    // 이미 친구인지 확인
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { userId: currentUserId, friendId: user.id },
        { userId: user.id, friendId: currentUserId },
      ],
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      friendshipStatus: friendship?.status || null,
    };
  }
}
