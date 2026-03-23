import {
  Index,
  Entity,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LoyaltyPointsSource } from '@crm/types';

import { UserEntity } from './user.entity';
import { LoyaltyEntity } from './loyalty.entity';

@Entity({ name: 'loyalty_history' })
@Unique(['userId', 'points', 'createdAt'])
export class LoyaltyHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'enum', enum: LoyaltyPointsSource })
  source: LoyaltyPointsSource;

  @Column({ type: 'text' })
  reason: string;

  /** Many-to-one relations */
  @ManyToOne(() => LoyaltyEntity, (e) => e.history, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'loyaltyId' })
  loyalty: LoyaltyEntity;

  @Index()
  @Column({ type: 'text' })
  loyaltyId: string;

  @ManyToOne(() => UserEntity, (e) => e.loyaltyHistory, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'text' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
