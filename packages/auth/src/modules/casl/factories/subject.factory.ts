import { DataSource } from 'typeorm';
import { Type, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { User } from '@crm/types';
import { AlertEntity, UserAuthSessionEntity, CompanyInvitationEntity } from '@crm/database';

import { Subject } from '../types';
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
   * @param id The identifier of the subject to create
   */
  async create(subject: Type<Subject>, id: string): Promise<Subject> {
    const qb = this.dataSource.createQueryBuilder();

    if (subject.name === AlertSubject.name) {
      const e = await qb.from(AlertEntity, 'e').select('companyId').where('e.id = :id', { id }).getRawOne();
      return new AlertSubject({ id, companyId: e?.companyId ?? '' });
    }

    if (subject.name === CompanyInvitationSubject.name) {
      const e = await qb
        .from(CompanyInvitationEntity, 'e')
        .select(['companyId', 'sentByUserId'])
        .where('e.id = :id', { id })
        .getRawOne();

      return new CompanyInvitationSubject({ id, sentByUserId: e?.sentByUserId ?? '', companyId: e?.companyId ?? '' });
    }

    if (subject.name === UserSubject.name) {
      const e = await qb.from(User, 'e').select('companyId').where('e.id = :id', { id }).getRawOne();
      return new UserSubject({ id, companyId: e?.companyId ?? '' });
    }

    if (subject.name === UserAuthSessionSubject.name) {
      const e = await qb
        .from(UserAuthSessionEntity, 'e')
        .select(['userId', 'companyId'])
        .where('e.id = :id', { id })
        .getRawOne();

      return new UserAuthSessionSubject({ id, userId: e?.userId ?? '', companyId: e?.companyId ?? '' });
    }

    throw new InvalidSubjectException(subject.name);
  }
}
