/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { MealRecord } from '../entities/meal-record.entity';
import { Friendship } from '../entities/friendship.entity';
import { UserSettings } from '../entities/user-settings.entity';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import {
  createUploadPath,
  ensureDirectoryExists,
} from '../common/upload.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MealRecord)
    private mealRecordRepository: Repository<MealRecord>,
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    @InjectRepository(UserSettings)
    private userSettingsRepository: Repository<UserSettings>,
  ) {}

  // 사용자 프로필 조회
  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 통계 계산
    const totalReviews = await this.mealRecordRepository.count({
      where: { userId },
    });

    const restaurantCount = await this.mealRecordRepository
      .createQueryBuilder('meal')
      .where('meal.userId = :userId', { userId })
      .select('COUNT(DISTINCT meal.name)', 'count')
      .getRawOne()
      .then((result) => parseInt(result.count) || 0);

    const friendCount = await this.friendshipRepository.count({
      where: [
        { userId, status: 'accepted' },
        { friendId: userId, status: 'accepted' },
      ],
    });

    return {
      id: user.id,
      username: user.name,
      email: user.email,
      profileImage: user.profileImage,
      bio: user.bio || null,
      stats: {
        totalReviews,
        restaurantCount,
        friendCount,
      },
    };
  }

  // 프로필 업데이트
  async updateProfile(
    userId: string,
    updateData: { username?: string; email?: string; bio?: string },
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (updateData.username) {
      user.name = updateData.username;
    }

    if (updateData.email) {
      // 이메일 중복 확인
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new UnauthorizedException('이미 사용 중인 이메일입니다.');
      }

      user.email = updateData.email;
    }

    if (updateData.bio !== undefined) {
      user.bio = updateData.bio;
    }

    await this.userRepository.save(user);

    return this.getUserProfile(userId);
  }

  // 프로필 이미지 업로드
  async uploadProfileImage(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 이전 이미지 삭제
    if (user.profileImage) {
      const oldImagePath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // 새 이미지 저장 (사용자 해시 기반 분산)
    const filename = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
    const { dirPath, urlPath } = createUploadPath(filename, {
      uploadDir: process.env.UPLOAD_DIR || './uploads',
      category: 'profiles',
      userId,
      useDate: false, // 프로필은 날짜별 불필요
      useUserHash: true, // 사용자별 해시 폴더 사용
    });

    ensureDirectoryExists(dirPath);
    const filepath = path.join(dirPath, filename);
    fs.writeFileSync(filepath, file.buffer);

    user.profileImage = urlPath;
    await this.userRepository.save(user);

    return { profileImage: urlPath };
  }

  // 사용자 통계 조회
  async getUserStatistics(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 전체 리뷰 수
    const totalReviews = await this.mealRecordRepository.count({
      where: { userId },
    });

    // 방문한 레스토랑 수
    const totalRestaurants = await this.mealRecordRepository
      .createQueryBuilder('meal')
      .where('meal.userId = :userId', { userId })
      .select('COUNT(DISTINCT meal.name)', 'count')
      .getRawOne()
      .then((result) => parseInt(result.count) || 0);

    // 평균 평점
    const avgRating = await this.mealRecordRepository
      .createQueryBuilder('meal')
      .where('meal.userId = :userId', { userId })
      .andWhere('meal.rating IS NOT NULL')
      .select('AVG(meal.rating)', 'avg')
      .getRawOne()
      .then((result) => parseFloat(result.avg) || 0);

    // 월별 통계 (최근 6개월)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await this.mealRecordRepository
      .createQueryBuilder('meal')
      .where('meal.userId = :userId', { userId })
      .andWhere('meal.createdAt >= :startDate', { startDate: sixMonthsAgo })
      .select([
        "strftime('%Y-%m', meal.createdAt) as month",
        'COUNT(*) as reviewCount',
        'COUNT(DISTINCT meal.name) as restaurantCount',
        'AVG(meal.rating) as averageRating',
      ])
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    // 최고 평점 레스토랑
    const topRatedRestaurants = await this.mealRecordRepository
      .createQueryBuilder('meal')
      .where('meal.userId = :userId', { userId })
      .andWhere('meal.rating IS NOT NULL')
      .select([
        'meal.name as name',
        'AVG(meal.rating) as rating',
        'meal.location as category',
        'COUNT(*) as visitCount',
      ])
      .groupBy('meal.name')
      .addGroupBy('meal.location')
      .orderBy('rating', 'DESC')
      .limit(5)
      .getRawMany();

    // 최근 활동
    const recentActivity = await this.mealRecordRepository
      .createQueryBuilder('meal')
      .where('meal.userId = :userId', { userId })
      .orderBy('meal.createdAt', 'DESC')
      .limit(10)
      .getMany()
      .then((records) =>
        records.map((record) => ({
          date: record.createdAt.toISOString(),
          type: 'review' as const,
          restaurantName: record.name || '알 수 없음',
          rating: record.rating,
        })),
      );

    return {
      totalReviews,
      totalRestaurants,
      averageRating: Math.round(avgRating * 10) / 10,
      monthlyStats: monthlyStats.map((stat) => ({
        month: stat.month,
        reviewCount: parseInt(stat.reviewCount) || 0,
        restaurantCount: parseInt(stat.restaurantCount) || 0,
        averageRating:
          Math.round(parseFloat(stat.averageRating) * 10) / 10 || 0,
      })),
      topRatedRestaurants: topRatedRestaurants.map((restaurant) => ({
        id: restaurant.name, // name을 id로 사용
        name: restaurant.name,
        rating: Math.round(parseFloat(restaurant.rating) * 10) / 10,
        category: restaurant.category || '기타',
        visitCount: parseInt(restaurant.visitCount) || 0,
      })),
      recentActivity,
    };
  }

  // 비밀번호 변경
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);

    return { message: '비밀번호가 변경되었습니다.' };
  }

  // 계정 삭제
  async deleteAccount(userId: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // 프로필 이미지 삭제
    if (user.profileImage) {
      const imagePath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // 사용자 삭제 (관련 데이터는 cascade로 삭제됨)
    await this.userRepository.remove(user);

    return { message: '계정이 삭제되었습니다.' };
  }

  // 사용자 설정 조회
  async getUserSettings(userId: string) {
    let settings = await this.userSettingsRepository.findOne({
      where: { userId },
    });

    // 설정이 없으면 기본값으로 생성
    if (!settings) {
      settings = this.userSettingsRepository.create({
        userId: userId,
        notificationFriendRequest: true,
        notificationNewReview: true,
        notificationNearbyFriend: false,
        privacyProfilePublic: false,
        privacyShowLocation: true,
        privacyShowMealDetails: true,
        locationHome: '',
        locationOffice: '',
        locationHomeLatitude: 0,
        locationHomeLongitude: 0,
        locationOfficeLatitude: 0,
        locationOfficeLongitude: 0,
      });

      settings = await this.userSettingsRepository.save(settings);
    }

    // 프론트엔드 형식으로 변환
    return {
      notifications: {
        friendRequest: settings.notificationFriendRequest,
        newReview: settings.notificationNewReview,
        nearbyFriend: settings.notificationNearbyFriend,
      },
      privacy: {
        profilePublic: settings.privacyProfilePublic,
        showLocation: settings.privacyShowLocation,
        showMealDetails: settings.privacyShowMealDetails,
      },
      locations: {
        home: settings.locationHome || '',
        office: settings.locationOffice || '',
        homeCoords: {
          lat: settings.locationHomeLatitude || 0,
          lng: settings.locationHomeLongitude || 0,
        },
        officeCoords: {
          lat: settings.locationOfficeLatitude || 0,
          lng: settings.locationOfficeLongitude || 0,
        },
      },
    };
  }

  // 사용자 설정 업데이트
  async updateUserSettings(userId: string, settingsData: any) {
    let settings = await this.userSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = this.userSettingsRepository.create({
        userId: userId,
        notificationFriendRequest: true,
        notificationNewReview: true,
        notificationNearbyFriend: false,
        privacyProfilePublic: false,
        privacyShowLocation: true,
        privacyShowMealDetails: true,
        locationHome: '',
        locationOffice: '',
        locationHomeLatitude: 0,
        locationHomeLongitude: 0,
        locationOfficeLatitude: 0,
        locationOfficeLongitude: 0,
      });
    }

    // 알림 설정
    if (settingsData.notifications) {
      settings.notificationFriendRequest =
        settingsData.notifications.friendRequest ??
        settings.notificationFriendRequest;
      settings.notificationNewReview =
        settingsData.notifications.newReview ?? settings.notificationNewReview;
      settings.notificationNearbyFriend =
        settingsData.notifications.nearbyFriend ??
        settings.notificationNearbyFriend;
    }

    // 프라이버시 설정
    if (settingsData.privacy) {
      settings.privacyProfilePublic =
        settingsData.privacy.profilePublic ?? settings.privacyProfilePublic;
      settings.privacyShowLocation =
        settingsData.privacy.showLocation ?? settings.privacyShowLocation;
      settings.privacyShowMealDetails =
        settingsData.privacy.showMealDetails ?? settings.privacyShowMealDetails;
    }

    // 장소 설정
    if (settingsData.locations) {
      settings.locationHome =
        settingsData.locations.home ?? settings.locationHome;
      settings.locationOffice =
        settingsData.locations.office ?? settings.locationOffice;

      if (settingsData.locations.homeCoords) {
        settings.locationHomeLatitude =
          settingsData.locations.homeCoords.lat ??
          settings.locationHomeLatitude;
        settings.locationHomeLongitude =
          settingsData.locations.homeCoords.lng ??
          settings.locationHomeLongitude;
      }

      if (settingsData.locations.officeCoords) {
        settings.locationOfficeLatitude =
          settingsData.locations.officeCoords.lat ??
          settings.locationOfficeLatitude;
        settings.locationOfficeLongitude =
          settingsData.locations.officeCoords.lng ??
          settings.locationOfficeLongitude;
      }
    }

    await this.userSettingsRepository.save(settings);

    return { message: '설정이 저장되었습니다.' };
  }
}
