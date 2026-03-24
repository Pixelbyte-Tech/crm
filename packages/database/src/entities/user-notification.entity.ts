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

import { NotificationStatus, NotificationTemplate } from '@crm/types';

import { UserEntity } from './user.entity';

@Entity({ name: 'user_notification' })
export class UserNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'enum', enum: NotificationTemplate })
  template: NotificationTemplate;

  @Index()
  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ type: 'json', nullable: true })
  meta?: Record<string, unknown> | null;

  @Column({ type: 'int', default: 0 })
  deliveryAttempts: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  /** Many-to-many relations */
  @ManyToOne(() => UserEntity, (e) => e.notifications, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @PrimaryColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
