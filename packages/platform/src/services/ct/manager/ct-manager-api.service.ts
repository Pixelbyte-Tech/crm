import { join } from 'path';
import { randomUUID } from 'crypto';
import { connect, TLSSocket } from 'tls';

import Long from 'long';
import { set } from 'lodash';
import { Logger } from '@nestjs/common';
import { load, Root, Type, Buffer, Message } from 'protobufjs';

import { Cryptography } from '@crm/utils';
import { Platform, Monetisation } from '@crm/types';

import { CtErrorMapper } from '../../../mappers/error/ct-error.mapper';

import { CTCredentials, PlatformServer } from '../../../models';

import { CtMarketPriceService } from './ct-market-price-service';
import { CtManagerApiException } from './ct-manager-api.exception';
import {
  ProtoMessage,
  ProtoPayloadType,
  ProtoCSPayloadType,
  ProtoManagerAuthReq,
  ProtoManagerAuthRes,
} from './proto/base/ts';
import {
  PlatformException,
  UnparseableResponseException,
  UnsupportedOperationException,
  UnavailablePlatformServerException,
} from '../../../exceptions';

interface Handler<R = any> {
  responseType: string;
  callback: (result?: R, err?: Error) => void;
  promise: Promise<R>;
  timeout?: NodeJS.Timeout;
}

interface Listener<R = any> {
  id: string;
  payloadType: ProtoPayloadType;
  eventType: string;
  callback: (result: R) => void;
}

interface Opts {
  // Set to true if the instance will not be used for trading purposes (default false)
  noTrading?: boolean;
}

/**
 * @see https://docs.spotware.com/en/Managers_API
 */
export class CtManagerApiService {
  constructor(
    private readonly ctErrorMapper: CtErrorMapper,
    private readonly _ctMarketPriceService: CtMarketPriceService,
  ) {}

  /** The logger to use for this service */
  readonly #logger = new Logger(this.constructor.name);

  /** Whether the service has been initialised */
  #isInit: boolean = false;

  /** Stores the CommonMessages_External proto root */
  #baseCommonMsg!: Root;

  /** Stores the CSMessages_External proto root */
  #baseMsg!: Root;

  /** Stores the ReportingMessages proto root */
  #reportingMsg!: Root;

  /** Stores the socket connection */
  #connection!: TLSSocket;

  /** The initialisation options */
  #opts: Opts = {};

  /** A buffer holding the response data */
  #responseBuffer: Buffer = Buffer.from([]);

  /** Stores the total size of the expected response (across multiple messages) */
  #responseSize: number = 0;

  /** Whether the connection is authenticated */
  #isAuthenticated = false;

  /** The credentials to connect with */
  #credentials!: CTCredentials;

  /** The environment name */
  #env!: string;

  /** The plant name */
  #plant!: string;

  /** The heartbeat interval */
  #heartbeatInterval: NodeJS.Timeout | null = null;

  /** The handlers which take care of the responses */
  #handlers: Map<string, Handler> = new Map();

  /** Stores a list of listeners to execute when events are received */
  #listeners: Map<number, Listener[]> = new Map();

  /** Returns the details of the connection */
  get details(): { plant: string; proxy: string; environment: string } {
    return {
      plant: this.#credentials.plant,
      proxy: this.#credentials.managerApi.proxy,
      environment: this.#env,
    };
  }

  /** Whether the service has been initialised */
  get isInit(): boolean {
    return this.#isInit;
  }

  /** Whether the service can be used for trading */
  get isTrading(): boolean {
    return undefined === this.#opts.noTrading || !this.#opts.noTrading;
  }

  /**
   * Gives access to market prices services
   */
  async marketPrices(): Promise<CtMarketPriceService> {
    if (!this.isTrading) {
      return this._ctMarketPriceService;
    }

    while (!this._ctMarketPriceService.isInit) {
      await new Promise((r) => setTimeout(r, 10));
    }
    return this._ctMarketPriceService;
  }

  /**
   * Initializes the service
   * @see https://github.com/protobufjs/protobuf.js?tab=readme-ov-file#using-the-js-api
   */
  async bootstrap(server: PlatformServer<CTCredentials>, opts?: Opts): Promise<void> {
    if (this.#isInit) {
      return;
    }

    // Store the credentials and details
    this.#credentials = server.credentials;
    this.#env = Monetisation.DEMO === server.monetisation ? 'demo' : 'live';
    this.#plant = server.credentials.plant;

    // Prepare the log message
    const msg = `cTrader ManagerAPI (${this.#env} - ${this.#plant}) bootstrapping`;

    // Store the options
    this.#opts = opts ?? {};

    const base = `${__dirname}/platform/services/ct/manager/proto/`;

    try {
      const protoFiles = await Promise.all([
        load(join(base, 'base/CommonMessages_External.proto')),
        load(join(base, 'base/CSMessages_External.proto')),
        load(join(base, 'reporting/ReportingMessages.proto')),
      ]);

      // Store the roots
      this.#baseCommonMsg = protoFiles[0];
      this.#baseMsg = protoFiles[1];
      this.#reportingMsg = protoFiles[2];

      this.#logger.debug(`${msg} - Complete`);

      // Connect to the server
      this.#connect();
    } catch (err) {
      this.#logger.error(`${msg} - Failed`, err);
    }
  }

  /**
   * Sends a message to the cTrader server. This method allows for synchronous communication
   * to the Manager API byt returning a promise that resolves once the desired response
   * is received from the server.
   * @param payload The payload to send
   * @param payloadType The type of payload being sent
   * @param requestType The type of request being sent
   * @param responseType The type of response to expect
   * @param filter A filter to apply to the response(s) received
   * @param timeout The timeout for the request
   * @throws UnavailablePlatformServerException If the server is not available
   */
  async sendMessage<R = any>(
    payloadType: ProtoCSPayloadType | ProtoPayloadType,
    requestType: string,
    responseType?: string,
    payload: Record<string, any> = {},
    filter?: (result: R) => boolean,
    timeout: number = 10_000,
  ): Promise<R> {
    // Wait for the connection to be established
    const counter = 0;
    while (!this.#isAuthenticated && ProtoCSPayloadType.PROTO_MANAGER_AUTH_REQ !== payloadType) {
      if (counter > 100) {
        throw new UnavailablePlatformServerException(this.#credentials.managerApi.proxy);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const msgId: string = randomUUID();

    // Prepare the promise to return once the response is received
    const promise = this.#prepareCallback<R>(msgId, timeout, responseType, filter);

    // Prepare the request
    const reqType = this.#lookupType(requestType);
    set(payload, 'payloadType', payloadType);

    // Prepare the message to send
    const encoded = reqType.encode(reqType.fromObject(payload)).finish();
    const message = this.#prepareMessage(payloadType, encoded, msgId);

    // Send the message
    this.#connection.write(message, (err?: Error) => {
      if (err) {
        this.#logger.error(`cTrader ManagerAPI (${this.#env} - ${this.#plant}) ${requestType} - Failed`, err);
        this.#handlers.get(msgId)?.callback(undefined, err);
      }
    });

    return promise;
  }

  /**
   * Registers a listener for a given event type returning an id to
   * reference the listener by.
   * @param payloadType The event type to listen for
   * @param eventType The expected payload type of the event
   * @param callback The callback to execute when the event is received
   */
  addListener<R = any>(payloadType: ProtoPayloadType, eventType: string, callback: (result: R) => void): string {
    const id = randomUUID();

    // Add the listener
    const values = this.#listeners.get(payloadType) ?? [];
    if (!values.length) {
      this.#listeners.set(payloadType, values);
    }

    values.push({ id, payloadType, eventType, callback });
    return id;
  }

  /**
   * Removes an existing listener
   * @param id The id of the listener to remove
   */
  removeListener(id: string): void {
    for (const [i, listeners] of this.#listeners.entries()) {
      const values = listeners.filter((l) => l.id !== id);

      if (values.length) {
        this.#listeners.set(i, values);
      } else {
        this.#listeners.delete(i);
      }
    }
  }

  /**
   * Decodes a message from the server to the given type
   * @param messageType The type of message to decode to
   * @param content The content to decode
   * @throws UnparseableResponseException If the content cannot be decoded to the given messageType
   * @throws UnsupportedOperationException If the messageType does not exist on the server
   */
  decode(messageType: string, content: Buffer): Message {
    const type = this.#lookupType(messageType);
    return this.#decode(content, type);
  }

  /**
   * Connects to the cTrader server
   * @see https://nodejs.org/api/net.html#net_class_net_socket
   */
  #connect(): void {
    // Prepare the connection
    this.#connection = connect({
      port: this.#credentials.managerApi.proxyPort,
      host: this.#credentials.managerApi.proxy,
      rejectUnauthorized: false,
    });

    const msg = `cTrader ManagerAPI (${this.#env} - ${this.#plant})`;
    this.#logger.log(`${msg} - Created`);

    // Reset the response buffer
    this.#responseSize = 0;
    this.#responseBuffer = Buffer.from([]);

    // Handle callbacks
    this.#connection.on('data', (data: Buffer) => {
      // Pass the data to the response generator
      const response = this.#generateResponse(data);
      if (!response) {
        return;
      }

      try {
        const decoded = this.#decode(this.#responseBuffer, this.#lookupType('ProtoMessage'));
        this.#processCallback(decoded);
        this.#processListeners(decoded);
      } catch (err) {
        this.#logger.error(`${msg} - Data Error`, err);
      } finally {
        this.#responseSize = 0;
      }
    });

    this.#connection.on('close', () => {
      setTimeout(() => this.#connect(), 500);

      this.#logger.warn(`${msg} - Disconnected`);
      this.#isAuthenticated = false;

      // Destroy the market price service
      if (this.isTrading) {
        this._ctMarketPriceService.destroy();
      }
    });

    this.#connection.on('end', () => {
      this.#logger.warn(`${msg} - Remotely Terminated`);
      this.#connection.destroy(); // Triggers the close event
    });

    this.#connection.on('error', (err: any) => {
      this.#logger.error(`${msg} - Error`, err);
      this.#connection.destroy(); // Triggers the close event
    });

    this.#connection.on('connectionAttemptFailed', (err: any) => {
      this.#logger.error(`${msg} - Connection Timeout`, err);
      this.#connection.destroy(); // Triggers the close event
    });

    this.#connection.on('timeout', (err: any) => {
      this.#logger.error(`${msg} - Timeout`, err);
      this.#connection.destroy(); // Triggers the close event
    });

    this.#connection.on('connect', async () => {
      this.#logger.log(`${msg} - Connected`);
      if (!(await this.#authenticate())) {
        this.#connection.destroy(); // Triggers the close event
        return;
      }

      this.#setHeartbeatInterval();

      // Bootstrap the market price service
      if (this.isTrading) {
        await this._ctMarketPriceService.bootstrap(this, this.#env, this.#credentials);
      }

      // Track the initialisation
      this.#isInit = true;
    });
  }

  /**
   * Prepares the callback which is linked to the message id
   * @param msgId The message id to link the callback to
   * @param timeout The timeout for the request
   * @param responseType The type of response to expect
   * @param filter A filter to apply to the response(s) received
   */
  #prepareCallback<R>(
    msgId: string,
    timeout: number,
    responseType?: string,
    filter?: (result: R) => boolean,
  ): Promise<R> {
    if (!responseType) {
      return new Promise((r) => r(true as R));
    }

    // Initialise the promise
    let promiseResolve: (value: R | PromiseLike<R>) => void;
    let promiseReject: (reason?: any) => void;

    const promise = new Promise<R>((resolve, reject) => {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    // Initialise a handler
    const handler: Handler = {
      responseType,
      promise,
      callback: (response, err) => {
        if (err) {
          promiseReject(err);
          this.#cleanup(msgId);
          return;
        }

        // Check if the response should be filtered out
        if (filter && response && !filter(response)) {
          return;
        }

        promiseResolve(response);
        this.#cleanup(msgId);
      },
      timeout: setTimeout(() => {
        const err = new UnavailablePlatformServerException(this.#credentials.managerApi.proxy);
        this.#handlers.get(msgId)?.callback(undefined, err);
      }, timeout),
    };

    // Assign the handler to the message id
    this.#handlers.set(msgId, handler);

    return promise;
  }

  /**
   * Process the callback linked to the message provided
   * @param message The message to process
   */
  #processCallback(message: Message<ProtoMessage>): void {
    let payload: Buffer | undefined;
    let clientMsgId: string | undefined;
    let payloadType: number | undefined;

    // Extract the message details
    if ('payload' in message) {
      payload = message.payload as Buffer;
    }
    if ('clientMsgId' in message) {
      clientMsgId = message.clientMsgId as string;
    }
    if ('payloadType' in message) {
      payloadType = message.payloadType as number;
    }

    if (!clientMsgId || !payloadType) {
      return;
    }

    // Check for a handler
    const handler = this.#handlers.get(clientMsgId);
    if (!handler) {
      return;
    }

    // If there is no payload, we can stop here
    if (!payload) {
      handler.callback(undefined, new UnparseableResponseException(handler.responseType));
      return;
    }

    // Prepare the log message
    const msg = `cTrader ManagerAPI (${this.#env} - ${this.#plant}) ${handler.responseType} - RES ${clientMsgId}`;

    // Check for errors
    const errorTypes = [ProtoPayloadType.ERROR_RES, ProtoCSPayloadType.PROTO_ORDER_ERROR_EVENT];
    const isError = errorTypes.includes(payloadType);

    // Find the correct message type to decode
    const type: Type = isError ? this.#lookupType('ProtoErrorRes') : this.#lookupType(handler.responseType);

    try {
      if (!isError) {
        // Execute the callback with the JSON response
        handler.callback(this.#decode(payload, type));
        return;
      }

      // Handle response errors
      const err = type.decode(payload).toJSON();
      this.#logger.error(msg, { code: err.errorCode, description: err?.description });

      // Prepare the exception and execute the callback
      const exception = new CtManagerApiException(err.errorCode, err?.description, err);
      handler.callback(undefined, this.ctErrorMapper.mapManagerApiError(exception));
    } catch (err) {
      // Verify the message
      const reason = type.verify(payload);

      // Log the error and execute the callback
      this.#logger.error(msg, { err, reason });
      handler.callback(undefined, err as Error);
    } finally {
      this.#cleanup(clientMsgId);
    }
  }

  /**
   * Process any listeners linked to the message provided
   * @param message The message to process
   */
  #processListeners(message: Message<ProtoMessage>): void {
    let payload: Buffer | undefined;
    let payloadType: number | undefined;

    // Extract the message details
    if ('payload' in message) {
      payload = message.payload as Buffer;
    }
    if ('payloadType' in message) {
      payloadType = message.payloadType as number;
    }

    if (!payloadType || !payload || ProtoPayloadType.ERROR_RES === payloadType) {
      return;
    }

    // Check for any applicable listeners
    const listeners = this.#listeners.get(payloadType) ?? [];
    if (!listeners.length) {
      return;
    }

    // Find the correct message type(s) to decode
    const types: string[] = [...new Set(listeners.map((l) => l.eventType))];

    // Process the listeners
    for (const t of types) {
      const type: Type = this.#lookupType(t);
      const l = listeners.filter((l) => t === l.eventType);

      try {
        const data = this.#decode(payload, type);
        l.forEach((l) => l.callback(data));
      } catch (err) {
        // Verify the message and log the error
        const reason = type.verify(payload);
        this.#logger.error(`cTrader ManagerAPI (${this.#env} - ${this.#plant}) ${t} - EVENT`, {
          err,
          reason,
        });
      }
    }
  }

  /**
   * Given a buffer, accumulates data until a complete response is created
   * and returns that response as a buffer for decoding
   * @param data The data to process
   */
  #generateResponse(data: Buffer): Buffer | undefined {
    // When response size is 0 we are starting a new buffer
    if (!this.#responseSize) {
      // Get the size of the expected full response
      const size = Buffer.from(data).subarray(0, 4).readUInt32BE(0);

      // Remove the first 4 bytes from the data (this is the total response size)
      data = Buffer.from(data.subarray(4, data.length));

      // Initialise
      this.#responseBuffer = Buffer.from([]);
      this.#responseSize = size;
    }

    // If the data is less than the expected total response size
    // We append the data to the buffer
    if (data.length + this.#responseBuffer.length <= this.#responseSize) {
      this.#responseBuffer = Buffer.concat([this.#responseBuffer, data]);
    }

    // This case should never occur, but if the buffer is larger
    // than the expected size we should track and handle it
    if (this.#responseBuffer.length > this.#responseSize) {
      this.#logger.error(`cTrader ManagerAPI (${this.#env} - ${this.#plant}) buffer overflow`, {
        bufferHex: Buffer.from(this.#responseBuffer).toString('hex'),
        bufferSize: this.#responseBuffer.length,
        expectedSize: this.#responseSize,
      });

      this.#connection?.destroy(); // Triggers the close event
    }

    // Once the total response size is reached we can return the buffer
    return this.#responseBuffer.length === this.#responseSize ? this.#responseBuffer : undefined;
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

  /**
   * Removes internal references to processed messages
   * @param msgId The message id to clean up
   */
  #cleanup(msgId: string): void {
    // It is important to give some time before cleaning up the handler
    setTimeout(() => {
      const timeout = this.#handlers.get(msgId)?.timeout;
      if (timeout) {
        clearTimeout(timeout);
      }

      this.#handlers.delete(msgId);
    }, 5000);
  }

  /**
   * Returns a message object of the given type
   * @param type The type of message to lookup
   * @throws UnsupportedOperationException If the message type is not found
   */
  #lookupType(type: string): Type {
    let obj: Type | undefined = undefined;

    try {
      obj = this.#baseMsg.lookupType(type);
    } catch {
      try {
        obj = this.#baseCommonMsg.lookupType(type);
      } catch {
        try {
          obj = this.#reportingMsg.lookupType(type);
        } catch {
          throw new UnsupportedOperationException(Platform.CT);
        }
      }
    }

    return obj;
  }

  /**
   * Prepares the message to be sent
   * @param payloadType The payload type
   * @param buffer The buffer to be sent
   * @param msgId An optional message id to use
   */
  #prepareMessage(payloadType: ProtoCSPayloadType | ProtoPayloadType, buffer?: Buffer, msgId?: string): Buffer {
    const payload = {
      payloadType,
      ...(buffer ? { payload: buffer } : {}),
      ...(msgId ? { clientMsgId: msgId } : {}),
    };

    // Prepare the message
    const ProtoMessage = this.#lookupType('ProtoMessage');
    const message = ProtoMessage.encode(ProtoMessage.fromObject(payload)).finish();

    // Prepare the message length
    const b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, message.length);

    // Prepend the message length to the message
    return Buffer.concat([new Uint8Array(b), message]);
  }

  /**
   * Authenticates with the cTrader server. This is required to establish a connection
   * and send/receive messages. This method will be called automatically when the connection
   * is established.
   */
  async #authenticate(): Promise<boolean> {
    if (this.#isAuthenticated) {
      return true;
    }

    const payload: ProtoManagerAuthReq = {
      plantId: this.#credentials.plant,
      environmentName: this.#env,
      login: Long.fromValue(this.#credentials.username.toString()),
      passwordHash: Cryptography.hashMd5(this.#credentials.password),
    };

    const msg = `cTrader ManagerAPI (${this.#env}) auth`;

    try {
      // Send the authentication request
      await this.sendMessage<ProtoManagerAuthRes>(
        ProtoCSPayloadType.PROTO_MANAGER_AUTH_REQ,
        'ProtoManagerAuthReq',
        'ProtoManagerAuthRes',
        payload,
      );

      // Track the authentication status
      this.#isAuthenticated = true;
      this.#logger.log(`${msg} - Complete`);
      return true;
    } catch (err) {
      this.#logger.error(`${msg} - Failed`, err);
      return false;
    }
  }

  /**
   * Starts the heartbeat interval if it's not already running
   * This is required to maintain the connection
   */
  #setHeartbeatInterval(): void {
    if (this.#heartbeatInterval) {
      return;
    }

    this.#heartbeatInterval = setInterval(() => {
      this.#connection.write(
        this.#prepareMessage(ProtoPayloadType.HEARTBEAT_EVENT),
        (err?: Error) => err && this.#logger.error(`cTrader ManagerAPI (${this.#env}) heartbeat - Failed`, err),
      );
    }, 20_000);
  }
}
