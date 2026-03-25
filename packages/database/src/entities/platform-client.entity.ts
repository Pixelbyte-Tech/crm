import { Entity, Column, Unique, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

import { Platform, PlatformClientType } from '@crm/types';

@Entity({ name: 'platform_client' })
@Unique(['platform', 'type'])
export class PlatformClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({ type: 'enum', enum: PlatformClientType })
  type: PlatformClientType;

  @Column({ type: 'text' })
  link: string;

  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
