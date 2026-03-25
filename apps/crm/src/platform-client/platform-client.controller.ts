import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Req, Post, Param, Query, Patch, Delete, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { PlatformClientIdValidator } from '@crm/validation';
import { Auth, Action, AuthenticatedReq, PlatformClientSubject } from '@crm/auth';

import { PlatformClient } from './domain';
import { PlatformClientService } from './services';
import { ListPlatformClientsDto, UpdatePlatformClientDto, CreatePlatformClientDto } from './dto';

@ApiTags('Server')
@ApiExtraModels(CreatePlatformClientDto, ListPlatformClientsDto, UpdatePlatformClientDto)
@Controller({ path: 'platform-clients', version: '1' })
export class PlatformClientController {
  constructor(private readonly service: PlatformClientService) {}

  /**
   * Fetch a single platform client by id
   * @param clientId The platform client id to fetch
   */
  @Auth(Action.READ, PlatformClientSubject)
  @OpenApi({ type: PlatformClient })
  @Get(':clientId')
  public async list(@Param('clientId', PlatformClientIdValidator) clientId: string): Promise<{ data: PlatformClient }> {
    return { data: await this.service.get(clientId) };
  }

  /**
   * Fetches all platform clients
   * @param dto The payload dto
   */
  @Auth(Action.READ, PlatformClientSubject)
  @OpenApi({ type: PlatformClient, isPaginated: true })
  @Get()
  public async get(@Query() dto: ListPlatformClientsDto): Promise<PaginatedResDto<PlatformClient>> {
    return await this.service.list(dto);
  }

  /**
   * Create a new platform client
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.CREATE, PlatformClientSubject)
  @OpenApi({ type: PlatformClient })
  @Post()
  public async create(
    @Query() dto: CreatePlatformClientDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: PlatformClient }> {
    return { data: await this.service.create(dto, req) };
  }

  /**
   * Updates an existing platform client
   * @param clientId The platform client id to update
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.UPDATE, PlatformClientSubject)
  @OpenApi({ type: PlatformClient })
  @Patch(':clientId')
  public async update(
    @Param('clientId', PlatformClientIdValidator) clientId: string,
    @Query() dto: UpdatePlatformClientDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: PlatformClient }> {
    return { data: await this.service.update(clientId, dto, req) };
  }

  /**
   * Deletes an existing platform client
   * @param clientId The platform client to delete
   * @param req The authenticated request
   */
  @Auth(Action.DELETE, PlatformClientSubject)
  @OpenApi()
  @Delete(':clientId')
  public async delete(
    @Param('clientId', PlatformClientIdValidator) clientId: string,
    @Req() req: AuthenticatedReq,
  ): Promise<void> {
    await this.service.delete(clientId, req);
  }
}
