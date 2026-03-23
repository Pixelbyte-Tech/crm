import { Reflector } from '@nestjs/core';
import { Type, Logger, Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { AuthenticatedReq } from '../../../types';
import { Action, Subject, SubjectFilter } from '../types';
import { SubjectFactory, CaslAbilityFactory } from '../factories';

export const CAN_METADATA_KEY = 'casl:can';

/**
 * Checks if the user has the ability to perform the action on the subject based on metadata
 * defined by the @Can decorator
 * @param action The action to check
 * @param subject The subject making the action
 * @param filter The instructions on how to find the subject from the request context
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
      subject: Type<Subject>;
      filter?: SubjectFilter;
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
    const subject = await this.subjectFactory.create(req, canMetadata.subject, canMetadata.filter);

    // Log the check params
    this.#logger.debug(`Checking action '${canMetadata.action}' on subject '${canMetadata.subject.name}'`, subject);

    // Test the ability against the subject
    return ability.can(canMetadata.action, subject);
  }
}
