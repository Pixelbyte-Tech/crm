import { Injectable } from '@nestjs/common';
import { PureAbility, AbilityBuilder, ExtractSubjectType } from '@casl/ability';

import { Role } from '@crm/types';

import { Action, Subject, CaslUser } from '../types';
import { UserSubject, AlertSubject, UserAuthSessionSubject, CompanyInvitationSubject } from '../subjects';

@Injectable()
export class CaslAbilityFactory {
  /**
   * Creates the abilities for a CASL user
   * @param user The user details
   */
  createForUser(user: CaslUser): PureAbility<[Action, Subject]> {
    const { can, build } = new AbilityBuilder(PureAbility<[Action, Subject]>);

    // Iterate over user roles in companies
    for (const [companyId, value] of Object.entries(user.roles)) {
      for (const role of value) {
        switch (role) {
          case Role.ADMIN:
            can(Action.MANAGE, AlertSubject, { companyId });
            can(Action.MANAGE, CompanyInvitationSubject, { companyId });
            can(Action.MANAGE, UserSubject, { companyId });
            can(Action.READ, UserAuthSessionSubject, { companyId });
            break;
          case Role.TRADE_SUPPORT:
            can(Action.READ, UserSubject, { companyId });
            can(Action.READ, UserAuthSessionSubject, { companyId });
            break;
          case Role.CS_AGENT:
            can(Action.READ, UserSubject, { companyId });
            can(Action.READ, UserAuthSessionSubject, { companyId });
            break;
          case Role.COMPLIANCE:
            can(Action.READ, UserSubject, { companyId });
            can(Action.READ, UserAuthSessionSubject, { companyId });
            break;
        }
      }
    }

    // Users
    can(Action.MANAGE, UserSubject, { id: user.userId });

    // User Sessions
    can(Action.READ, UserAuthSessionSubject, { userId: user.userId });
    can(Action.CREATE, UserAuthSessionSubject, { userId: user.userId });
    can(Action.UPDATE, UserAuthSessionSubject, { userId: user.userId });

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subject>,
    });
  }
}
