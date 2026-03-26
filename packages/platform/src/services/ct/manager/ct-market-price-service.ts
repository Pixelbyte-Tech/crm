import { randomUUID } from 'crypto';

import Long from 'long';
import Redis from 'ioredis';
import { chunk } from 'lodash';
import { DateTime } from 'luxon';
import objectHash from 'object-hash';
import { Logger } from '@nestjs/common';

import { Serializer } from '../../serializer.service';
import { CtManagerApiService } from './ct-manager-api.service';

import { Tick } from '../../../models/tick';
import { UnknownSymbolException } from '../../../exceptions';
import { CTCredentials } from '../../../models/platform-server';
import {
  ProtoSpotEvent,
  ProtoPayloadType,
  ProtoCSPayloadType,
  ProtoManagerSymbol,
  ProtoManagerSymbolListRes,
  ProtoSubscribeSpotQuotesReq,
  ProtoUnsubscribeSpotQuotesReq,
} from './proto/base/ts';

/**
 * https://docs.spotware.com/en/Managers_API/Events
 *
 * The instances of this service need to coordinate to collectively distribute the list of symbols
 * between them and ensure that each instance is responsible for fetching market prices for a
 * subset of the symbols.
 *
 * When a new instance bootstraps we need to divide the full list of symbols between the instances
 *
 * On bootstrap each instance will:
 *  - Load the full list of symbols from ManagerAPI
 *  - Push a list of all symbols to a Redis Hash set using (HASH A)
 *  - Publish its identifier to a Redis Hash with a 10s TTL (HASH B)
 *
 * Periodically (5s) each instance will:
 *  - Reload the full list of symbols from ManagerAPI and update the shared list of symbols (HASH A)
 *  - Refresh the TTL of its identifier (HASH B)
 *  - Fetch the list of instance workers along with the list of all symbols from Redis (HASH A + B)
 *  - Divide the symbols between all running instances to identify the subset for which it is responsible
 *  - Write its identifier to the symbols it will process for with a 10s TTL (HASH A)
 *  - Subscribe to the symbols is responsible for via manager API
 *  - Unsubscribe from any symbols it is no longer responsible for
 */
export class CtMarketPriceService {
  constructor(
    private readonly serializer: Serializer,
    private readonly redis: Redis,
  ) {}

  /** The logger to use for this service */
  readonly #logger = new Logger(this.constructor.name);

  /** Whether the service has been initialised */
  #isInit: boolean = false;

  /** The unique identifier for this instance */
  #id: string = randomUUID();

  /** A suffix to identify the server with */
  #suffix!: string;

  /** The manager API service */
  #managerApi: CtManagerApiService | undefined;

  /** The listener id for the market price subscription(s) */
  #listenerId: string | undefined;

  /** The list of symbols in cTrader */
  #symbols: Map<number, ProtoManagerSymbol> = new Map();

  /** The list of symbols this instance claimed */
  #claimedIds: number[] = [];

  /** Holds the heartbeat interval */
  #heartbeatInterval: NodeJS.Timeout | null = null;

  /** Holds the heartbeat interval */
  #symbolsInterval: NodeJS.Timeout | null = null;

  /** Whether the service has been initialised */
  get isInit(): boolean {
    return this.#isInit;
  }

  /**
   * Destroys the service
   */
  destroy(): void {
    // Clear the intervals
    if (this.#heartbeatInterval) clearInterval(this.#heartbeatInterval);
    if (this.#symbolsInterval) clearInterval(this.#symbolsInterval);

    // Remove the listener and unsubscribe from the symbols
    if (this.#listenerId) this.#managerApi?.removeListener(this.#listenerId);
    this.#managerApi
      ?.sendMessage<ProtoUnsubscribeSpotQuotesReq>(
        ProtoCSPayloadType.PROTO_UNSUBSCRIBE_SPOT_QUOTES_REQ,
        'ProtoUnsubscribeSpotQuotesReq',
        'ProtoUnsubscribeSpotQuotesRes',
        { symbolId: [this.#claimedIds.map((c) => Long.fromValue(c))] },
      )
      .catch(() => {});

    // Clear the claimed symbols
    this.#claimedIds = [];
    this.#isInit = false;
  }

  /**
   * Bootstraps the service
   * @param managerApi The manager API service
   * @param env The environment name
   * @param credentials The cTrader credentials object
   */
  async bootstrap(managerApi: CtManagerApiService, env: string, credentials: CTCredentials): Promise<void> {
    if (this.#isInit) {
      return;
    }

    const msg = `cTrader Market Prices bootstrapping (${env} - ${credentials.plant})`;
    this.#logger.debug(`${msg} - Start`);

    // Set the manager API service
    this.#managerApi = managerApi;

    // Create a suffix for this server
    this.#suffix = objectHash(`${credentials.plant}${credentials.managerApi.proxy}${env}`);

    // Initialize the heartbeat
    if (!this.#heartbeatInterval) {
      await this.#heartbeat();
      this.#heartbeatInterval = setInterval(this.#heartbeat.bind(this), 5_000);
    }

    // Refresh the symbols every 5 minutes
    if (!this.#symbolsInterval) {
      this.#symbolsInterval = setInterval(this.#fetchSymbols.bind(this), 300_000);
    }

    this.#isInit = true;
    this.#logger.debug(`${msg} - Complete`);
  }

  /**
   * Returns the latest market price for the given symbolId
   * @param symbolId The symbolId to get the price for
   * @throws UnknownSymbolException
   */
  async byId(symbolId: number): Promise<Tick | null> {
    const s = this.#symbols.get(symbolId);
    if (!s) {
      throw new UnknownSymbolException(symbolId.toString());
    }

    try {
      const data = await this.redis.hget(this.#key('prices'), symbolId.toString());
      return data ? this.serializer.unSerialize<Tick>(data) : null;
    } catch (err) {
      this.#logger.error(`Failed to get price for symbolId: ${symbolId}`, err);
      return null;
    }
  }

  /**
   * Returns the latest market price for the given symbol
   * @param symbol The symbol to get the price for
   * @throws UnknownSymbolException
   */
  async byName(symbol: string): Promise<Tick | null> {
    const s = Array.from(this.#symbols.values()).find((s) => s.name === symbol);
    if (!s) {
      throw new UnknownSymbolException(symbol);
    }

    try {
      const data = await this.redis.hget(this.#key('prices'), s.symbolId.toString());
      return data ? this.serializer.unSerialize<Tick>(data) : null;
    } catch (err) {
      this.#logger.error(`Failed to get price for symbol: ${symbol}`, err);
      return null;
    }
  }

  /**
   * Returns the latest market prices for all symbols
   */
  async all(): Promise<Map<string, Tick>> {
    const prices = new Map<string, Tick>();
    const symbols = Array.from(this.#symbols.values());

    try {
      const obj = await this.redis.hgetall(this.#key('prices'));
      for (const [k, v] of Object.entries(obj)) {
        const s = symbols.find((s) => s.symbolId.toString() === k);
        if (!v || !s) {
          continue;
        }

        const event = this.serializer.unSerialize<Tick>(v);
        if (event) prices.set(s.name, event);
      }
    } catch (err) {
      this.#logger.error(`Failed to get prices`, err);
    }

    return prices;
  }

  /**
   * Returns the list of all symbols in cTrader
   */
  async #fetchSymbols(): Promise<void> {
    try {
      // Fetch the data from the platform
      const data = await this.#managerApi?.sendMessage<ProtoManagerSymbolListRes>(
        ProtoCSPayloadType.PROTO_MANAGER_SYMBOL_LIST_REQ,
        'ProtoManagerSymbolListReq',
        'ProtoManagerSymbolListRes',
      );

      if (!data?.symbol) {
        return;
      }

      const result = new Map<number, ProtoManagerSymbol>();
      (data?.symbol || []).forEach((s) => {
        result.set(s.symbolId.toNumber(), s);
      });

      this.#symbols = result;
    } catch (err) {
      this.#logger.error('Failed to fetch cTrader symbols', err);
    }
  }

  /**
   * Determines the symbol ids this instance is responsible for
   */
  async #isResponsibleFor(): Promise<number[]> {
    // Get the full list of subscribers and symbols
    const symbols = await this.redis.smembers(this.#key('symbol-keys'));
    const workers = await this.redis.smembers(this.#key('worker-keys'));

    // If there are no workers or symbols, return
    if (!symbols.length || !workers.length) {
      return [];
    }

    // Chunk the symbols
    const size = Math.ceil(symbols.length / workers.length);
    const chunks = chunk(symbols, size);

    // Find the index of the current identifier
    const index = workers.sort().indexOf(this.#id);

    // Get the symbol Ids this instance is responsible for
    return chunks[index]?.map((s) => Number(s)) ?? [];
  }

  /**
   * The heartbeat function that synchronizes the state of this instance
   * and updates the subscriptions to the market prices
   */
  async #heartbeat(): Promise<void> {
    await this.#refreshKeySets();
    await this.#synchronise();
    await this.#updateSubscription();
  }

  /**
   * Refreshes the key sets to remove any expired keys
   */
  async #refreshKeySets(): Promise<void> {
    // Create a new pipeline
    const pipe = this.redis.pipeline();

    // Remove any expired symbols from the symbol keys
    const sKeys = await this.redis.smembers(this.#key('symbol-keys'));
    if (sKeys.length > 0) {
      const symbols = await this.redis.mget(sKeys.map((key) => `${this.#key('symbols')}:${key}`));
      sKeys.filter((s) => !symbols.includes(s)).forEach((s) => pipe.srem(this.#key('symbol-keys'), s));
    }

    // Remove any expired workers from the worker keys
    const wKeys = await this.redis.smembers(this.#key('worker-keys'));
    if (wKeys.length > 0) {
      const workers = await this.redis.mget(wKeys.map((key) => `${this.#key('workers')}:${key}`));
      wKeys.filter((w) => !workers.includes(w)).forEach((w) => pipe.srem(this.#key('worker-keys'), w));
    }

    try {
      await pipe.exec();
    } catch (err) {
      this.#logger.error('Refreshing key sets failed', err);
    }
  }

  /**
   * Synchronizes this instance with any other
   * active instances over redis
   */
  async #synchronise(): Promise<void> {
    // Fetch the cTrader symbols
    if (!this.#symbols.size) {
      await this.#fetchSymbols();
    }

    // Create a new pipeline
    const pipe = this.redis.pipeline();

    // Set or refresh the TTL of the identifier and store the worker key
    pipe.set(`${this.#key('workers')}:${this.#id}`, this.#id, 'EX', 10);
    pipe.sadd(this.#key('worker-keys'), this.#id);

    // Get the full list of symbol Ids we know about
    const sIds = Array.from(this.#symbols.keys());

    // Maintain the global list of symbols in cTrader
    sIds.forEach((sid) => pipe.set(`${this.#key('symbols')}:${sid}`, 0, 'EX', 10, 'NX'));

    // Maintain the global list of symbol keys
    if (sIds.length) pipe.sadd(this.#key('symbol-keys'), ...sIds);

    // Claim ownership of the symbols this instance is responsible for
    this.#claimedIds.forEach((cid) => pipe.set(`${this.#key('symbols')}:${cid}`, this.#id, 'EX', 10));

    try {
      await pipe.exec();
    } catch (err) {
      this.#logger.error('Synchronization failed', err);
    }
  }

  /**
   * Updates the subscriptions to the market prices
   */
  async #updateSubscription(): Promise<void> {
    // Get the symbols this instance is responsible for
    const symbolIds = await this.#isResponsibleFor();

    // Define a sort function
    const sortFn = (a: number, b: number) => Number(a) - Number(b);

    // Identify any required actions
    const add = symbolIds.filter((sid) => !this.#claimedIds.includes(sid)).sort(sortFn);
    const remove = this.#claimedIds.filter((sid) => !symbolIds.includes(sid)).sort(sortFn);

    // If there are no changes required, return
    if ((!add.length && !remove.length) || !this.#managerApi) {
      return;
    }

    // There is no way to check against the server what the active subscriptions are for any
    // given connection. Also, if a request to connect to multiple symbols is sent, if
    // any of the symbols in the list is already connected, the whole thing will fail.
    // Therefore, will connect to each symbol individually.

    const msg = `Updating market price subscriptions (${this.#managerApi?.details?.plant})`;
    this.#logger.debug(`${msg} - Start`);

    // Send the add requests
    for (const sid of Array.from(new Set(add).values())) {
      // Leave here for race conditions
      if (this.#claimedIds.includes(sid)) {
        continue;
      }

      try {
        await this.#managerApi?.sendMessage<ProtoSubscribeSpotQuotesReq>(
          ProtoCSPayloadType.PROTO_SUBSCRIBE_SPOT_QUOTES_REQ,
          'ProtoSubscribeSpotQuotesReq',
          'ProtoSubscribeSpotQuotesRes',
          { symbolId: [Long.fromValue(sid)] },
        );

        // Update claimed symbols
        this.#claimedIds = Array.from(new Set([...this.#claimedIds, sid]));
      } catch (err) {
        this.#logger.error(`${msg}. Add '${sid}' - Failed`, {
          err,
          claimed: JSON.stringify(this.#claimedIds),
        });

        if (this.#isAlreadySubscribedError(err)) {
          this.#claimedIds = Array.from(new Set([...this.#claimedIds, sid]));
        }
      }
    }

    // Send the remove requests
    for (const sid of Array.from(new Set(remove).values())) {
      // Leave here for race conditions
      if (!this.#claimedIds.includes(sid)) {
        continue;
      }

      try {
        await this.#managerApi?.sendMessage<ProtoUnsubscribeSpotQuotesReq>(
          ProtoCSPayloadType.PROTO_UNSUBSCRIBE_SPOT_QUOTES_REQ,
          'ProtoUnsubscribeSpotQuotesReq',
          'ProtoUnsubscribeSpotQuotesRes',
          { symbolId: [Long.fromValue(sid)] },
        );

        // Update claimed symbols
        this.#claimedIds = this.#claimedIds.filter((id) => id !== sid);
      } catch (err) {
        this.#logger.error(`${msg}. Remove '${sid}' - Failed`, {
          err,
          claimed: JSON.stringify(this.#claimedIds),
        });
      }
    }

    // Setup listeners
    this.#listenFor(this.#claimedIds);
    this.#logger.debug(`${msg} - Complete`, {
      add: JSON.stringify(add),
      remove: JSON.stringify(remove),
      claimed: JSON.stringify(this.#claimedIds),
    });
  }

  /**
   * Registers the listener for the market price subscriptions
   * @param symbolIds The symbol ids to listen for
   */
  #listenFor(symbolIds: number[]): void {
    // Remove the existing listener
    if (this.#listenerId) {
      this.#managerApi?.removeListener(this.#listenerId);
    }

    // Register a new listener
    const id = this.#managerApi?.addListener<ProtoSpotEvent>(
      ProtoPayloadType.PROTO_SERVER_SPOT_EVENT,
      'ProtoSpotEvent',
      async (result) => {
        //  If the symbolId is not in the list of symbolIds, return
        if (!symbolIds.includes(result.symbolId.toNumber())) {
          return;
        }

        // Get the symbolId
        const sId = result.symbolId.toNumber();

        try {
          const data = await this.redis.hget(this.#key('prices'), sId.toString());
          const curr = this.serializer.unSerialize<Tick>(data);

          // Prepare the timestamp
          let timestamp = DateTime.utc().toMillis();
          if (result.timestamp && result.timestamp?.toNumber() > 0) {
            timestamp = result.timestamp?.toNumber();
          }

          const bid = this.#toDigits(sId, result.bid) ?? curr?.bid;
          const ask = this.#toDigits(sId, result.ask) ?? curr?.ask;

          if (!bid || !ask) {
            return;
          }

          // Parse the result into a Price object
          const price: Tick = {
            bid,
            ask,
            high: this.#toDigits(sId, result.high) ?? curr?.high,
            low: this.#toDigits(sId, result.low) ?? curr?.low,
            timestamp,
          };

          //  Update the price cache
          const latest = this.serializer.serialize(price);
          await this.redis.hset(this.#key('prices'), result.symbolId.toString(), latest);
        } catch (err) {
          this.#logger.error(`Failed to update market price for ${result.symbolId}`, err);
        }
      },
    );

    if (id) this.#listenerId = id;
  }

  /**
   * Parses the number from the given Long value to the correct number of digits
   * for the symbol defined by the symbolId
   * @param symbolId The symbolId to get the digits for
   * @param value The value to parse
   */
  #toDigits(symbolId: number, value?: Long): number | undefined {
    if (!value || 0 === value.toNumber()) {
      return undefined;
    }

    const digits = this.#symbols.get(symbolId)?.digits;

    const val = value.toNumber() / 100_000;
    return digits ? Number(val.toFixed(digits)) : val;
  }

  /**
   * Returns the cache key for the given key
   * @param key The key to use
   */
  #key(key: string): string {
    return `{platforms}:cache:ct:market-prices:${key}:${this.#suffix}`;
  }

  /**
   * Checks if the error is due to the symbol already being subscribed
   * @param err The error to check
   */
  #isAlreadySubscribedError(err: unknown): boolean {
    if (!err) {
      return false;
    }

    if ('object' !== typeof err || !('cause' in err)) {
      return false;
    }

    if ('object' !== typeof err.cause || !err.cause || !('code' in err.cause)) {
      return false;
    }

    return 'ALREADY_SUBSCRIBED' === err.cause.code;
  }
}
