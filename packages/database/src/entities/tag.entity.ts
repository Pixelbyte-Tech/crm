import {
  Entity,
  Column,
  Unique,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TradingAccountTagEntity } from './trading-account-tag.entity';

@Entity({ name: 'tag' })
@Unique(['name'])
export class TagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  /** One-to-many relations */
  @OneToMany(() => TradingAccountTagEntity, (e) => e.tag)
  @JoinColumn()
  tradingAccountTags: TradingAccountTagEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
