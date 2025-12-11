import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm'
import { User } from './user.entity'
import { LocationGroup } from './location-group.entity'
import { MealRecord } from './meal-record.entity'

@Entity('user_locations')
@Index(['userId', 'locationGroupId'])
export class UserLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  @Index()
  userId: string

  @Column({ type: 'uuid' })
  @Index()
  locationGroupId: string

  @Column({ type: 'varchar', length: 255 })
  name: string // 사용자가 부르는 이름 (개인화된 이름)

  @Column({ type: 'varchar', nullable: true })
  address: string

  @Column('decimal', {
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  latitude: number

  @Column('decimal', {
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  longitude: number

  @Column({ type: 'boolean', default: false })
  isCustom: boolean // 사용자가 직접 등록한 곳인지 (외부 API 없이)

  @Column({ type: 'varchar', nullable: true })
  notes: string // 개인 메모

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => LocationGroup, (locationGroup) => locationGroup.userLocations)
  @JoinColumn({ name: 'locationGroupId' })
  locationGroup: LocationGroup

  @OneToMany(() => MealRecord, (mealRecord) => mealRecord.userLocation)
  mealRecords: MealRecord[]
}
