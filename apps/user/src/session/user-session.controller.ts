import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Param, Query, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { UserIdValidator } from '@crm/validation';
import { Auth, Action, UserAuthSessionSubject } from '@crm/auth';

import { UserSession } from './domain';
import { ListUserSessionsDto } from './dto';
import { UserSessionService } from './services';

@ApiTags('Session')
@ApiExtraModels(ListUserSessionsDto)
@Controller({ path: 'users', version: '1' })
export class UserSessionController {
  constructor(private readonly service: UserSessionService) {}

  /**
   * Fetches the latest completed auth session for a user based on the user id provided
   * @param userId The user id to fetch
   */
  @Auth(Action.READ, UserAuthSessionSubject, { in: 'params', use: 'userId', findBy: 'userId' })
  @OpenApi({ type: UserSession })
  @Get(':userId/latest-session')
  public async get(@Param('userId', UserIdValidator) userId: string): Promise<{ data: UserSession }> {
    const result = await this.service.latest(userId);
    return { data: result };
  }

  /**
   * Lists all sessions for a user based on the user id provided
   * @param userId The user id to fetch
   * @param dto The payload dto
   */
  @Auth(Action.READ, UserAuthSessionSubject, { in: 'params', use: 'userId', findBy: 'userId' })
  @OpenApi({ type: UserSession, isPaginated: true })
  @Get(':userId/sessions')
  public async list(
    @Param('userId', UserIdValidator) userId: string,
    @Query() dto: ListUserSessionsDto,
  ): Promise<PaginatedResDto<UserSession>> {
    return await this.service.list(userId, dto);
  }
}
