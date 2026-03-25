import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Req, Post, Param, Query, Patch, Delete, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { GlobalSetting } from '@crm/types';
import { PaginatedResDto } from '@crm/http';
import { GlobalSettingIdValidator } from '@crm/validation';
import { Auth, Action, AuthenticatedReq, GlobalSettingSubject } from '@crm/auth';

import { GlobalSettingService } from './services';
import { ListGlobalSettingsDto, UpdateGlobalSettingDto, CreateGlobalSettingDto } from './dto';

@ApiTags('Global Setting')
@ApiExtraModels(GlobalSetting, CreateGlobalSettingDto, ListGlobalSettingsDto, UpdateGlobalSettingDto)
@Controller({ path: 'settings', version: '1' })
export class GlobalSettingController {
  constructor(private readonly service: GlobalSettingService) {}

  /**
   * Fetch a single global setting by id
   * @param settingId The global setting id to fetch
   */
  @Auth(Action.READ, GlobalSettingSubject)
  @OpenApi({ type: GlobalSetting })
  @Get(':settingId')
  public async list(@Param('settingId', GlobalSettingIdValidator) settingId: string): Promise<{ data: GlobalSetting }> {
    return { data: await this.service.get(settingId) };
  }

  /**
   * Fetches all global settings
   * @param dto The payload dto
   */
  @Auth(Action.READ, GlobalSettingSubject)
  @OpenApi({ type: GlobalSetting, isPaginated: true })
  @Get()
  public async get(@Query() dto: ListGlobalSettingsDto): Promise<PaginatedResDto<GlobalSetting>> {
    return await this.service.list(dto);
  }

  /**
   * Create a new global setting
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.CREATE, GlobalSettingSubject)
  @OpenApi({ type: GlobalSetting })
  @Post()
  public async create(
    @Query() dto: CreateGlobalSettingDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: GlobalSetting }> {
    return { data: await this.service.create(dto, req) };
  }

  /**
   * Updates an existing global setting
   * @param settingId The setting id to update
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.UPDATE, GlobalSettingSubject)
  @OpenApi({ type: GlobalSetting })
  @Patch(':settingId')
  public async update(
    @Param('settingId', GlobalSettingIdValidator) settingId: string,
    @Query() dto: UpdateGlobalSettingDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: GlobalSetting }> {
    return { data: await this.service.update(settingId, dto, req) };
  }

  /**
   * Deletes an existing global setting
   * @param settingId The setting to delete
   * @param req The authenticated request
   */
  @Auth(Action.DELETE, GlobalSettingSubject)
  @OpenApi()
  @Delete(':settingId')
  public async delete(
    @Param('settingId', GlobalSettingIdValidator) settingId: string,
    @Req() req: AuthenticatedReq,
  ): Promise<void> {
    await this.service.delete(settingId, req);
  }
}
