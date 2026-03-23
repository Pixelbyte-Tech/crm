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
import { AuthSessionStatus } from '@crm/types';
import { UserAuthSessionEntity } from '@crm/database';

import { UserSession } from '../domain';
import { UserSessionMapper } from '../mappers';
import { ListUserSessionsDto, CreateUserSessionDto, UpdateUserSessionDto } from '../dto';

@Injectable()
export class UserSessionService {
  constructor(
    private readonly userSessionMapper: UserSessionMapper,
    @InjectRepository(UserAuthSessionEntity)
    private readonly userSessionRepo: Repository<UserAuthSessionEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a user auth session by its ID.
   * @param sessionId The id of the session to fetch
   */
  async get(sessionId: string): Promise<UserSession> {
    const msg = `Fetching user session '${sessionId}'`;

    // Find the session by ID
    const session = await this.userSessionRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find user session '${sessionId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.userSessionMapper.toSession(session);
  }

  /**
   * Fetches the latest completed auth session for a user
   * @param userId The id of the user to fetch
   */
  async latest(userId: string): Promise<UserSession> {
    const msg = `Fetching latest session for user '${userId}'`;

    // Find the session
    const session = await this.userSessionRepo.findOne({
      where: { userId, status: AuthSessionStatus.COMPLETE },
      order: { createdAt: 'DESC' },
    });
    if (!session) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find latest session for user '${userId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.userSessionMapper.toSession(session);
  }

  /**
   * Fetches all auth sessions for a user
   * @param userId The id of the user to fetch
   @param dto The list dto
   */
  async list(userId: string, dto: ListUserSessionsDto): Promise<PaginatedResDto<UserSession>> {
    // Fetch paginated resources
    const sessions = await paginate(
      this.userSessionRepo,
      { limit: dto.limit, page: dto.page },
      {
        where: {
          userId,
          ...(dto.status ? { status: dto.status } : {}),
          ...(dto.ipAddress ? { ipAddress: dto.ipAddress } : {}),
          ...(dto.userAgent ? { userAgent: dto.userAgent } : {}),
        },
        order: { createdAt: dto.sortDir },
      },
    );

    return {
      data: sessions.items.map(this.userSessionMapper.toSession),
      page: sessions.meta.currentPage,
      limit: sessions.meta.itemsPerPage,
      total: sessions.meta.totalItems,
    };
  }

  /**
   * Creates a new auth session for a user
   * @param dto The session dto
   */
  async create(dto: CreateUserSessionDto): Promise<UserSession> {
    const msg = `Attempting to create auth session for user '${dto.userId}'`;

    // Create and persist the entity
    const session = await this.userSessionRepo.save({
      userId: dto.userId,
      hash: dto.hash,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
    });

    if (!session) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create session for user '${dto.userId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.userSessionMapper.toSession(session);
  }

  /**
   * Updates a user auth session by its ID.
   * @param sessionId The id of the session to update
   * @param dto The update dto
   */
  async update(sessionId: string, dto: UpdateUserSessionDto): Promise<UserSession> {
    const msg = `Updating user session '${sessionId}'`;

    // Update the session by its id
    const result = await this.userSessionRepo.update(
      { id: sessionId },
      {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.hash ? { hash: dto.hash } : {}),
        ...(dto.ipAddress ? { ipAddress: dto.ipAddress } : {}),
        ...(dto.userAgent ? { userAgent: dto.userAgent } : {}),
      },
    );

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update user session '${sessionId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.get(sessionId);
  }
}
