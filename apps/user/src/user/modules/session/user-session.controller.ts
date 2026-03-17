import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Param, Query, Controller } from '@nestjs/common';

import { Auth } from '@crm/auth';
import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { UserIdValidator } from '@crm/validation';

import { UserSession } from './domain';
import { ListUserSessionsDto } from './dto';
import { UserSessionService } from './services';

@ApiTags('Session')
@ApiExtraModels(ListUserSessionsDto)
@Controller({ path: 'users', version: '1' })
export class UserSessionController {
  constructor(private readonly service: UserSessionService) {}

  /**
   * Gets the latest session for a user by id
   * @param userId The user id to fetch
   */
  @Auth()
  @OpenApi({ type: UserSession })
  @Get(':userId/sessions/latest')
  public async get(@Param('userId', UserIdValidator) userId: string): Promise<{ data: UserSession }> {
    const result = await this.service.latest(userId);
    return { data: result };
  }

  /**
   * Lists all sessions for a user by ID
   * @param userId The user id to fetch
   * @param dto The dto
   */
  @Auth()
  @OpenApi({ type: UserSession, isPaginated: true })
  @Get(':userId/sessions')
  public async list(
    @Param('userId', UserIdValidator) userId: string,
    @Query() dto: ListUserSessionsDto,
  ): Promise<PaginatedResDto<UserSession>> {
    return await this.service.list(userId, dto);
  }
}
