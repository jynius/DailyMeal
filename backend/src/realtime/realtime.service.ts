import { Injectable } from '@nestjs/common';
import { RealTimeGateway } from './realtime.gateway';

@Injectable()
export class RealTimeService {
  constructor(private readonly realTimeGateway: RealTimeGateway) {}

  // 새로운 식사 기록 알림
  notifyNewMeal(mealData: any) {
    this.realTimeGateway.broadcastNewMeal(mealData);
  }

  // 새로운 음식점 알림
  notifyNewRestaurant(restaurantData: any) {
    this.realTimeGateway.broadcastNewRestaurant(restaurantData);
  }

  // 좋아요 업데이트 알림
  notifyLikeUpdate(mealId: string, likes: number, userId: number) {
    this.realTimeGateway.broadcastLikeUpdate({ mealId, likes, userId });
  }

  // 새로운 댓글 알림
  notifyNewComment(mealId: string, comment: any, userId: number) {
    this.realTimeGateway.broadcastNewComment({ mealId, comment, userId });
  }

  // 개별 사용자 알림
  notifyUser(userId: number, notification: any) {
    this.realTimeGateway.sendNotificationToUser(userId, notification);
  }

  // 연결된 사용자 수 조회
  getConnectedUsersCount(): number {
    return this.realTimeGateway.getConnectedUsers().length;
  }

  // 연결된 사용자 목록 조회
  getConnectedUsers() {
    return this.realTimeGateway.getConnectedUsers();
  }
}