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
      userId: req.user.id,
      username: req.user.name,
      email: req.user.email,
      avatar: req.user.profileImage || null,
      bio: null, // TODO: User 엔티티에 bio 필드 추가 필요
      reviewsCount: 0, // TODO: 실제 평가 수 계산
      restaurantCount: 0, // TODO: 실제 맛집 수 계산
      friendsCount: 0, // TODO: 실제 친구 수 계산
      createdAt: req.createdAt.toISOString(),
    }));
  }

  // 내가 보낸 친구 요청 목록
  async getSentRequests(userId: string) {
    const requests = await this.friendshipRepository.find({
      where: { userId, status: 'pending' },
      relations: ['friend'],
      order: { createdAt: 'DESC' },
    });

    return requests.map((req) => ({
      id: req.id,
      friendId: req.friend.id,
      username: req.friend.name,
      email: req.friend.email,
      avatar: req.friend.profileImage || null,
      bio: null, // TODO: User 엔티티에 bio 필드 추가 필요
      reviewsCount: 0, // TODO: 실제 평가 수 계산
      restaurantCount: 0, // TODO: 실제 맛집 수 계산
      friendsCount: 0, // TODO: 실제 친구 수 계산
      createdAt: req.createdAt.toISOString(),
    }));
  }

  // 친구 요청 취소
  async cancelFriendRequest(friendshipId: string, userId: string) {
    const friendship = await this.friendshipRepository.findOne({
      where: { id: friendshipId, userId, status: 'pending' },
    });

    if (!friendship) {
      throw new Error('친구 요청을 찾을 수 없습니다.');
    }

    return this.friendshipRepository.remove(friendship);
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
        username: friend.name,
        email: friend.email,
        avatar: friend.profileImage || null,
        bio: null, // TODO: User 엔티티에 bio 필드 추가 필요
        reviewsCount: 0, // TODO: 실제 평가 수 계산
        restaurantCount: 0, // TODO: 실제 맛집 수 계산
        friendsCount: 0, // TODO: 실제 친구 수 계산
        isFriend: true,
        isNotificationEnabled: false, // TODO: 알림 설정 기능 추가 필요
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

  // 친구 검색 (이름 또는 이메일)
  async searchUsers(query: string, currentUserId: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId })
      .andWhere(
        '(LOWER(user.name) LIKE LOWER(:query) OR LOWER(user.email) LIKE LOWER(:query))',
        { query: `%${query}%` },
      )
      .take(20)
      .getMany();

    // 각 사용자와의 친구 관계 확인
    const results = await Promise.all(
      users.map(async (user) => {
        const friendship = await this.friendshipRepository.findOne({
          where: [
            { userId: currentUserId, friendId: user.id },
            { userId: user.id, friendId: currentUserId },
          ],
        });

        let friendshipStatus = 'none';
        if (friendship) {
          if (friendship.status === 'accepted') {
            friendshipStatus = 'accepted';
          } else if (friendship.status === 'pending') {
            if (friendship.userId === currentUserId) {
              friendshipStatus = 'pending_sent';
            } else {
              friendshipStatus = 'pending_received';
            }
          }
        }

        return {
          id: user.id,
          username: user.name,
          email: user.email,
          avatar: user.profileImage || null,
          bio: null,
          reviewsCount: 0,
          restaurantCount: 0,
          friendsCount: 0,
          friendshipStatus,
        };
      }),
    );

    return results;
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

  // 친구 알림 설정 토글
  async toggleNotification(userId: string, friendId: string, enabled: boolean) {
    // 친구 관계 확인
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { userId, friendId, status: 'accepted' },
        { userId: friendId, friendId: userId, status: 'accepted' },
      ],
    });

    if (!friendship) {
      throw new Error('친구 관계를 찾을 수 없습니다.');
    }

    // 알림 설정 업데이트
    // 현재 사용자가 주인인 경우와 친구가 주인인 경우 구분
    if (friendship.userId === userId) {
      friendship.notificationEnabled = enabled;
    } else {
      // 반대 방향 friendship 찾기 또는 생성
      let reverseFriendship = await this.friendshipRepository.findOne({
        where: { userId, friendId, status: 'accepted' },
      });

      if (!reverseFriendship) {
        // 반대 방향 관계가 없으면 생성 (일반적으로는 이미 존재해야 함)
        reverseFriendship = this.friendshipRepository.create({
          userId,
          friendId,
          status: 'accepted',
          notificationEnabled: enabled,
        });
      } else {
        reverseFriendship.notificationEnabled = enabled;
      }

      await this.friendshipRepository.save(reverseFriendship);
      return { success: true, notificationEnabled: enabled };
    }

    await this.friendshipRepository.save(friendship);
    return { success: true, notificationEnabled: enabled };
  }
}
