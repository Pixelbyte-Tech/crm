import {
  Index,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';
import { TradingAccountEntity } from './trading-account.entity';

@Entity({ name: 'trading_account_note' })
export class TradingAccountNoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  summary?: string | null;

  @Column({ type: 'text' })
  body: string;

  @Index()
  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  /** Many-to-one relations */
  @ManyToOne(() => UserEntity, (e) => e.tradingAccountAuthoredNotes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @Index()
  @Column({ type: 'text' })
  authorId: string;

  @ManyToOne(() => TradingAccountEntity, (e) => e.notes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tradingAccountId' })
  tradingAccount: TradingAccountEntity;

  @Index()
  @Column({ type: 'text' })
  tradingAccountId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
