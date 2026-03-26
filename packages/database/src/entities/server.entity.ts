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

import { Platform, Monetisation } from '@crm/types';

import { IntegrationEntity } from './integration.entity';
import { TradingAccountEntity } from './trading-account.entity';
import { TradingAccountSchemaEntity } from './trading-account-schema.entity';

@Entity({ name: 'server' })
@Unique(['name'])
export class ServerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Index()
  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Index()
  @Column({ type: 'enum', enum: Monetisation })
  monetisation: Monetisation;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'jsonb' })
  settings: Record<string, any>;

  /** The server timezone */
  @Column({ type: 'text', default: 'utc' })
  timezone: string;

  /** Any offset hours from the timezone of the server */
  @Column({ type: 'smallint', default: 0 })
  offsetHours: number;

  /** Many-to-one relations */
  @ManyToOne(() => IntegrationEntity, (e) => e.servers, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'integrationId' })
  integration: IntegrationEntity;

  @Index()
  @Column({ type: 'uuid' })
  integrationId: string;

  /** One-to-many relations */
  @OneToMany(() => TradingAccountEntity, (e) => e.server)
  @JoinColumn()
  tradingAccounts: TradingAccountEntity[];

  @OneToMany(() => TradingAccountSchemaEntity, (e) => e.server)
  @JoinColumn()
  tradingAccountSchemas: TradingAccountSchemaEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
