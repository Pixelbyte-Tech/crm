import {
  Index,
  Entity,
  Column,
  Unique,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Channel } from '@crm/types';

import { AlertEntity } from './alert.entity';

@Entity({ name: 'channel' })
@Unique(['type'])
export class ChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Channel })
  type: Channel;

  @Index()
  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'jsonb' })
  settings: Record<string, any>;

  /** One-to-many relations */
  @OneToMany(() => AlertEntity, (e) => e.channel)
  @JoinColumn()
  alerts: AlertEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
