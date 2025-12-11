import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { UserLocation } from './user-location.entity'
import { ExternalPlaceMapping } from './external-place-mapping.entity'

@Entity('location_groups')
export class LocationGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  canonicalName: string // 대표 이름 (가장 많이 사용된 이름 또는 공식 이름)

  @Column('decimal', {
    precision: 10,
    scale: 7,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  latitude: number

  @Column('decimal', {
    precision: 10,
    scale: 7,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  longitude: number

  @Column({ type: 'varchar', nullable: true })
  address: string

  @Column({ type: 'varchar', nullable: true })
  category: string // 음식 카테고리

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @OneToMany(() => UserLocation, (userLocation) => userLocation.locationGroup)
  userLocations: UserLocation[]

  @OneToMany(() => ExternalPlaceMapping, (mapping) => mapping.locationGroup)
  externalMappings: ExternalPlaceMapping[]
}
