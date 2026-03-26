import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Req, Post, Param, Query, Patch, Delete, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { ServerIdValidator, TradingAccountSchemaIdValidator } from '@crm/validation';
import { Auth, Action, AuthenticatedReq, TradingAccountSchemaSubject } from '@crm/auth';

import { SchemaService } from './services';
import { TradingAccountSchema } from './domain';
import { ListSchemasDto, UpdateSchemaDto, CreateSchemaDto } from './dto';

@ApiTags('Trading Account')
@ApiExtraModels(CreateSchemaDto, ListSchemasDto, UpdateSchemaDto)
@Controller({ path: 'servers', version: '1' })
export class SchemaController {
  constructor(private readonly service: SchemaService) {}

  /**
   * Fetch a single schema by id
   * @param serverId The server to which the schema applies
   * @param schemaId The schema id to fetch
   */
  @Auth(Action.READ, TradingAccountSchemaSubject)
  @OpenApi({ type: TradingAccountSchema })
  @Get(':serverId/trading-account-schemas/:schemaId')
  public async get(
    @Param('serverId', ServerIdValidator) serverId: string,
    @Param('schemaId', TradingAccountSchemaIdValidator) schemaId: string,
  ): Promise<{ data: TradingAccountSchema }> {
    return { data: await this.service.get(serverId, schemaId) };
  }

  /**
   * Lists schemas based on filter criteria.
   * @param serverId The server to which the schema applies
   * @param dto The payload dto
   */
  @Auth(Action.READ, TradingAccountSchemaSubject)
  @OpenApi({ type: TradingAccountSchema, isPaginated: true })
  @Get(':serverId/trading-account-schemas')
  public async list(
    @Param('serverId', ServerIdValidator) serverId: string,
    @Query() dto: ListSchemasDto,
  ): Promise<PaginatedResDto<TradingAccountSchema>> {
    return await this.service.list(serverId, dto);
  }

  /**
   * Create a new schema
   * @param serverId The server to which the schema applies
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.CREATE, TradingAccountSchemaSubject)
  @OpenApi({ type: TradingAccountSchema })
  @Post(':serverId/trading-account-schemas')
  public async create(
    @Param('serverId', ServerIdValidator) serverId: string,
    @Query() dto: CreateSchemaDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: TradingAccountSchema }> {
    return { data: await this.service.create(serverId, dto, req) };
  }

  /**
   * Updates an existing schema
   * @param serverId The server to which the schema applies
   * @param schemaId The schema id to update
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.UPDATE, TradingAccountSchemaSubject)
  @OpenApi({ type: TradingAccountSchema })
  @Patch(':serverId/trading-account-schemas/:schemaId')
  public async update(
    @Param('serverId', ServerIdValidator) serverId: string,
    @Param('schemaId', TradingAccountSchemaIdValidator) schemaId: string,
    @Query() dto: UpdateSchemaDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: TradingAccountSchema }> {
    return { data: await this.service.update(serverId, schemaId, dto, req) };
  }

  /**
   * Deletes an existing schema
   * @param serverId The server to which the schema applies
   * @param schemaId The schema to delete
   * @param req The authenticated request
   */
  @Auth(Action.DELETE, TradingAccountSchemaSubject)
  @OpenApi()
  @Delete(':serverId/trading-account-schemas/:schemaId')
  public async delete(
    @Param('serverId', ServerIdValidator) serverId: string,
    @Param('schemaId', TradingAccountSchemaIdValidator) schemaId: string,
    @Req() req: AuthenticatedReq,
  ): Promise<void> {
    await this.service.delete(serverId, schemaId, req);
  }
}
