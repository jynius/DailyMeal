import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('meal_records')
export class MealRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  photo: string;

  // 다중 사진을 위한 JSON 배열 (기존 photo와 병행)
  @Column('simple-json', { nullable: true })
  photos: string[];

  @Column({ nullable: true })
  location: string;

  // GPS 좌표 정보
  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number;

  // 상세 주소 (GPS에서 역변환된 주소)
  @Column({ nullable: true })
  address: string;

  @Column('int', { nullable: true })
  rating: number;

  @Column({ nullable: true, length: 200 })
  memo: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  // 식사 카테고리 (집밥, 배달, 식당)
  @Column({
    type: 'varchar',
    nullable: true,
    default: 'restaurant',
  })
  category: 'home' | 'delivery' | 'restaurant';

  // 같이 식사한 사람들 (친구 ID 배열)
  @Column('simple-json', { nullable: true })
  companionIds: string[];

  // 같이 식사한 사람들 (텍스트)
  @Column({ nullable: true, length: 200 })
  companionNames: string;

  @Column('uuid')
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.mealRecords)
  @JoinColumn({ name: 'userId' })
  user: User;
}
