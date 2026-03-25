import { Role } from '@crm/types';

import { DomainException } from '../../common/exceptions';

export class ExcessiveRoleGrantException extends DomainException {
  constructor(roles: Role[], cause?: Error) {
    super(`Not allowed to grant roles '${roles.join(', ')}'. Please choose roles you have permission to.`, cause);
  }
}
