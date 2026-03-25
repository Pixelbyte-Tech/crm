import {
  Entity,
  Column,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RewardType } from '@crm/types';

import { UserRewardEntity } from './user-reward.entity';
import { UserMysteryBoxEntity } from './user-mystery-box.entity';

@Entity({ name: 'reward' })
export class RewardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RewardType })
  type: RewardType;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'jsonb' })
  settings: Record<string, any>;

  /** One-to-many relations */
  @OneToMany(() => UserRewardEntity, (e) => e.reward)
  @JoinColumn()
  userRewards: UserRewardEntity[];

  @OneToMany(() => UserMysteryBoxEntity, (e) => e.reward)
  @JoinColumn()
  userMysteryBoxes: UserMysteryBoxEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
