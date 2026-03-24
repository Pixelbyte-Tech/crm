import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { AuditActor } from '@crm/types';
import { EventMetadata } from '@crm/kafka';
import { AuditLogEntity } from '@crm/database';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) {}

  /**
   * Persists an audit log record
   * @param entity The record to persist
   * @param meta The event metadata
   */
  async persist(entity: QueryDeepPartialEntity<AuditLogEntity>, meta?: EventMetadata): Promise<void> {
    // Populate the metadata
    entity.actor = AuditActor.SYSTEM === meta?.actor ? AuditActor.SYSTEM : AuditActor.USER;
    entity.ipAddress = AuditActor.SYSTEM === meta?.actor ? '0.0.0.0' : (meta?.actor?.ipAddress ?? '0.0.0.0');
    entity.userAgent = AuditActor.SYSTEM === meta?.actor ? undefined : meta?.actor?.userAgent;
    entity.requestId = AuditActor.SYSTEM === meta?.actor ? undefined : meta?.actor?.traceId;
    entity.userId = AuditActor.SYSTEM === meta?.actor ? undefined : meta?.actor?.userId;

    // Persist the record
    // Use eventId for idempotency
    await this.repo.upsert(entity, { conflictPaths: ['eventId'] });
  }
}
