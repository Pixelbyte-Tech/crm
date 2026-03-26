import { PlatformException } from './platform.exception';

export class UnknownRiskPlanException extends PlatformException {
  constructor(riskPlanId: unknown, cause?: unknown) {
    super(`Risk plan with id '${riskPlanId}' does not exist on the platform server.`, cause);
  }
}
