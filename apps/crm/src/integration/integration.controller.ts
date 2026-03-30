import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Req, Post, Body, Param, Query, Patch, Delete, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { Integration } from '@crm/types';
import { PaginatedResDto } from '@crm/http';
import { IntegrationIdValidator } from '@crm/validation';
import { Auth, Action, AuthenticatedReq, IntegrationSubject } from '@crm/auth';

import { IntegrationService } from './services';
import { ListIntegrationsDto, UpdateIntegrationDto, CreateIntegrationDto } from './dto';

@ApiTags('Integration')
@ApiExtraModels(Integration, CreateIntegrationDto, ListIntegrationsDto, UpdateIntegrationDto)
@Controller({ path: 'integrations', version: '1' })
export class IntegrationController {
  constructor(private readonly service: IntegrationService) {}

  /**
   * Fetch a single integration by id
   * @param integrationId The integration id to fetch
   */
  @Auth(Action.READ, IntegrationSubject)
  @OpenApi({ type: Integration })
  @Get(':integrationId')
  public async get(
    @Param('integrationId', IntegrationIdValidator) integrationId: string,
  ): Promise<{ data: Integration }> {
    return { data: await this.service.get(integrationId) };
  }

  /**
   * Lists integrations based on filter criteria.
   * @param dto The payload dto
   */
  @Auth(Action.READ, IntegrationSubject)
  @OpenApi({ type: Integration, isPaginated: true })
  @Get()
  public async list(@Query() dto: ListIntegrationsDto): Promise<PaginatedResDto<Integration>> {
    return await this.service.list(dto);
  }

  /**
   * Create a new integration
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.CREATE, IntegrationSubject)
  @OpenApi({ type: Integration })
  @Post()
  public async create(@Body() dto: CreateIntegrationDto, @Req() req: AuthenticatedReq): Promise<{ data: Integration }> {
    return { data: await this.service.create(dto, req) };
  }

  /**
   * Updates an existing integration
   * @param integrationId The integration id to update
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.UPDATE, IntegrationSubject)
  @OpenApi({ type: Integration })
  @Patch(':integrationId')
  public async update(
    @Param('integrationId', IntegrationIdValidator) integrationId: string,
    @Body() dto: UpdateIntegrationDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: Integration }> {
    return { data: await this.service.update(integrationId, dto, req) };
  }

  /**
   * Deletes an existing integration
   * @param integrationId The integration to delete
   * @param req The authenticated request
   */
  @Auth(Action.DELETE, IntegrationSubject)
  @OpenApi()
  @Delete(':integrationId')
  public async delete(
    @Param('integrationId', IntegrationIdValidator) integrationId: string,
    @Req() req: AuthenticatedReq,
  ): Promise<void> {
    await this.service.delete(integrationId, req);
  }
}
