import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable } from '@nestjs/common';

import { TagEntity } from '../../entities/tag.entity';

@Injectable()
export class TagSeedService {
  constructor(@InjectRepository(TagEntity) private repo: Repository<TagEntity>) {}

  readonly #logger = new Logger(this.constructor.name);

  async run() {
    this.#logger.log('Starting tags seed...');

    try {
      for (const tag of ['Test Tag A', 'Test Tag B', 'Test Tag C']) {
        if ((await this.repo.count({ where: { name: tag } })) !== 0) {
          continue;
        }

        const entity = new TagEntity();
        entity.name = tag;
        await this.repo.save(entity);
        this.#logger.debug(` -> Seeded tag '${tag}'`);
      }

      this.#logger.log('✅ Tags seeded successfully');
    } catch (err) {
      this.#logger.error(`Error seeding tags`, err);
      throw err;
    }
  }
}
