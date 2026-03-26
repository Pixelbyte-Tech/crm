import { PlatformException } from './platform.exception';

export class UnknownUserGroupException extends PlatformException {
  constructor(userGroupId: unknown, cause?: unknown) {
    super(`User group with id '${userGroupId}' does not exist on the platform server.`, cause);
  }
}
