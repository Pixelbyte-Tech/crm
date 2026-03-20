import { DataSource } from 'typeorm';
import { Type, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { User } from '@crm/types';
import { AlertEntity, UserAuthSessionEntity, CompanyInvitationEntity } from '@crm/database';

import { Option, Subject } from '../types';
import { AuthenticatedReq } from '../../../types';
import { InvalidSubjectException } from '../exceptions';
import { UserSubject, AlertSubject, UserAuthSessionSubject, CompanyInvitationSubject } from '../subjects';

@Injectable()
export class SubjectFactory {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates the subject object for the provided subject id
   * @param subject The type of subject to create
   * @param option The options on how to find the subject from the request context
   * @param req The request context to find the subject from
   */
  async create(subject: Type<Subject>, option: Option, req: AuthenticatedReq): Promise<Subject> {
    const qb = this.dataSource.createQueryBuilder();

    // Extract the value to search by
    const value = req[option.in][option.use];

    if (subject.name === AlertSubject.name) {
      const e = await qb
        .from(AlertEntity, 'e')
        .select('companyId')
        .where(`e.${option.findBy} = :value`, { value })
        .getRawOne();
      return new AlertSubject({ id: e?.id, companyId: e?.companyId });
    }

    if (subject.name === CompanyInvitationSubject.name) {
      const e = await qb
        .from(CompanyInvitationEntity, 'e')
        .select(['companyId', 'sentByUserId'])
        .where(`e.${option.findBy} = :value`, { value })
        .getRawOne();

      return new CompanyInvitationSubject({
        id: e?.id,
        sentByUserId: e?.sentByUserId ?? '',
        companyId: e?.companyId ?? '',
      });
    }

    if (subject.name === UserSubject.name) {
      const e = await qb
        .from(User, 'e')
        .select('companyId')
        .where(`e.${option.findBy} = :value`, { value })
        .getRawOne();
      return new UserSubject({ id: e?.id, companyId: e?.companyId ?? '' });
    }

    if (subject.name === UserAuthSessionSubject.name) {
      const e = await qb
        .from(UserAuthSessionEntity, 'e')
        .select(['userId', 'companyId'])
        .where(`e.${option.findBy} = :value`, { value })
        .getRawOne();

      return new UserAuthSessionSubject({ id: e?.id, userId: e?.userId ?? '', companyId: e?.companyId ?? '' });
    }

    throw new InvalidSubjectException(subject.name);
  }
}
