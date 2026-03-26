import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { In, Between, Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { AuditActor } from '@crm/types';
import { EventMetadata } from '@crm/kafka';
import { PaginatedResDto } from '@crm/http';
import { AuditLogEntity } from '@crm/database';

import { AuditLog } from '../domain';
import { ListAuditLogsDto } from '../dto';
import { AuditLogMapper } from '../mapper';

@Injectable()
export class AuditService {
  constructor(
    private readonly auditLogMapper: AuditLogMapper,
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) {}

  /**
   * Lists audit logs based on filter criteria.
   * @param dto The list dto
   */
  async list(dto: ListAuditLogsDto): Promise<PaginatedResDto<AuditLog>> {
    // Fetch paginated resources
    const entities = await paginate(
      this.repo,
      { limit: dto.limit, page: dto.page },
      {
        relations: { user: true },
        where: {
          ...(dto.from && dto.to
            ? { occurredAt: Between(dto.from, dto.to) }
            : {
                ...(dto.from ? { occurredAt: MoreThanOrEqual(dto.from) } : {}),
                ...(dto.to ? { occurredAt: LessThanOrEqual(dto.to) } : {}),
              }),
          ...(dto.action ? { action: In(dto.action) } : {}),
          ...(dto.target ? { type: In(dto.target) } : {}),
          ...(dto.result ? { type: In(dto.result) } : {}),
          ...(dto.targetId ? { targetId: dto.targetId } : {}),
          ...(dto.ipAddress ? { ipAddress: dto.ipAddress } : {}),
          ...(dto.traceId ? { traceId: dto.traceId } : {}),
          ...(dto.userId ? { userId: dto.userId } : {}),
        },
        order: { occurredAt: dto.sortDir },
      },
    );

    return {
      data: entities.items.map(this.auditLogMapper.toAuditLog),
      page: entities.meta.currentPage,
      limit: entities.meta.itemsPerPage,
      total: entities.meta.totalItems,
    };
  }

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
