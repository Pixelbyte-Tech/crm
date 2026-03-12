import {
  Index,
  Entity,
  Column,
  Unique,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LoyaltyProgram } from '@crm/types';

import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';
import { LoyaltyHistoryEntity } from './loyalty-history.entity';

@Entity({ name: 'loyalty' })
@Unique(['userId'])
export class LoyaltyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  spins: number;

  @Column({ type: 'enum', enum: LoyaltyProgram, default: LoyaltyProgram.STANDARD })
  program: LoyaltyProgram;

  /** One-to-one relations */
  @OneToOne(() => UserEntity, (e) => e.loyalty, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'text' })
  userId: string;

  /** One-to-many relations */
  @OneToMany(() => LoyaltyHistoryEntity, (e) => e.loyalty)
  @JoinColumn()
  history: LoyaltyHistoryEntity[];

  /** Many-to-one relations */
  @ManyToOne(() => CompanyEntity, (e) => e.loyalty, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Index()
  @Column({ type: 'text' })
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
