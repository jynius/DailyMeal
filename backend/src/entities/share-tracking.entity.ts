import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { MealShare } from './meal-share.entity';
import { User } from './user.entity';

@Entity('share_tracking')
@Index(['sessionId'])
@Index(['recipientId'])
export class ShareTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  shareId: string;

  @ManyToOne(() => MealShare, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shareId' })
  share: MealShare;

  @Column({ type: 'uuid' })
  sharerId: string; // 공유한 사람 (A)

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sharerId' })
  sharer: User;

  @Column({ type: 'uuid', nullable: true })
  recipientId: string; // 공유받은 사람 (B) - 로그인/가입 후 채워짐

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column({ type: 'varchar', length: 255 })
  sessionId: string; // 비로그인 시 브라우저 식별용

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string; // IP 주소 (악용 방지)

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string; // User Agent

  @CreateDateColumn()
  viewedAt: Date; // 조회 시간

  @Column({ type: 'timestamp', nullable: true })
  convertedAt: Date; // 로그인/가입한 시점

  @Column({ type: 'boolean', default: false })
  friendRequestSent: boolean; // 친구 요청 생성 여부

  @CreateDateColumn()
  createdAt: Date;
}
