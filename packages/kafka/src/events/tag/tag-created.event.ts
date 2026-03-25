import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { TagCreatedDto } from '../dto';
import { BaseEvent } from '../base.event';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when a new tag is created in the system
 **/
export class TagCreatedEvent extends BaseEvent<TagCreatedDto> {
  static readonly type = 'tag.created';

  constructor(payload: TagCreatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
