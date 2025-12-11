import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('kakao_places')
export class KakaoPlace {
  @PrimaryColumn('varchar')
  placeId: string // 카카오 place ID

  @Column()
  placeName: string

  @Column({ type: 'varchar', nullable: true })
  categoryName: string | null

  @Column({ type: 'varchar', nullable: true })
  addressName: string | null

  @Column({ type: 'varchar', nullable: true })
  roadAddressName: string | null

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
  phone: string | null

  @Column({ type: 'varchar', nullable: true })
  placeUrl: string | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
