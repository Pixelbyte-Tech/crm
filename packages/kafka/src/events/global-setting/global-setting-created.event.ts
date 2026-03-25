import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { GlobalSettingCreatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when a new global setting is created in the system
 **/
export class GlobalSettingCreatedEvent extends BaseEvent<GlobalSettingCreatedDto> {
  static readonly type = 'global-setting.created';

  constructor(payload: GlobalSettingCreatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
