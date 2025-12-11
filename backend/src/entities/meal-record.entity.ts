import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './user.entity'

@Entity('meal_records')
export class MealRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ type: 'varchar', nullable: true })
  photo: string | null

  // 다중 사진을 위한 JSON 배열 (기존 photo와 병행)
  @Column('simple-json', { nullable: true })
  photos: string[] | null

  @Column({ type: 'varchar', nullable: true })
  location: string | null

  // GPS 좌표 정보
  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number | null

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number | null

  // 상세 주소 (GPS에서 역변환된 주소)
  @Column({ type: 'varchar', nullable: true })
  address: string | null

  @Column('int', { nullable: true })
  rating: number | null

  @Column({ type: 'varchar', length: 200, nullable: true })
  memo: string | null

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => value ? parseFloat(value) : null,
    },
  })
  price: number | null

  // 식사 카테고리 (집밥, 배달, 식당)
  @Column({
    type: 'varchar',
    nullable: true,
    default: 'restaurant',
  })
  category: 'home' | 'delivery' | 'restaurant' | null

  // 같이 식사한 사람들 (친구 ID 배열)
  @Column('simple-json', { nullable: true })
  companionIds: string[] | null

  // 같이 식사한 사람들 (텍스트)
  @Column({ type: 'varchar', length: 200, nullable: true })
  companionNames: string | null

  @Column({ type: 'timestamp', nullable: true })
  photoTakenAt: Date | null

  @Column('uuid')
  userId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.mealRecords)
  @JoinColumn({ name: 'userId' })
  user: User
}
