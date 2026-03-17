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

import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';

@Entity({ name: 'organisation' })
@Unique(['name'])
export class OrganisationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  /** One-to-many relations */
  @OneToMany(() => CompanyEntity, (e) => e.organisation)
  @JoinColumn()
  companies: CompanyEntity[];

  @OneToMany(() => UserEntity, (e) => e.organisation)
  @JoinColumn()
  users: UserEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
