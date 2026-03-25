import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { GlobalSettingUpdatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing global setting is updated
 **/
export class GlobalSettingUpdatedEvent extends BaseEvent<GlobalSettingUpdatedDto> {
  static readonly type = 'global-setting.updated';

  constructor(payload: GlobalSettingUpdatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
