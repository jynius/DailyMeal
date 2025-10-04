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

  @Column({ nullable: true })
  location: string;

  @Column('int')
  rating: number;

  @Column({ nullable: true, length: 200 })
  memo: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

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