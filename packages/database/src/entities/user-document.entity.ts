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

import { DocumentType, DocumentStatus } from '@crm/types';

import { UserEntity } from './user.entity';

@Entity({ name: 'user_document' })
export class UserDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Index()
  @Column({ type: 'enum', enum: DocumentStatus })
  status: DocumentStatus;

  @Column({ type: 'text' })
  originalFilename: string;

  @Column({ type: 'text', nullable: true })
  contentType?: string | null;

  @Column({ type: 'text', nullable: true })
  fileExtension?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'text' })
  storageBucket: string;

  @Column({ type: 'text' })
  storageKey: string;

  @Column({ type: 'timestamp' })
  uploadedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  actionedAt?: Date | null;

  /** Many-to-one relations */
  @ManyToOne(() => UserEntity, (e) => e.documents, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
