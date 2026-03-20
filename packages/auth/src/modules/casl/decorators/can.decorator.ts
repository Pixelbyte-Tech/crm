import { Type, SetMetadata } from '@nestjs/common';

import { CAN_METADATA_KEY } from '../guards';
import { Action, Option, Subject } from '../types';

export const Can = (action: Action, subject: Type<Subject>, option: Option) =>
  SetMetadata(CAN_METADATA_KEY, { action, subject, option });
