import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Scope, Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

import { UserStatus } from '@crm/types';
import { UserEntity } from '@crm/database';

import { AuthenticatedReq } from '../types';

@Injectable({ scope: Scope.REQUEST })
export class UserStatusGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<AuthenticatedReq>();

    const user = await this.userRepo.findOne({ select: { status: true }, where: { id: request.user.userId } });
    if (UserStatus.ACTIVE !== user?.status) {
      throw new ForbiddenException(`Unauthorized - user with id '${request.user.userId}' is inactive or suspended`);
    }

    return true;
  }
}
