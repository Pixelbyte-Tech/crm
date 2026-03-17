import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Param, Query, Controller } from '@nestjs/common';

import { Auth } from '@crm/auth';
import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { TenantIdValidator } from '@crm/validation';

import { TenantSession } from './domain';
import { ListTenantSessionsDto } from './dto';
import { TenantSessionService } from './services';

@ApiTags('Session')
@ApiExtraModels(ListTenantSessionsDto)
@Controller({ path: 'tenants', version: '1' })
export class TenantSessionController {
  constructor(private readonly service: TenantSessionService) {}

  /**
   * Gets the latest session for a tenant by id
   * @param tenantId The tenant id to fetch
   */
  @Auth()
  @OpenApi({ type: TenantSession })
  @Get(':tenantId/sessions/latest')
  public async get(@Param('tenantId', TenantIdValidator) tenantId: string): Promise<{ data: TenantSession }> {
    const result = await this.service.latest(tenantId);
    return { data: result };
  }

  /**
   * Lists all sessions for a tenant by ID
   * @param tenantId The tenant id to fetch
   * @param dto The dto
   */
  @Auth()
  @OpenApi({ type: TenantSession, isPaginated: true })
  @Get(':tenantId/sessions')
  public async list(
    @Param('tenantId', TenantIdValidator) tenantId: string,
    @Query() dto: ListTenantSessionsDto,
  ): Promise<PaginatedResDto<TenantSession>> {
    return await this.service.list(tenantId, dto);
  }
}
