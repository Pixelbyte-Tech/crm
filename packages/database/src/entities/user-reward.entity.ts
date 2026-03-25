import {
  Index,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RewardSource } from '@crm/types';

import { UserEntity } from './user.entity';
import { RewardEntity } from './reward.entity';

@Entity({ name: 'user_reward' })
export class UserRewardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'smallint', nullable: true, default: null })
  pointsPaid?: number | null;

  @Column({ type: 'enum', enum: RewardSource })
  source: RewardSource;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  awardedAt: Date;

  /** Many-to-one relations */
  @ManyToOne(() => RewardEntity, (e) => e.userRewards, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rewardId' })
  reward: RewardEntity;

  @Index()
  @Column({ type: 'uuid' })
  rewardId: string;

  @ManyToOne(() => UserEntity, (e) => e.rewards, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, (e) => e.rewards, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'awardedByUserId' })
  awardedByUser?: UserEntity | null;

  @Index()
  @Column({ type: 'uuid', nullable: true, default: null })
  awardedByUserId?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
