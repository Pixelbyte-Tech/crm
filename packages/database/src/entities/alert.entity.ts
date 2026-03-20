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

import { AlertType, AlertLevel, AlertStatus } from '@crm/types';

import { CompanyEntity } from './company.entity';
import { ChannelEntity } from './channel.entity';

@Entity({ name: 'alert' })
export class AlertEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Index()
  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.PENDING })
  status: AlertStatus;

  @Index()
  @Column({ type: 'enum', enum: AlertLevel })
  level: AlertLevel;

  @Index()
  @Column({ type: 'enum', enum: AlertType })
  type: AlertType;

  @Column({ type: 'int', default: 0 })
  deliveryAttempts: number;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  /** Many-to-many relations */
  @ManyToOne(() => ChannelEntity, (e) => e.alerts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channelId' })
  channel: ChannelEntity;

  @Index()
  @Column({ type: 'text' })
  channelId: string;

  @ManyToOne(() => CompanyEntity, (e) => e.alerts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Index()
  @Column({ type: 'text' })
  companyId: string;

  @PrimaryColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
