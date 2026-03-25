import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { TagDeletedDto } from '../dto';
import { BaseEvent } from '../base.event';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing tag is deleted
 **/
export class TagDeletedEvent extends BaseEvent<TagDeletedDto> {
  static readonly type = 'tag.deleted';

  constructor(payload: TagDeletedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
