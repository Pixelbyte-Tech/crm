import {
  Index,
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';

@Entity({ name: 'user_setting' })
export class UserSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'boolean', default: true })
  canDeposit: boolean;

  @Index()
  @Column({ type: 'boolean', default: true })
  canWithdraw: boolean;

  @Index()
  @Column({ type: 'boolean', default: true })
  canAutoWithdraw: boolean;

  @Column({ type: 'decimal', nullable: true })
  maxAutoWithdrawAmount?: number | null;

  /** One-to-one relations */
  @OneToOne(() => UserEntity, (e) => e.settings)
  user: UserEntity;

  /** Many-to-one relations */
  @ManyToOne(() => CompanyEntity, (e) => e.userSettings, {
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
