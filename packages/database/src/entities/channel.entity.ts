import {
  Index,
  Entity,
  Column,
  Unique,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Channel } from '@crm/types';

import { AlertEntity } from './alert.entity';
import { CompanyEntity } from './company.entity';

@Entity({ name: 'channel' })
@Unique(['companyId', 'type'])
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

  /** Many-to-many relations */
  @ManyToOne(() => CompanyEntity, (e) => e.channels, {
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
