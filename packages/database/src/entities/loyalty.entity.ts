import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LoyaltyProgram } from '@crm/types';

import { UserEntity } from './user.entity';
import { LoyaltyHistoryEntity } from './loyalty-history.entity';

@Entity({ name: 'loyalty' })
export class LoyaltyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'smallint', default: 0 })
  spins: number;

  @Column({ type: 'enum', enum: LoyaltyProgram, default: LoyaltyProgram.STANDARD })
  program: LoyaltyProgram;

  /** One-to-one relations */
  @OneToOne(() => UserEntity, (e) => e.loyalty)
  user: UserEntity;

  /** One-to-many relations */
  @OneToMany(() => LoyaltyHistoryEntity, (e) => e.loyalty)
  @JoinColumn()
  history: LoyaltyHistoryEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
