import {
  Index,
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';

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

  /** Many-to-one relations */
  @ManyToOne(() => CompanyEntity, (e) => e.userAvatars, {
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
