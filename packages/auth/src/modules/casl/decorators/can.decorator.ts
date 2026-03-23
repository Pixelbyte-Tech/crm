import { Type, SetMetadata } from '@nestjs/common';

import { CAN_METADATA_KEY } from '../guards';
import { Action, Subject, SubjectFilter } from '../types';

export const Can = (action: Action, subject: Type<Subject>, filter?: SubjectFilter<typeof subject>) =>
  SetMetadata(CAN_METADATA_KEY, { action, subject, filter });
