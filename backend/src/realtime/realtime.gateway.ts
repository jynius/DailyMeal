/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'

export interface ConnectedUser {
  id: string
  socketId: string
  userId?: number
  username?: string
}

@WebSocketGateway({
  path: '/api/socket.io', // ✅ 프론트엔드와 동일한 경로 사용
  cors: {
    origin: '*', // 개발 환경에서는 모든 origin 허용
    methods: ['GET', 'POST'],
    credentials: false, // credentials 비활성화
  },
})
export class RealTimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server
  private logger: Logger = new Logger('RealTimeGateway')
  private connectedUsers: Map<string, ConnectedUser> = new Map()

  afterInit() {
    this.logger.log('WebSocket Gateway initialized')
    this.logger.log('Socket.IO server is ready on port 8000')
    this.logger.log('🔌 Socket.IO Gateway initialized successfully')
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
    this.logger.log(`🔗 Client connected: ${client.id} from ${client.handshake.address}`)

    const user: ConnectedUser = {
      id: client.id,
      socketId: client.id,
    }

    this.connectedUsers.set(client.id, user)

    // 연결된 사용자 수 브로드캐스트
    this.server.emit('userCount', this.connectedUsers.size)
    this.logger.log(`👥 Connected users: ${this.connectedUsers.size}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
    this.connectedUsers.delete(client.id)

    // 연결된 사용자 수 브로드캐스트
    this.server.emit('userCount', this.connectedUsers.size)
  }

  @SubscribeMessage('userAuth')
  handleUserAuth(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number; username: string }
  ) {
    const user = this.connectedUsers.get(client.id)
    if (user) {
      user.userId = data.userId
      user.username = data.username
      this.connectedUsers.set(client.id, user)

      this.logger.log(`User authenticated: ${data.username} (${data.userId})`)

      // 사용자에게 인증 완료 응답
      client.emit('authSuccess', {
        userId: data.userId,
        username: data.username,
      })
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    void client.join(data.room)
    this.logger.log(`Client ${client.id} joined room: ${data.room}`)

    // 방에 참여 알림
    client.to(data.room).emit('userJoined', {
      socketId: client.id,
      room: data.room,
      timestamp: new Date().toISOString(),
    })
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    void client.leave(data.room)
    this.logger.log(`Client ${client.id} left room: ${data.room}`)

    // 방 떠남 알림
    client.to(data.room).emit('userLeft', {
      socketId: client.id,
      room: data.room,
      timestamp: new Date().toISOString(),
    })
  }

  // 새로운 식사 기록 알림 (친구에게만 전송)
  broadcastNewMeal(mealData: any, friendUserIds?: number[]) {
    // 친구 목록이 있으면 친구에게만, 없으면 전체 브로드캐스트 (기존 동작 유지)
    if (friendUserIds && friendUserIds.length > 0) {
      friendUserIds.forEach((userId) => {
        this.sendNotificationToUser(userId, {
          type: 'NEW_MEAL',
          data: mealData,
        })
      })
      this.logger.log(`Broadcasting new meal to ${friendUserIds.length} friends: ${mealData.name}`)
    } else {
      this.server.emit('newMeal', {
        type: 'NEW_MEAL',
        data: mealData,
        timestamp: new Date().toISOString(),
      })
      this.logger.log(`Broadcasting new meal: ${mealData.name}`)
    }
  }

  // 새로운 음식점 알림 (전체 브로드캐스트 유지 - 공용 정보)
  broadcastNewRestaurant(restaurantData: any) {
    this.server.emit('newRestaurant', {
      type: 'NEW_RESTAURANT',
      data: restaurantData,
      timestamp: new Date().toISOString(),
    })
    this.logger.log(`Broadcasting new restaurant: ${restaurantData.name}`)
  }

  // 좋아요 쓰로틀링 추가 (마지막 좋아요 시간 기록)
  private lastLikeBroadcast = new Map<string, number>()
  private readonly LIKE_THROTTLE_MS = 2000 // 2초

  broadcastLikeUpdate(data: { mealId: string; likes: number; userId: number }) {
    const now = Date.now()
    const lastTime = this.lastLikeBroadcast.get(data.mealId) || 0

    // 2초 이내 중복 브로드캐스트 방지
    if (now - lastTime < this.LIKE_THROTTLE_MS) {
      this.logger.debug(`Throttling like update for meal ${data.mealId}`)
      return
    }

    this.lastLikeBroadcast.set(data.mealId, now)
    this.server.emit('likeUpdate', {
      type: 'LIKE_UPDATE',
      data,
      timestamp: new Date().toISOString(),
    })
  }

  // 실시간 댓글 알림 (게시물 작성자에게만 전송)
  broadcastNewComment(data: { mealId: string; comment: any; userId: number; authorId?: number }) {
    if (data.authorId) {
      // 작성자에게만 알림
      this.sendNotificationToUser(data.authorId, {
        type: 'NEW_COMMENT',
        mealId: data.mealId,
        comment: data.comment,
      })
      this.logger.log(`Sending comment notification to author ${data.authorId}`)
    } else {
      // authorId 없으면 전체 브로드캐스트 (fallback)
      this.server.emit('newComment', {
        type: 'NEW_COMMENT',
        data,
        timestamp: new Date().toISOString(),
      })
    }
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
        })
        break
      }
    }
  }

  // 연결된 사용자 목록 조회
  getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values())
  }
}
