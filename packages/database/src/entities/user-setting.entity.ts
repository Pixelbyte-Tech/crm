import { Index, Entity, Column, OneToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from './user.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
