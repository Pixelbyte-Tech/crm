import { Type, mixin, Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { AuthenticatedReq } from '../../../types';
import { Action, Option, Subject } from '../types';
import { SubjectFactory, CaslAbilityFactory } from '../factories';

/**
 * @param action The action to check
 * @param subject The subject making the action
 * @param option The instructions on how to find the subject in the request
 */
export const CanGuard = (action: Action, subject: Type<Subject>, option: Option): Type<CanActivate> => {
  @Injectable()
  class ActionsGuard implements CanActivate {
    constructor(
      private readonly subjectFactory: SubjectFactory,
      private readonly caslAbilityFactory: CaslAbilityFactory,
    ) {}

    /**
     * Checks if the user has the ability to perform the action on the subject
     * @param context the request context
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
      // Fetch the request from the context
      const req: AuthenticatedReq = context.switchToHttp().getRequest();

      // Check the ability against CASL
      const ability = this.caslAbilityFactory.createForUser(req.user);
      return ability.can(action, await this.subjectFactory.create(subject, req[option.in][option.param]));
    }
  }

  return mixin(ActionsGuard);
};
