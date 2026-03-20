import {
  Index,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';

@Entity({ name: 'user_in_app_notification' })
export class UserInAppNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  openedAt?: Date | null;

  /** Many-to-one relations */
  @ManyToOne(() => CompanyEntity, (e) => e.userInAppNotifications, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Index()
  @Column({ type: 'text' })
  companyId: string;

  @ManyToOne(() => UserEntity, (e) => e.inAppNotifications, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'text' })
  userId: string;

  @PrimaryColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
