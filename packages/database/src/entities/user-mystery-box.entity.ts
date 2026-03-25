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

import { UserEntity } from './user.entity';
import { RewardEntity } from './reward.entity';
import { MysteryBoxEntity } from './mystery-box.entity';

@Entity({ name: 'user_mystery_box' })
export class UserMysteryBoxEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'smallint' })
  pointsPaid: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  awardedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  openedAt?: Date | null;

  /** Many-to-one relations */
  @ManyToOne(() => RewardEntity, (e) => e.userMysteryBoxes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rewardId' })
  reward: RewardEntity;

  @Index()
  @Column({ type: 'uuid' })
  rewardId: string;

  @ManyToOne(() => MysteryBoxEntity, (e) => e.userMysteryBoxes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mysteryBoxId' })
  mysteryBox: MysteryBoxEntity;

  @Index()
  @Column({ type: 'uuid' })
  mysteryBoxId: string;

  @ManyToOne(() => UserEntity, (e) => e.mysteryBoxes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
