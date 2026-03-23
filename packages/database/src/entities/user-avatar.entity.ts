import { Entity, Column, OneToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from './user.entity';

@Entity({ name: 'user_avatar' })
export class UserAvatarEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  originalFilename: string;

  @Column({ type: 'text', nullable: true })
  contentType?: string | null;

  @Column({ type: 'text', nullable: true })
  fileExtension?: string | null;

  @Column({ type: 'text' })
  storageBucket: string;

  @Column({ type: 'text' })
  storageKey: string;

  @Column({ type: 'timestamp' })
  uploadedAt: Date;

  /** One-to-one relations */
  @OneToOne(() => UserEntity, (e) => e.avatar)
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
