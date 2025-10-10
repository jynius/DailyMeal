import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { MealShare } from '../entities/meal-share.entity';
import { ShareTracking } from '../entities/share-tracking.entity';
import { MealRecord } from '../entities/meal-record.entity';
import { User } from '../entities/user.entity';
import { Friendship } from '../entities/friendship.entity';
import { CryptoService } from '../common/crypto.service';
import { PublicMealResponseDto } from '../dto/share.dto';

@Injectable()
export class ShareService {
  private readonly logger = new Logger(ShareService.name);

  constructor(
    @InjectRepository(MealShare)
    private mealShareRepository: Repository<MealShare>,
    @InjectRepository(ShareTracking)
    private shareTrackingRepository: Repository<ShareTracking>,
    @InjectRepository(MealRecord)
    private mealRecordRepository: Repository<MealRecord>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    private cryptoService: CryptoService,
  ) {}

  /**
   * 공유 링크 생성
   */
  async createShareLink(
    mealId: string,
    userId: string,
  ): Promise<{ shareId: string; url: string; ref: string }> {
    // Meal 존재 및 권한 확인
    const meal = await this.mealRecordRepository.findOne({
      where: { id: mealId },
      relations: ['user'],
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    if (meal.userId !== userId) {
      throw new ForbiddenException('You can only share your own meals');
    }

    // 기존 공유 링크가 있는지 확인
    let mealShare = await this.mealShareRepository.findOne({
      where: { mealId, sharerId: userId, isActive: true },
    });

    if (mealShare) {
      // 기존 링크 재사용
      const ref = this.cryptoService.encrypt(userId);
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const url = `${baseUrl}/share/meal/${mealShare.shareId}?ref=${ref}`;

      return {
        shareId: mealShare.shareId,
        url,
        ref,
      };
    }

    // 새 공유 링크 생성
    const shareId = this.cryptoService.generateShareId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30일 후 만료

    mealShare = this.mealShareRepository.create({
      shareId,
      mealId,
      sharerId: userId,
      expiresAt,
      isActive: true,
    });

    await this.mealShareRepository.save(mealShare);

    const ref = this.cryptoService.encrypt(userId);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = `${baseUrl}/share/meal/${shareId}?ref=${ref}`;

    return {
      shareId,
      url,
      ref,
    };
  }

  /**
   * 공개 Meal 조회 (인증 불필요)
   */
  async getPublicMeal(shareId: string): Promise<PublicMealResponseDto> {
    const mealShare = await this.mealShareRepository.findOne({
      where: { shareId, isActive: true },
      relations: ['meal', 'meal.user', 'sharer'],
    });

    if (!mealShare) {
      throw new NotFoundException('Share link not found or expired');
    }

    // 만료 확인
    if (mealShare.expiresAt && new Date() > mealShare.expiresAt) {
      throw new NotFoundException('Share link has expired');
    }

    const meal = mealShare.meal;
    const sharer = mealShare.sharer;

    // 조회수 증가
    mealShare.viewCount += 1;
    await this.mealShareRepository.save(mealShare);

    // 날짜 포맷 변경 (개인정보 보호)
    const createdDate = new Date(meal.createdAt);
    const formattedDate = `${createdDate.getFullYear()}년 ${createdDate.getMonth() + 1}월`;

    // 이미지 URL 변환
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    const photos =
      meal.photos?.map((photo) =>
        photo.startsWith('http') ? photo : `${baseUrl}${photo}`,
      ) || [];

    return {
      id: meal.id,
      name: meal.name,
      photos,
      location: meal.location,
      rating: meal.rating,
      memo: meal.memo,
      price: meal.price,
      category: meal.category,
      createdAt: formattedDate,
      sharerName: sharer.name,
      sharerProfileImage: sharer.profileImage,
      viewCount: mealShare.viewCount,
    };
  }

  /**
   * 공유 조회 추적 (비로그인)
   */
  async trackView(
    shareId: string,
    ref: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    try {
      // ref 복호화하여 sharerId 추출
      const sharerId = this.cryptoService.decrypt(ref);

      // 이미 이 세션으로 조회한 기록이 있는지 확인
      const existing = await this.shareTrackingRepository.findOne({
        where: { shareId, sessionId },
      });

      if (existing) {
        // 이미 추적 중이면 업데이트만
        existing.viewedAt = new Date();
        await this.shareTrackingRepository.save(existing);
        return;
      }

      // 새 추적 레코드 생성
      const tracking = this.shareTrackingRepository.create({
        shareId,
        sharerId,
        sessionId,
        ipAddress,
        userAgent,
      });

      await this.shareTrackingRepository.save(tracking);
    } catch (error) {
      this.logger.error('Failed to track view:', error);
      // 추적 실패해도 메인 기능에 영향 없도록
    }
  }

  /**
   * 공유를 통한 친구 연결 (로그인/가입 후)
   */
  async connectFriend(
    ref: string,
    recipientId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // ref 복호화하여 sharerId 추출
      const sharerId = this.cryptoService.decrypt(ref);

      // 자기 자신과는 친구가 될 수 없음
      if (sharerId === recipientId) {
        return { success: false, message: 'Cannot befriend yourself' };
      }

      // ShareTracking 업데이트 (세션 ID로 찾아서)
      const trackings = await this.shareTrackingRepository.find({
        where: { sharerId, recipientId: IsNull() },
        order: { createdAt: 'DESC' },
      });

      if (trackings.length > 0) {
        const tracking = trackings[0];
        tracking.recipientId = recipientId;
        tracking.convertedAt = new Date();
        await this.shareTrackingRepository.save(tracking);
      }

      // 이미 친구인지 확인
      const existingFriendship = await this.friendshipRepository.findOne({
        where: [
          { userId: sharerId, friendId: recipientId },
          { userId: recipientId, friendId: sharerId },
        ],
      });

      if (existingFriendship) {
        if (existingFriendship.status === 'accepted') {
          return { success: false, message: 'Already friends' };
        } else if (existingFriendship.status === 'pending') {
          return { success: false, message: 'Friend request already sent' };
        }
      }

      // 자동으로 양방향 친구 승인 (공유를 통한 연결이므로)
      await this.friendshipRepository.save([
        {
          userId: sharerId,
          friendId: recipientId,
          status: 'accepted',
          notificationEnabled: true,
        },
        {
          userId: recipientId,
          friendId: sharerId,
          status: 'accepted',
          notificationEnabled: true,
        },
      ]);

      // ShareTracking에 친구 요청 완료 표시
      if (trackings.length > 0) {
        trackings[0].friendRequestSent = true;
        await this.shareTrackingRepository.save(trackings[0]);
      }

      return { success: true, message: 'Friend added successfully' };
    } catch (error) {
      this.logger.error('Failed to connect friend:', error);
      throw new BadRequestException('Invalid share reference');
    }
  }

  /**
   * 공유 통계 조회 (내가 공유한 링크들)
   */
  async getMyShareStats(userId: string): Promise<any[]> {
    const shares = await this.mealShareRepository.find({
      where: { sharerId: userId, isActive: true },
      relations: ['meal'],
      order: { createdAt: 'DESC' },
    });

    const stats = await Promise.all(
      shares.map(async (share) => {
        const trackingCount = await this.shareTrackingRepository.count({
          where: { shareId: share.id },
        });

        const conversions = await this.shareTrackingRepository.count({
          where: { shareId: share.id, convertedAt: Not(IsNull()) },
        });

        return {
          shareId: share.shareId,
          mealName: share.meal.name,
          viewCount: share.viewCount,
          trackingCount,
          conversions,
          createdAt: share.createdAt,
        };
      }),
    );

    return stats;
  }
}
