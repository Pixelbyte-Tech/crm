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

import { Role, InvitationStatus } from '@crm/types';

import { UserEntity } from './user.entity';

@Entity({ name: 'invitation' })
@Unique(['email', 'status'])
export class InvitationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'enum', enum: InvitationStatus })
  status: InvitationStatus;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'enum', enum: Role, array: true })
  roles: Role[];

  @Column({ type: 'timestamp', nullable: true })
  firstSentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastSentAt?: Date | null;

  @Column({ type: 'integer', default: 30 })
  expiresInDays: number;

  @ManyToOne(() => UserEntity, (e) => e.sentInvitations, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sentByUserId' })
  sentByUser: UserEntity;

  @Index()
  @Column({ type: 'uuid' })
  sentByUserId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
