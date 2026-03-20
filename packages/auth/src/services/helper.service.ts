import { setInterval } from 'node:timers';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { UserStatus } from '@crm/types';
import { UserEntity } from '@crm/database';

import { AuthenticatedReq } from '../types';

@Injectable()
export class AuthHelperService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /** Cached users with their status */
  #users: { id: string; status: UserStatus }[] = [];

  /**
   * Runs on application bootstrap.
   * Updates the cached users every 5 seconds.
   */
  async onApplicationBootstrap(): Promise<void> {
    await this.#updateUsers();
    setInterval(this.#updateUsers.bind(this), 5_000);
  }

  /**
   * Returns the status of a user. Returns undefined if the user does not exist.
   * @param userId The id of the user.
   */
  userStatus(userId: string): UserStatus | undefined {
    return this.#users.find((u) => u.id === userId)?.status;
  }

  /**
   * Fetches a property from the request object by looking in the query, body, and params.
   * @param property The property to fetch.
   * @param req The request object.
   * @param asArray Whether to return the property as an array.
   */
  fetchProperty<T>(property: string, req: AuthenticatedReq, asArray: boolean = false): T | undefined {
    let val: T | undefined;
    if (req.query) {
      val = req.query[property] as T;
    }

    if (req.body && !val) {
      val = req.body[property] as T;
    }

    if (req.params && !val) {
      val = req.params[property] as T;
    }

    // If the value is not an array, and we want it as an array
    if (asArray && !Array.isArray(val)) {
      return val ? ([val] as T) : ([] as T);
    }

    return val;
  }

  /**
   * Updates the cached users with their status.
   */
  async #updateUsers(): Promise<void> {
    this.#users = await this.userRepo.find({ select: ['id', 'status'] });
  }
}
