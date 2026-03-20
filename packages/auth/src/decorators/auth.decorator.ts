import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Type, UseGuards, applyDecorators } from '@nestjs/common';

import { AuthStrategy } from '@crm/types';

import { UserStatusGuard } from '../guards';
import { Can } from '../modules/casl/decorators';
import { CanGuard } from '../modules/casl/guards';
import { Action, Option, Subject } from '../modules/casl/types';

export function Auth<T extends Type<Subject>>(
  action?: Action,
  subject?: T,
  option?: Option<T>,
  strategies: AuthStrategy[] = [AuthStrategy.JWT],
): ClassDecorator & MethodDecorator {
  // Apply base guards
  const items = [UseGuards(AuthGuard(strategies))];
  items.push(UseGuards(UserStatusGuard));

  // CASL ability guard
  if (action && subject && option) {
    items.push(Can(action, subject, option));
    items.push(UseGuards(CanGuard));
  }

  return applyDecorators(...items, ApiBearerAuth());
}
