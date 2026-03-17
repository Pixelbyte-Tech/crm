import {
  Index,
  Entity,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TagEntity } from './tag.entity';
import { UserEntity } from './user.entity';
import { TradingAccountEntity } from './trading-account.entity';

@Entity({ name: 'trading_account_tag' })
@Unique(['tagId', 'tradingAccountId'])
export class TradingAccountTagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Many-to-one relations */
  @ManyToOne(() => TagEntity, (e) => e.tradingAccountTags, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tagId' })
  tag: TagEntity;

  @Index()
  @Column({ type: 'text' })
  tagId: string;

  @ManyToOne(() => TradingAccountEntity, (e) => e.tradingAccountTags, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tradingAccountId' })
  tradingAccount: TradingAccountEntity;

  @Index()
  @Column({ type: 'text' })
  tradingAccountId: string;

  @ManyToOne(() => UserEntity, (e) => e.tradingAccountTags, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'taggedByUserId' })
  taggedByUser?: UserEntity | null;

  @Index()
  @Column({ type: 'text', nullable: true })
  taggedByUserId?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
