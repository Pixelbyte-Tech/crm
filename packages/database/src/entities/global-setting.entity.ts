import { Index, Entity, Column, Unique, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

import { GlobalSettingKey } from '@crm/types';

@Entity({ name: 'global_setting' })
@Unique(['key'])
export class GlobalSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'enum', enum: GlobalSettingKey })
  key: GlobalSettingKey;

  @Index()
  @Column({ type: 'text' })
  value: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
