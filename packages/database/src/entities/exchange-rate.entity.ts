import { Entity, Column, Unique, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'exchange_rate' })
@Unique(['from', 'to', 'date'])
export class ExchangeRateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 3 })
  from: string;

  @Column({ type: 'varchar', length: 3 })
  to: string;

  @Column({ type: 'decimal' })
  rate: number;

  @Column({ type: 'date' })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
