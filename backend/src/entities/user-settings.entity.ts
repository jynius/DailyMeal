import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './user.entity'

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', nullable: false })
  userId: string

  // 알림 설정
  @Column({ type: 'boolean', default: true })
  notificationFriendRequest: boolean

  @Column({ type: 'boolean', default: true })
  notificationNewReview: boolean

  @Column({ type: 'boolean', default: false })
  notificationNearbyFriend: boolean

  // 프라이버시 설정
  @Column({ type: 'boolean', default: false })
  privacyProfilePublic: boolean

  @Column({ type: 'boolean', default: true })
  privacyShowLocation: boolean

  @Column({ type: 'boolean', default: true })
  privacyShowMealDetails: boolean

  // 장소 설정
  @Column({ type: 'text', nullable: true })
  locationHome: string

  @Column({ type: 'text', nullable: true })
  locationOffice: string

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  locationHomeLatitude: number

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  locationHomeLongitude: number

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  locationOfficeLatitude: number

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  locationOfficeLongitude: number

  // AI 추천 설정
  @Column({ type: 'varchar', default: 'social' })
  aiRecommendationType: 'social' | 'popular' | 'collaborative'

  @Column({ type: 'int', default: 5000 })
  aiRecommendationMaxDistance: number

  @Column({ type: 'int', nullable: true })
  aiRecommendationMaxPrice: number

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 4.0 })
  aiRecommendationMinRating: number

  @Column({ type: 'boolean', default: true })
  aiRecommendationExcludeVisited: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @OneToOne('User', 'settings')
  @JoinColumn({ name: 'userId' })
  user: User
}
