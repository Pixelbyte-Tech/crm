import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Req, Post, Param, Query, Patch, Delete, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { ServerIdValidator } from '@crm/validation';
import { Auth, Action, ServerSubject, AuthenticatedReq } from '@crm/auth';

import { Server } from './domain';
import { ServerService } from './services';
import { ListServersDto, UpdateServerDto, CreateServerDto } from './dto';

@ApiTags('Server')
@ApiExtraModels(CreateServerDto, ListServersDto, UpdateServerDto)
@Controller({ path: 'servers', version: '1' })
export class ServerController {
  constructor(private readonly service: ServerService) {}

  /**
   * Fetch a single server by id
   * @param serverId The server id to fetch
   */
  @Auth(Action.READ, ServerSubject)
  @OpenApi({ type: Server })
  @Get(':serverId')
  public async get(@Param('serverId', ServerIdValidator) serverId: string): Promise<{ data: Server }> {
    return { data: await this.service.get(serverId) };
  }

  /**
   * Lists servers based on filter criteria.
   * @param dto The payload dto
   */
  @Auth(Action.READ, ServerSubject)
  @OpenApi({ type: Server, isPaginated: true })
  @Get()
  public async list(@Query() dto: ListServersDto): Promise<PaginatedResDto<Server>> {
    return await this.service.list(dto);
  }

  /**
   * Create a new server
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.CREATE, ServerSubject)
  @OpenApi({ type: Server })
  @Post()
  public async create(@Query() dto: CreateServerDto, @Req() req: AuthenticatedReq): Promise<{ data: Server }> {
    return { data: await this.service.create(dto, req) };
  }

  /**
   * Updates an existing server
   * @param serverId The server id to update
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.UPDATE, ServerSubject)
  @OpenApi({ type: Server })
  @Patch(':serverId')
  public async update(
    @Param('serverId', ServerIdValidator) serverId: string,
    @Query() dto: UpdateServerDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: Server }> {
    return { data: await this.service.update(serverId, dto, req) };
  }

  /**
   * Deletes an existing server
   * @param serverId The server to delete
   * @param req The authenticated request
   */
  @Auth(Action.DELETE, ServerSubject)
  @OpenApi()
  @Delete(':serverId')
  public async delete(
    @Param('serverId', ServerIdValidator) serverId: string,
    @Req() req: AuthenticatedReq,
  ): Promise<void> {
    await this.service.delete(serverId, req);
  }
}
