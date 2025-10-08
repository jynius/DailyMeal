import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface ConnectedUser {
  id: string;
  socketId: string;
  userId?: number;
  username?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
})
export class RealTimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('RealTimeGateway');
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    
    const user: ConnectedUser = {
      id: client.id,
      socketId: client.id,
    };
    
    this.connectedUsers.set(client.id, user);
    
    // 연결된 사용자 수 브로드캐스트
    this.server.emit('userCount', this.connectedUsers.size);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
    
    // 연결된 사용자 수 브로드캐스트
    this.server.emit('userCount', this.connectedUsers.size);
  }

  @SubscribeMessage('userAuth')
  handleUserAuth(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number; username: string }
  ) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      user.userId = data.userId;
      user.username = data.username;
      this.connectedUsers.set(client.id, user);
      
      this.logger.log(`User authenticated: ${data.username} (${data.userId})`);
      
      // 사용자에게 인증 완료 응답
      client.emit('authSuccess', { userId: data.userId, username: data.username });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string }
  ) {
    client.join(data.room);
    this.logger.log(`Client ${client.id} joined room: ${data.room}`);
    
    // 방에 참여 알림
    client.to(data.room).emit('userJoined', {
      socketId: client.id,
      room: data.room,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string }
  ) {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} left room: ${data.room}`);
    
    // 방 떠남 알림
    client.to(data.room).emit('userLeft', {
      socketId: client.id,
      room: data.room,
      timestamp: new Date().toISOString(),
    });
  }

  // 새로운 식사 기록 알림
  broadcastNewMeal(mealData: any) {
    this.server.emit('newMeal', {
      type: 'NEW_MEAL',
      data: mealData,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcasting new meal: ${mealData.name}`);
  }

  // 새로운 음식점 알림
  broadcastNewRestaurant(restaurantData: any) {
    this.server.emit('newRestaurant', {
      type: 'NEW_RESTAURANT',
      data: restaurantData,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcasting new restaurant: ${restaurantData.name}`);
  }

  // 실시간 좋아요 업데이트
  broadcastLikeUpdate(data: { mealId: string; likes: number; userId: number }) {
    this.server.emit('likeUpdate', {
      type: 'LIKE_UPDATE',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // 실시간 댓글 알림
  broadcastNewComment(data: { mealId: string; comment: any; userId: number }) {
    this.server.emit('newComment', {
      type: 'NEW_COMMENT',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // 특정 사용자에게 알림 전송
  sendNotificationToUser(userId: number, notification: any) {
    // userId로 해당 사용자의 소켓 찾기
    for (const [socketId, user] of this.connectedUsers.entries()) {
      if (user.userId === userId) {
        this.server.to(socketId).emit('notification', {
          type: 'NOTIFICATION',
          data: notification,
          timestamp: new Date().toISOString(),
        });
        break;
      }
    }
  }

  // 연결된 사용자 목록 조회
  getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }
}