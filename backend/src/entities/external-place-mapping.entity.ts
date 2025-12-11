import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { LocationGroup } from './location-group.entity'

export enum ExternalPlatform {
  KAKAO = 'kakao',
  NAVER = 'naver',
  GOOGLE = 'google',
}

@Entity('external_place_mappings')
@Index(['platform', 'externalId'], { unique: true })
export class ExternalPlaceMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  @Index()
  locationGroupId: string

  @Column({
    type: 'enum',
    enum: ExternalPlatform,
  })
  platform: ExternalPlatform

  @Column({ type: 'varchar', length: 255 })
  externalId: string // placeId, businessId 등

  @Column({ type: 'varchar', length: 255 })
  externalName: string // 외부 플랫폼에서의 공식 이름

  @Column({ type: 'jsonb', nullable: true })
  externalData: Record<string, any> // 전체 메타데이터 (평점, 리뷰 수, 카테고리 등)

  @Column({ type: 'boolean', default: true })
  isActive: boolean // 비활성화 여부 (폐업 등)

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @ManyToOne(() => LocationGroup, (locationGroup) => locationGroup.externalMappings)
  @JoinColumn({ name: 'locationGroupId' })
  locationGroup: LocationGroup
}
