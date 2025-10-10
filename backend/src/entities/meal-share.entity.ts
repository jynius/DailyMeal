import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { MealRecord } from './meal-record.entity';
import { User } from './user.entity';

@Entity('meal_shares')
@Index(['shareId'], { unique: true })
export class MealShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  shareId: string; // 공유 고유 ID (짧고 안전한 ID)

  @Column({ type: 'uuid' })
  mealId: string;

  @ManyToOne(() => MealRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mealId' })
  meal: MealRecord;

  @Column({ type: 'uuid' })
  sharerId: string; // 공유한 사람

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sharerId' })
  sharer: User;

  @Column({ type: 'int', default: 0 })
  viewCount: number; // 조회 수

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // 만료 시간 (30일 후)

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // 활성 상태

  @CreateDateColumn()
  createdAt: Date;
}
