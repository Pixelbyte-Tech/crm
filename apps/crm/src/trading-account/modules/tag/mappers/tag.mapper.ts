import { Injectable } from '@nestjs/common';

import { TagEntity } from '@crm/database';

import { Tag } from '../domain';

@Injectable()
export class TagMapper {
  toTag(data: TagEntity): Tag {
    const model = new Tag();
    model.id = data.id;
    model.name = data.name;

    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
