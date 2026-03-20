import { Scope, Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

import { UserStatus } from '@crm/types';

import { AuthenticatedReq } from '../types';
import { AuthHelperService } from '../services';

@Injectable({ scope: Scope.REQUEST })
export class UserStatusGuard implements CanActivate {
  constructor(private readonly helper: AuthHelperService) {}

  public canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<AuthenticatedReq>();
    if (UserStatus.ACTIVE !== this.helper.userStatus(request.user.userId)) {
      throw new ForbiddenException(`Unauthorized - user with id '${request.user.userId}' is inactive`);
    }

    return true;
  }
}
