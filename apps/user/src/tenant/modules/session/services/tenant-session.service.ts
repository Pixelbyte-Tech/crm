import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import {
  Logger,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { PaginatedResDto } from '@crm/http';
import { TenantAuthSessionEntity } from '@crm/database';

import { TenantSession } from '../domain';
import { TenantSessionMapper } from '../mappers';
import { ListTenantSessionsDto, UpdateTenantSessionDto, CreateTenantSessionDto } from '../dto';

@Injectable()
export class TenantSessionService {
  constructor(
    private readonly tenantSessionMapper: TenantSessionMapper,
    @InjectRepository(TenantAuthSessionEntity)
    private readonly tenantSessionRepo: Repository<TenantAuthSessionEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a tenant auth session by its ID.
   * @param sessionId The id of the session to fetch
   */
  async get(sessionId: string): Promise<TenantSession> {
    const msg = `Fetching tenant session '${sessionId}'`;

    // Find the session by ID
    const session = await this.tenantSessionRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find tenant session '${sessionId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.tenantSessionMapper.toSession(session);
  }

  /**
   * Fetches the latest auth session for a tenant
   * @param tenantId The id of the user to fetch
   */
  async latest(tenantId: string): Promise<TenantSession> {
    const msg = `Fetching latest session for tenant '${tenantId}'`;

    // Find the session
    const session = await this.tenantSessionRepo.findOne({ where: { tenantId }, order: { createdAt: 'DESC' } });
    if (!session) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find latest session for tenant '${tenantId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.tenantSessionMapper.toSession(session);
  }

  /**
   * Fetches all auth sessions for a tenant
   * @param tenantId The id of the tenant to fetch
   @param dto The list dto
   */
  async list(tenantId: string, dto: ListTenantSessionsDto): Promise<PaginatedResDto<TenantSession>> {
    // Fetch paginated resources
    const sessions = await paginate(
      this.tenantSessionRepo,
      { limit: dto.limit, page: dto.page },
      {
        where: {
          tenantId,
          ...(dto.ipAddress ? { ipAddress: dto.ipAddress } : {}),
          ...(dto.userAgent ? { userAgent: dto.userAgent } : {}),
        },
        order: { createdAt: dto.sortDir },
      },
    );

    return {
      data: sessions.items.map(this.tenantSessionMapper.toSession),
      page: sessions.meta.currentPage,
      limit: sessions.meta.itemsPerPage,
      total: sessions.meta.totalItems,
    };
  }

  /**
   * Creates a new auth session for a tenant
   * @param dto The session dto
   */
  async create(dto: CreateTenantSessionDto): Promise<TenantSession> {
    const msg = `Attempting to create auth session for tenant '${dto.tenantId}'`;

    // Create and persist the entity
    const session = await this.tenantSessionRepo.save({
      hash: dto.hash,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      tenantId: dto.tenantId,
    });

    if (!session) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create session for tenant '${dto.tenantId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.tenantSessionMapper.toSession(session);
  }

  /**
   * Updates a tenant auth session by its ID.
   * @param sessionId The id of the session to update
   * @param dto The update dto
   */
  async update(sessionId: string, dto: UpdateTenantSessionDto): Promise<TenantSession> {
    const msg = `Updating tenant session '${sessionId}'`;

    // Update the session by its id
    const result = await this.tenantSessionRepo.update(sessionId, {
      ...(dto.hash ? { hash: dto.hash } : {}),
      ...(dto.ipAddress ? { ipAddress: dto.ipAddress } : {}),
      ...(dto.userAgent ? { userAgent: dto.userAgent } : {}),
    });

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update tenant session '${sessionId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.get(sessionId);
  }
}
