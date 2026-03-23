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

@Entity({ name: 'user_note' })
export class UserNoteEntity {
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
  @ManyToOne(() => UserEntity, (e) => e.userAuthoredNotes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @Index()
  @Column({ type: 'text' })
  authorId: string;

  @ManyToOne(() => UserEntity, (e) => e.userNotes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'text' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
