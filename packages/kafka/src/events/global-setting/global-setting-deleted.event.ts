import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { GlobalSettingDeletedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing global setting is deleted
 **/
export class GlobalSettingDeletedEvent extends BaseEvent<GlobalSettingDeletedDto> {
  static readonly type = 'global-setting.deleted';

  constructor(payload: GlobalSettingDeletedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
