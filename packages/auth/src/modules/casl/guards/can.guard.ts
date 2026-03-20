import { Reflector } from '@nestjs/core';
import { Logger, Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { Action, Option } from '../types';
import { AuthenticatedReq } from '../../../types';
import { SubjectFactory, CaslAbilityFactory } from '../factories';

export const CAN_METADATA_KEY = 'casl:can';

/**
 * Checks if the user has the ability to perform the action on the subject based on metadata
 * defined by the @Can decorator
 * @param action The action to check
 * @param subject The subject making the action
 * @param option The instructions on how to find the subject from the request context
 */
@Injectable()
export class CanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subjectFactory: SubjectFactory,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  readonly #logger = new Logger(this.constructor.name);

  /**
   * Checks if the user has the ability to perform the action on the subject
   * @param context the request context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextHandler = context.getHandler();
    const contextClass = context.getClass();

    // Get metadata from the handler or class
    const canMetadata = this.reflector.getAllAndOverride<{
      action: Action;
      subject: any;
      option: Option;
    }>(CAN_METADATA_KEY, [contextHandler, contextClass]);

    // If no metadata, allow access
    if (!canMetadata) {
      this.#logger.warn(`Missing metadata for ability check on ${contextClass.name}.${contextHandler.name}`);
      return false;
    }

    // Fetch the request from the context
    const req: AuthenticatedReq = context.switchToHttp().getRequest();

    // Check the ability against CASL
    const ability = this.caslAbilityFactory.createForUser(req.user);
    return ability.can(
      canMetadata.action,
      await this.subjectFactory.create(canMetadata.subject, canMetadata.option, req),
    );
  }
}
