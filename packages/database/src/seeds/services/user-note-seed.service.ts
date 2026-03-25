import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable, NotFoundException } from '@nestjs/common';

import { UserEntity } from '../../entities/user.entity';
import { UserNoteEntity } from '../../entities/user-note.entity';
import { ADMIN_USER_EMAIL, STANDARD_USER_EMAIL } from '../helper/seed-ids';

@Injectable()
export class UserNoteSeedService {
  constructor(
    @InjectRepository(UserEntity) private repoUser: Repository<UserEntity>,
    @InjectRepository(UserNoteEntity) private repo: Repository<UserNoteEntity>,
  ) {}

  readonly #logger = new Logger(this.constructor.name);

  async run() {
    this.#logger.log('Starting user notes seed...');

    const stdUser = await this.repoUser.findOne({ where: { email: STANDARD_USER_EMAIL } });
    const adminUser = await this.repoUser.findOne({ where: { email: ADMIN_USER_EMAIL } });
    if (!adminUser || !stdUser) {
      throw new NotFoundException('Standard/Admin user(s) not found.');
    }

    try {
      if ((await this.repo.count({ where: { user: { email: STANDARD_USER_EMAIL } } })) === 0) {
        const entity = new UserNoteEntity();
        entity.summary = 'This is a note about the user';
        entity.body = 'This user is a standard user and has no special permissions.';
        entity.isPinned = true;
        entity.authorId = adminUser?.id;
        entity.userId = stdUser.id;

        await this.repo.save(entity);
        this.#logger.debug(` -> Seeded user note for '${STANDARD_USER_EMAIL}'`);
      }

      this.#logger.log('✅ User notes seeded successfully');
    } catch (err) {
      this.#logger.error(`Error seeding user notes`, err);
      throw err;
    }
  }
}
