import {
  Entity,
  Column,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserMysteryBoxEntity } from './user-mystery-box.entity';

@Entity({ name: 'mystery_box' })
export class MysteryBoxEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'smallint' })
  pointsCost: number;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'jsonb' })
  rewards: Record<string, { rewardId: string; probability: number }>[];

  /** One-to-many relations */
  @OneToMany(() => UserMysteryBoxEntity, (e) => e.mysteryBox)
  @JoinColumn()
  userMysteryBoxes: UserMysteryBoxEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
