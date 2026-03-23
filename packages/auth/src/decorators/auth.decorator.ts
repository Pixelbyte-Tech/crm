import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Type, UseGuards, applyDecorators } from '@nestjs/common';

import { AuthStrategy } from '@crm/types';

import { UserStatusGuard } from '../guards';
import { Can } from '../modules/casl/decorators';
import { CanGuard } from '../modules/casl/guards';
import { Action, Option, Subject } from '../modules/casl/types';

// Overload 1: Only strategies parameter
export function Auth(strategies?: AuthStrategy[]): ClassDecorator & MethodDecorator;

// Overload 2: All parameters (action, subject, option, strategies)
export function Auth<T extends Type<Subject>>(
  action: Action,
  subject: T,
  option?: Option<T>,
  strategies?: AuthStrategy[],
): ClassDecorator & MethodDecorator;

// Implementation signature
export function Auth<T extends Type<Subject>>(
  actionOrStrategies?: Action | AuthStrategy[],
  subject?: T,
  option?: Option<T>,
  strategies: AuthStrategy[] = [AuthStrategy.JWT],
): ClassDecorator & MethodDecorator {
  let action: Action | undefined;
  let actualStrategies: AuthStrategy[];

  // Determine which overload was called
  if (Array.isArray(actionOrStrategies)) {
    // First overload: Auth(strategies)
    actualStrategies = actionOrStrategies;
    action = undefined;
  } else {
    // Second overload: Auth(action, subject, option, strategies)
    action = actionOrStrategies;
    actualStrategies = strategies;
  }

  // Apply base guards
  const items = [UseGuards(AuthGuard(actualStrategies))];
  items.push(UseGuards(UserStatusGuard));

  // CASL ability guard
  if (action && subject && option) {
    items.push(Can(action, subject, option));
    items.push(UseGuards(CanGuard));
  }

  return applyDecorators(...items, ApiBearerAuth());
}
