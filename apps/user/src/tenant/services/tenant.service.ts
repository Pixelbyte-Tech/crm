import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import {
  Logger,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Tenant } from '@crm/types';
import { Cryptography } from '@crm/utils';
import { TenantStatus } from '@crm/types';
import { PaginatedResDto } from '@crm/http';
import { TenantEntity } from '@crm/database';

import { TenantMapper } from '../mappers';
import { AuthService } from '../../auth/services';
import { NewTenantDto, ListTenantsDto, UpdateTenantDto, CreateTenantDto } from '../dto';

@Injectable()
export class TenantService {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantMapper: TenantMapper,
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a tenant by their ID.
   * @param tenantId The id of the tenant to fetch
   */
  async get(tenantId: string): Promise<Tenant> {
    const msg = `Fetching tenant '${tenantId}'`;

    // Find the entity
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find tenant '${tenantId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.tenantMapper.toTenant(tenant);
  }

  /**
   * Lists all tenants
   * @param dto The list dto
   */
  async list(dto: ListTenantsDto): Promise<PaginatedResDto<Tenant>> {
    // Find the resources paginated
    const traders = await paginate(
      this.tenantRepo,
      { limit: dto.limit, page: dto.page },
      { order: { createdAt: dto.sortDir }, where: { ...(dto.status ? { status: In(dto.status) } : {}) } },
    );

    return {
      data: traders.items.map(this.tenantMapper.toTenant),
      page: traders.meta.currentPage,
      limit: traders.meta.itemsPerPage,
      total: traders.meta.totalItems,
    };
  }

  /**
   * Creates a new tenant in the system.
   * @param dto The dto with the creation data
   */
  async create(dto: CreateTenantDto): Promise<NewTenantDto> {
    const msg = `Attempting to create tenant from email '${dto.email}'`;

    // Create the new tenant
    const tenant = await this.tenantRepo.save({
      email: dto.email,
      password: Cryptography.hash(dto.password),
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      status: TenantStatus.ACTIVE,
    });

    if (!tenant) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create tenant from email '${dto.email}'`);
    }

    try {
      // Generate a confirmation token and send the email
      const token = await this.authService.generateEmailConfirmationToken(tenant.id);

      // todo send email confirm email

      // todo assign to companies

      this.#logger.log(`${msg} - Complete`);
      return { tenant: this.tenantMapper.toTenant(tenant), tokens: { confirmEmail: token } };
    } catch (err) {
      await this.delete(tenant.id);
      this.#logger.error(`${msg} - Failed to send confirmation email`, err);
      throw new InternalServerErrorException(`Failed to send confirmation email to '${dto.email}'`);
    }
  }

  /**
   * Updates a tenant by their ID.
   * @param tenantId The id of the tenant to fetch
   * @param dto The update dto
   */
  async update(tenantId: string, dto: UpdateTenantDto): Promise<Tenant> {
    const msg = `Updating tenant '${tenantId}'`;

    // Find the tenant prior to the update
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Unable to find tenant '${tenantId}'`);
    }

    // Perform the update
    const result = await this.tenantRepo.update(tenantId, {
      ...(dto.email ? { email: dto.email } : {}),
      ...(dto.password ? { password: Cryptography.hash(dto.password) } : {}),
      ...(dto.firstName ? { firstName: dto.firstName } : {}),
      ...(dto.middleName ? { middleName: dto.middleName } : {}),
      ...(dto.lastName ? { lastName: dto.lastName } : {}),
      ...(dto.status ? { status: dto.status } : {}),
    });

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update tenant '${tenantId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.get(tenantId);
  }

  /**
   * Deletes a tenant by their ID.
   * @param tenantId The id of the tenant to delete
   */
  async delete(tenantId: string): Promise<void> {
    const msg = `Deleting tenant '${tenantId}'`;

    // Find the tenant by ID
    const result = await this.tenantRepo.delete({ id: tenantId });
    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to delete tenant '${tenantId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
  }
}
