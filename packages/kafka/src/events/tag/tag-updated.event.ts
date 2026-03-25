import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { TagUpdatedDto } from '../dto';
import { BaseEvent } from '../base.event';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing tag is updated
 **/
export class TagUpdatedEvent extends BaseEvent<TagUpdatedDto> {
  static readonly type = 'tag.updated';

  constructor(payload: TagUpdatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
