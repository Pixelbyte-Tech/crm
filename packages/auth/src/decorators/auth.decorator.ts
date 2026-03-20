import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Type, UseGuards, applyDecorators } from '@nestjs/common';

import { AuthStrategy } from '@crm/types';

import { UserStatusGuard } from '../guards';
import { CanGuard } from '../modules/casl/guards';
import { Action, Option, Subject } from '../modules/casl/types';

export function Auth(
  action?: Action,
  subject?: Type<Subject>,
  option?: Option,
  strategies: AuthStrategy[] = [AuthStrategy.JWT],
): ClassDecorator & MethodDecorator {
  // Apply these guards to the endpoint
  const items = [UseGuards(AuthGuard(strategies))];
  items.push(UseGuards(UserStatusGuard));

  // Add CASL ability guard
  if (action && subject && option) {
    items.push(UseGuards(CanGuard(action, subject, option)));
  }

  return applyDecorators(...items, ApiBearerAuth());
}
