import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { isUUID, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import { InvitationEntity } from '@crm/database';

@Injectable()
@ValidatorConstraint({ name: 'invitationId', async: true })
export class InvitationIdValidator implements ValidatorConstraintInterface, PipeTransform {
  constructor(
    @InjectRepository(InvitationEntity)
    private readonly repo: Repository<InvitationEntity>,
  ) {}

  async validate(value: string): Promise<boolean> {
    return this.#exec(value);
  }

  async transform(value: string): Promise<string> {
    await this.#exec(value);
    return value;
  }

  async #exec(value: string): Promise<boolean> {
    if (!isUUID(value)) {
      throw new BadRequestException('invitationId must be a valid uuid');
    }

    const entity = await this.repo.findOne({ where: { id: value } });
    if (!entity) {
      throw new BadRequestException(`invitationId must reference an existing entity, ${value} provided.`);
    }

    return true;
  }
}
