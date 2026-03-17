import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Body, Post, Param, Patch, Query, Delete, Controller } from '@nestjs/common';

import { Auth } from '@crm/auth';
import { Tenant } from '@crm/types';
import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { TenantIdValidator } from '@crm/validation';

import { TenantService } from './services';
import { NewTenantDto, ListTenantsDto, UpdateTenantDto, CreateTenantDto } from './dto';

@ApiTags('Tenant')
@ApiExtraModels(NewTenantDto, CreateTenantDto, ListTenantsDto, UpdateTenantDto)
@Controller({ path: 'tenants', version: '1' })
export class TenantController {
  constructor(private readonly service: TenantService) {}

  /**
   * Get a tenant by id
   * @param tenantId The tenant id to fetch
   */
  @Auth()
  @OpenApi({ type: Tenant })
  @Get(':tenantId')
  public async get(@Param('tenantId', TenantIdValidator) tenantId: string): Promise<{ data: Tenant }> {
    const result = await this.service.get(tenantId);
    return { data: result };
  }

  /**
   * Updates a tenant by id
   * @param tenantId The tenant id to update
   * @param dto The dto
   */
  @Auth()
  @OpenApi({ type: Tenant })
  @Patch(':tenantId')
  public async update(
    @Param('tenantId', TenantIdValidator) tenantId: string,
    @Body() dto: UpdateTenantDto,
  ): Promise<{ data: Tenant }> {
    // Only allow admins to update the status of any tenant
    // todo do not allow tenants to update their own status

    return { data: await this.service.update(tenantId, dto) };
  }

  /**
   * Lists all tenants in the system
   * @param dto The dto with options to filter the results by.
   */
  @Auth()
  @OpenApi({ type: Tenant, isPaginated: true })
  @Get()
  public async list(@Query() dto: ListTenantsDto): Promise<PaginatedResDto<Tenant>> {
    return await this.service.list(dto);
  }

  /**
   * Create a new tenant
   * @param dto The dto
   */
  @OpenApi({ type: NewTenantDto })
  @Post()
  public async create(@Body() dto: CreateTenantDto): Promise<{ data: NewTenantDto }> {
    return { data: await this.service.create(dto) };
  }

  /**
   * Deletes a tenant by id
   * @param tenantId The tenant id to delete
   */
  @Auth()
  @OpenApi()
  @Delete(':tenantId')
  public async delete(@Param('tenantId', TenantIdValidator) tenantId: string): Promise<void> {
    await this.service.delete(tenantId);
  }
}
