import { join } from 'path';

import { Logger } from '@nestjs/common';
import { load, Root, Type, Buffer, Message } from 'protobufjs';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import { Monetisation } from '@crm/types';

import { CtErrorMapper } from '../../../mappers/error/ct-error.mapper';

import { CTCredentials, PlatformServer } from '../../../models/platform-server';
import { PlatformException, UnparseableResponseException } from '../../../exceptions';

export type SnapshotEntity = 'deals' | 'orders' | 'positions' | 'balanceHistories' | 'traders';

/**
 * @see https://docs.spotware.com/en/Reporting_API/Making_Snapshots
 */
export class CtSnapshotApiService {
  constructor(private readonly ctErrorMapper: CtErrorMapper) {}

  /** The logger to use for this service */
  readonly #logger = new Logger(this.constructor.name);

  /** The http client to use */
  #client!: AxiosInstance;

  /** The environment name */
  #envName!: string;

  /** Stores the CommonMessages_External proto root */
  #protoMsg!: Root;

  /**
   * Initialises the service
   */
  async bootstrap(server: PlatformServer<CTCredentials>): Promise<void> {
    // Bootstrap the http client
    this.#client = axios.create({ baseURL: server.credentials.snapshotApi.url });

    // Add the response interceptors
    this.#client.interceptors.response.use(
      (response: AxiosResponse) => {
        response.data = this.#toMessage(response.config.headers['x-msg-type'], response.data);
        return response;
      },
      async (error: AxiosError) => Promise.reject(this.ctErrorMapper.mapSnapshotApiError(error)),
    );

    this.#envName = Monetisation.DEMO === server.monetisation ? 'demo' : 'live';
    const msg = `cTrader SnapshotAPI Bootstrapping on ${this.#envName} env`;

    try {
      // Load the proto messages
      const base = `${__dirname}/platform/services/ct/manager/proto/`;
      this.#protoMsg = await load(join(base, 'reporting/ReportingMessages.proto'));

      this.#logger.debug(`${msg} - Complete`);
    } catch (err) {
      this.#logger.error(`${msg} - Failed`, err);
    }
  }

  /**
   * Get a snapshot of the requested entity
   * @see https://docs.spotware.com/en/Reporting_API/Making_Snapshots
   *
   * @param entity The entity to get a snapshot of
   * @param dir The direction to get the snapshot in
   * @param size The size of the snapshot
   * @param fromEntityId The ID to get the snapshot from
   */
  async getSnapshot<T = unknown>(
    entity: SnapshotEntity,
    dir: 'asc' | 'desc',
    size: number,
    fromEntityId?: number,
  ): Promise<T> {
    // Validate the size
    size = Math.min(Math.max(size, 100), 15_000);

    // Prepare the correct type for the snapshot
    let type = entity.charAt(0).toUpperCase() + entity.toLowerCase().slice(1);
    if ('Balancehistories' === type) {
      type = 'BalanceHistories';
    }

    const result = await this.#client.get(`/repo/${entity}`, {
      params: { direction: dir, size, ...(fromEntityId ? { id: fromEntityId } : {}) },
      headers: { 'x-msg-type': type },
      responseType: 'arraybuffer',
      timeout: 120_000,
    });

    return result.data;
  }

  /**
   * Decodes the snapshot from the server to the given type
   * @param messageType The type of message to decode to
   * @param content The content to decode
   * @throws UnparseableResponseException If the content cannot be decoded to the given messageType
   * @throws UnsupportedOperationException If the messageType does not exist on the server
   */
  #toMessage(messageType: string, content: Buffer): Message {
    const type = this.#protoMsg.lookupType(messageType);
    return this.#decode(content, type);
  }

  /**
   * Decodes the buffer into the given type.
   * @param buffer The buffer to decode
   * @param type The type to decode the buffer into
   * @throws UnparseableResponseException If the response cannot be decoded
   */
  #decode<R extends Record<string, any>>(buffer: Buffer, type: Type): Message<R> {
    let message: Message<R> | undefined = undefined;
    let error: PlatformException | undefined = undefined;

    try {
      message = type.decode(buffer);
    } catch (err) {
      error = new UnparseableResponseException(type.name, type.verify(buffer), err);
    }

    if (!message) {
      try {
        message = type.decodeDelimited(buffer);
      } catch (err) {
        error = new UnparseableResponseException(type.name, type.verify(buffer), err);
      }
    }

    if (!message) {
      throw error;
    }

    return message;
  }
}
