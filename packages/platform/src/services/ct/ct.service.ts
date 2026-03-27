// Other
import Long from 'long';
import Redis from 'ioredis';
import { chunk } from 'lodash';
import { DateTime } from 'luxon';
import { Cache } from '@nestjs/cache-manager';

import { Cryptography } from '@crm/utils';
import { Platform, Monetisation } from '@crm/types';

import { CtErrorMapper } from '../../mappers/error/ct-error.mapper';
import { OrderMapper } from '../../mappers/response/ct/order.mapper';
import { SymbolMapper } from '../../mappers/response/ct/symbol.mapper';
import { TraderMapper } from '../../mappers/response/ct/trader.mapper';
import { HolidayMapper } from '../../mappers/response/ct/holiday.mapper';
import { CtRequestMapper } from '../../mappers/request/ct-request.mapper';
import { OrderReqMapper } from '../../mappers/request/ct/order-req.mapper';
import { PositionMapper } from '../../mappers/response/ct/position.mapper';
import { TrendbarMapper } from '../../mappers/response/ct/trendbar.mapper';
import { CtResponseMapper } from '../../mappers/response/ct-response.mapper';
import { TraderReqMapper } from '../../mappers/request/ct/trader-req.mapper';
import { BalanceReqMapper } from '../../mappers/request/ct/balance-req.mapper';
import { PositionReqMapper } from '../../mappers/request/ct/position-req.mapper';
import { TrendbarReqMapper } from '../../mappers/request/ct/trendbar-req.mapper';
import { TraderGroupMapper } from '../../mappers/response/ct/trader-group.mapper';

import { Bar } from '../../models';
import { Order } from '../../models';
import { Symbol } from '../../models';
import { Account } from '../../models';
import { Position } from '../../models';
import { RiskPlan } from '../../models';
import { UserGroup } from '../../models';
import { SpreadGroup } from '../../models';
import { JournalEntry } from '../../models';
import { AccountResult } from '../../models';
import { TradingHoliday } from '../../models';
import { PasswordResult } from '../../models';
import { CommissionGroup } from '../../models';
import { TradingSessions } from '../../models';
import { TotalOnlineUsers } from '../../models';
import { UpdateOrderResult } from '../../models';
import { ClosePositionResult } from '../../models';
import { UpdatePositionResult } from '../../models';
import { CloseAllTradesResult } from '../../models';
import { CancelAllOrdersResult } from '../../models';
import { Balance, BalanceOperation } from '../../models';
import { UserGroupAggregateBalance } from '../../models';
import { CTCredentials, PlatformServer } from '../../models';

import { CtCtid } from '../../types/ct/user/ctid.type';
import { CtTrader } from '../../types/ct/account/account.type';
import { CtTraderGroup } from '../../types/ct/account/group.type';

import { AbstractCtService } from './abstract.ct.service';
import { CtManagerApiService } from './manager/ct-manager-api.service';
import { CtSnapshotApiService } from './snapshot/ct-snapshot-api.service';
import { CircuitBreakerAxios } from '../internal/circuit-breaker-axios.service';

import { OpenOrderDto } from '../../dto/open-order.dto';
import { UserGroupDto } from '../../dto/user-group.dto';
import { AddHolidayDto } from '../../dto/add-holiday.dto';
import { UpdateOrderDto } from '../../dto/update-order.dto';
import { OpenPositionDto } from '../../dto/open-position.dto';
import { UpdateHolidayDto } from '../../dto/update-holiday.dto';
import { DeleteHolidayDto } from '../../dto/delete-holiday.dto';
import { UpdatePasswordDto } from '../../dto/update-password.dto';
import { UpdatePositionDto } from '../../dto/update-position.dto';
import { CreateAccountDto, CtAdditionalCreateAccountData } from '../../dto/create-account.dto';
import { UpdateAccountDto, CtAdditionalUpdateAccountData } from '../../dto/update-account.dto';

import { PlatformService } from '../platform-service.interface';
import {
  ActionRejectedException,
  UnknownPositionException,
  UnsupportedOperationException,
  UnprocessableResponseException,
  UnavailablePlatformServerException,
} from '../../exceptions';
import {
  ProtoDealStatus,
  ProtoCrudOperation,
  ProtoCrudTraderRes,
  ProtoCSPayloadType,
  ProtoExecutionType,
  ProtoExecutionEvent,
  ProtoPositionStatus,
  ProtoPositionListRes,
  ProtoTrendbarListRes,
  ProtoChangeBalanceRes,
  ProtoAssetClassListRes,
  ProtoManagerLightTrader,
  ProtoPendingOrderListRes,
  ProtoManagerSymbolListRes,
  ProtoManagerChangeBonusRes,
  ProtoPositionDetailsLiteRes,
  ProtoChangeTraderPasswordRes,
  ProtoManagerLightTraderListRes,
} from './manager/proto/base/ts';

/**
 * @see https://docs.spotware.com/en/v2/webservices_API
 */
export class CtService extends AbstractCtService implements PlatformService {
  constructor(
    readonly axios: CircuitBreakerAxios,
    readonly _server: PlatformServer<CTCredentials>,
    readonly cache: Cache,
    readonly redis: Redis,
    readonly resMapper: CtResponseMapper,
    readonly reqMapper: CtRequestMapper,
    readonly errorMapper: CtErrorMapper,
    private readonly _managerApi: CtManagerApiService,
    private readonly _snapshotApi: CtSnapshotApiService,
  ) {
    super(axios, _server, cache, redis, resMapper, reqMapper, errorMapper);

    // Bootstrap the manager and snapshot APIs
    void this._managerApi.bootstrap(this._server);
    void this._snapshotApi.bootstrap(this._server);
  }

  /** Returns the Manager API client for cTrader */
  get managerApi(): CtManagerApiService {
    return this._managerApi;
  }

  /** Returns the Manager API client for cTrader */
  get snapshotApi(): CtSnapshotApiService {
    return this._snapshotApi;
  }

  /**
   * Basic health check on platform API
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.axios.get<CtTraderGroup[]>('/v2/webserv/tradergroups', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the total number of online users on the platform
   * This number is calculated across all brands
   */
  onlineTotal(): Promise<TotalOnlineUsers> {
    throw new UnsupportedOperationException(Platform.CT);
  }

  /**
   * Returns a list of platform logs for the given time period
   * @param _startSecUTC The start time in UTC seconds
   * @param _endSecUTC The end time in UTC seconds
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getJournal(_startSecUTC: number, _endSecUTC: number): Promise<JournalEntry[]> {
    throw new UnsupportedOperationException(Platform.CT);
  }

  // Settings
  /////////////////////////////////////////////////////////////////////////

  /**
   * Returns a user group from the platform based on the given userGroupId
   * @param userGroupId The user group id to get the group for
   * @throws PlatformException
   */
  async getUserGroup(userGroupId: string): Promise<UserGroup | null> {
    const { data } = await this.axios.get<{ traderGroup: CtTraderGroup[] }>('/v2/webserv/tradergroups');

    const group = data.traderGroup?.find((t) => t.id === Number(userGroupId));
    return group ? this.resMapper.get<TraderGroupMapper>('TraderGroupMapper').toUserGroup(group) : null;
  }

  /**
   * Returns the aggregate balances for the given user group
   * @param _userGroupId The user group id to get the balances for
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getUserGroupAggregateBalances(_userGroupId: string): Promise<UserGroupAggregateBalance[]> {
    throw new UnsupportedOperationException(Platform.CT);
  }

  /**
   * Returns the list of user groups configured and available for the platform
   * @param filter Filter the groups by the given string, e.g. (OSP)
   * @throws PlatformException
   */
  async getUserGroups(filter?: string): Promise<UserGroup[]> {
    const { data } = await this.axios.get<{ traderGroup: CtTraderGroup[] }>('/v2/webserv/tradergroups');

    let groups = data.traderGroup ?? [];
    if (filter) {
      groups = groups.filter((t) => t.name.startsWith(filter));
    }

    return this.resMapper.get<TraderGroupMapper>('TraderGroupMapper').toUserGroups(groups);
  }

  /**
   * Returns the list of user commission groups configured and available for the platform
   * @param filter Filter the groups by the given string, e.g. (OSP)
   * @throws PlatformException
   */
  async getCommissionGroups(filter?: string): Promise<CommissionGroup[]> {
    return (await this.getUserGroups(filter)).map(
      (u) =>
        new CommissionGroup({
          name: u.name,
          platformGroupId: u.platformGroupId,
          currency: u.currency,
        }),
    );
  }

  /**
   * Returns the list of user spread groups configured and available for the platform
   * @param filter Filter the groups by the given string, e.g. (OSP)
   * @throws PlatformException
   */
  async getSpreadGroups(filter?: string): Promise<SpreadGroup[]> {
    return (await this.getUserGroups(filter)).map(
      (u) => new SpreadGroup({ name: u.name, platformGroupId: u.platformGroupId }),
    );
  }

  /**
   * The concept of risk plans does not exist on CT
   * @throws UnsupportedOperationException
   */
  getRiskPlans(): Promise<RiskPlan[]> {
    throw new UnsupportedOperationException(Platform.CT);
  }

  // Charts
  /////////////////////////////////////////////////////////////////////////

  /**
   * Gets a set of 1 minute bars (chart candles) for the given symbol
   * between the given from and to timestamps.
   * Returns the timestamps in UTC seconds.
   * @param symbol The symbol to get the candles for
   * @param startSecUTC The start time in UTC seconds for the candles
   * @param endSecUTC The end time in UTC seconds for the candles
   * @throws PlatformException
   */
  async get1MBars(symbol: string, startSecUTC: number, endSecUTC: number): Promise<Bar[]> {
    // Query the Manager API for the symbolId
    const res = await this._managerApi.sendMessage<ProtoTrendbarListRes>(
      ProtoCSPayloadType.PROTO_TRENDBAR_LIST_REQ,
      'ProtoTrendbarListReq',
      'ProtoTrendbarListRes',
      await this.reqMapper
        .get<TrendbarReqMapper>('TrendbarReqMapper')
        .toTrendbarListReq(symbol, startSecUTC, endSecUTC, this._managerApi, this.utcSecToServerSec.bind(this)),
    );

    return await this.resMapper.get<TrendbarMapper>('TrendbarMapper').toBars(res.trendbar, symbol, this._managerApi);
  }

  /**
   * Gets a set of 1 minute bars (chart candles) for the given symbols
   * between the given from and to timestamps.
   * Returns the timestamps in UTC seconds.
   * @param symbols The symbols to get the candles for
   * @param startSecUTC The start time in UTC seconds for the candles
   * @param endSecUTC The end time in UTC seconds for the candles
   * @throws PlatformException
   */
  async get1MBarsForMultipleSymbols(symbols: string[], startSecUTC: number, endSecUTC: number): Promise<Bar[]> {
    const bars: Bar[] = [];

    const tasks: Promise<Bar[]>[] = symbols.map((s) => this.get1MBars(s, startSecUTC, endSecUTC));
    for (const task of await Promise.allSettled(tasks)) {
      if ('rejected' === task.status) {
        continue;
      }
      bars.push(...task.value);
    }

    return bars;
  }

  // Accounts
  /////////////////////////////////////////////////////////////////////////

  /**
   * Creates a new account on the platform
   * @param dto The details to create the account with
   * @param group The group to create the account in
   * @throws PlatformException
   */
  async createAccount(
    dto: CreateAccountDto<CtAdditionalCreateAccountData>,
    group: UserGroupDto,
  ): Promise<AccountResult> {
    // Create the Trader Account
    const trader = await this._managerApi.sendMessage<ProtoCrudTraderRes>(
      ProtoCSPayloadType.PROTO_CRUD_TRADER_REQ,
      'ProtoCrudTraderReq',
      'ProtoCrudTraderRes',
      {
        operation: ProtoCrudOperation.PROTO_CREATE,
        trader: await this.reqMapper
          .get<TraderReqMapper>('TraderReqMapper')
          .toProtoTrader(this._managerApi, dto, this._server.credentials.brokerName, group.id),
      },
    );

    // Find the new trader's login
    const data = await this._managerApi.sendMessage<ProtoManagerLightTraderListRes>(
      ProtoCSPayloadType.PROTO_MANAGER_LIGHT_TRADER_LIST_REQ,
      'ProtoManagerLightTraderListReq',
      'ProtoManagerLightTraderListRes',
      {
        groupId: Long.fromValue(group.id),
        fromTimestamp: Long.fromValue(DateTime.utc().minus({ minute: 5 }).toMillis()),
        toTimestamp: Long.fromValue(DateTime.utc().plus({ minute: 5 }).toMillis()),
      },
    );

    // If the trader login is not found, delete the account and throw an exception
    const lightTrader: ProtoManagerLightTrader | undefined = data.trader.find(
      (t) => t.traderId.toNumber() === trader.traderId.toNumber(),
    );

    if (!lightTrader) {
      await this.deleteAccount(trader.traderId.toString());
      throw new UnavailablePlatformServerException(this._server.endpoint);
    }

    // Create a CTID for the account (User)
    const { data: ctCtid } = await this.axios.post<CtCtid>(`/cid/ctid/create`, {
      brokerName: this._server.credentials.brokerName,
      email: dto.email.toLowerCase().trim(),
      preferredLanguage: dto.language.slice(0, 2).toLowerCase(),
    });

    // Link the CTID to the account
    await this.axios.post(`/cid/ctid/link`, {
      traderLogin: lightTrader.login.toNumber(),
      traderPasswordHash: Cryptography.hashMd5(dto.password),
      userId: ctCtid.userId,
      brokerName: this._server.credentials.brokerName,
      environmentName: Monetisation.DEMO === this._server.monetisation ? 'demo' : 'live',
      returnAccountDetails: false,
    });

    return this.resMapper.get<TraderMapper>('TraderMapper').toAccountResult(lightTrader, ctCtid, dto.password);
  }

  /**
   * Returns the commission group associated with the given account id
   * @param platformAccountId The account id to get the commission group for
   * @throws PlatformException
   */
  async getAccountCommissionGroup(platformAccountId: string): Promise<CommissionGroup | null> {
    const trader = await this.reqMapper
      .get<TraderReqMapper>('TraderReqMapper')
      .toProtoTraderById(this._managerApi, platformAccountId);

    // Then get the commission groups and find the one associated with the account
    const commissionGroups = await this.getCommissionGroups();
    const group = commissionGroups.find((g) => g.platformGroupId.toString() === trader.groupId.toString());

    return group ?? null;
  }

  /**
   * Returns the account associated with the given platformAccountId
   * @param platformAccountId The account id to fetch
   * @throws PlatformException
   */
  async getAccount(platformAccountId: string): Promise<Account> {
    // Get the full trader details
    const trader = await this.reqMapper
      .get<TraderReqMapper>('TraderReqMapper')
      .toProtoTraderById(this._managerApi, platformAccountId);

    return await this.resMapper.get<TraderMapper>('TraderMapper').toAccount(this._managerApi, trader);
  }

  /**
   * Returns the accounts associated with the given account ids
   * @param platformAccountId The account ids to fetch
   * @throws PlatformException
   */
  async getAccounts(platformAccountId: string[]): Promise<Account[]> {
    // We will fetch all the accounts in parallel
    const tasks: Promise<Account>[] = [];
    for (const id of platformAccountId) {
      tasks.push(this.getAccount(id));
    }

    const result: Account[] = [];
    for (const task of await Promise.allSettled(tasks)) {
      if ('rejected' === task.status) {
        continue;
      }
      result.push(task.value);
    }

    return result;
  }

  /**
   * Used to update an account's details on the platform
   * @param dto The details to update
   * @param platformAccountId The account id to update
   * @throws PlatformException
   */
  async updateAccount(
    dto: UpdateAccountDto<CtAdditionalUpdateAccountData>,
    platformAccountId: string,
  ): Promise<boolean> {
    // Get the full trader details
    const trader = await this.reqMapper
      .get<TraderReqMapper>('TraderReqMapper')
      .toProtoTraderById(this._managerApi, platformAccountId);

    // Update the Trader Account
    const res = await this._managerApi.sendMessage<ProtoCrudTraderRes>(
      ProtoCSPayloadType.PROTO_CRUD_TRADER_REQ,
      'ProtoCrudTraderReq',
      'ProtoCrudTraderRes',
      {
        operation: ProtoCrudOperation.PROTO_UPDATE,
        trader: this.reqMapper.get<TraderReqMapper>('TraderReqMapper').toProtoTraderUpdate(trader, dto),
      },
    );

    return res.traderId.toString() === platformAccountId;
  }

  /**
   * Updates an account's password on the platform
   * @param dto The details to update
   * @param platformAccountId The account id to update
   * @throws PlatformException
   */
  async updateAccountPassword(dto: UpdatePasswordDto, platformAccountId: string): Promise<PasswordResult> {
    // If no password is provided, we do nothing
    if (!dto?.password) {
      return {};
    }

    // Update the Trader Password
    await this._managerApi.sendMessage<ProtoChangeTraderPasswordRes>(
      ProtoCSPayloadType.PROTO_CHANGE_TRADER_PASSWORD_REQ,
      'ProtoChangeTraderPasswordReq',
      'ProtoChangeTraderPasswordRes',
      {
        traderId: Long.fromValue(platformAccountId),
        hashedPassword: Cryptography.hashMd5(dto.password),
      },
    );

    return { master: true };
  }

  /**
   * Deletes an account from the platform. The user to which the account belongs
   * will be deleted as well.
   * @param platformAccountId The account id to delete
   * @throws PlatformException
   */
  async deleteAccount(platformAccountId: string): Promise<boolean> {
    // Delete the trader account
    await this._managerApi.sendMessage<ProtoCrudTraderRes>(
      ProtoCSPayloadType.PROTO_CRUD_TRADER_REQ,
      'ProtoCrudTraderReq',
      'ProtoCrudTraderRes',
      {
        operation: ProtoCrudOperation.PROTO_DELETE,
        trader: { traderId: Long.fromValue(platformAccountId) },
      },
    );

    return true;
  }

  // Balances
  /////////////////////////////////////////////////////////////////////////

  /**
   * Fetches the balance from the platform for a given account
   * @param platformAccountId The account id to fetch the balance for
   * @throws PlatformException
   */
  async getBalance(platformAccountId: string): Promise<Balance> {
    const login = await this.reqMapper
      .get<TraderReqMapper>('TraderReqMapper')
      .toLoginByTraderId(this._managerApi, platformAccountId);

    const { data } = await this.axios.get<CtTrader>(`/v2/webserv/traders/${login}`);

    return this.resMapper.get<TraderMapper>('TraderMapper').toBalance(platformAccountId, data);
  }

  /**
   * Fetches the balance from the platform for a given set of accounts
   * @param platformAccountIds The account ids to fetch the balance for
   * @throws PlatformException
   */
  async getBalances(platformAccountIds: string[]): Promise<Balance[]> {
    const balances: Balance[] = [];

    // Make the Ids unique
    platformAccountIds = [...new Set(platformAccountIds)];

    // Chunk into groups of 50
    const chunks = chunk(platformAccountIds, 50);

    for (const chunk of chunks) {
      const tasks: Promise<Balance>[] = [];
      for (const platformAccountId of chunk) {
        tasks.push(this.getBalance(platformAccountId));
      }

      for (const task of await Promise.allSettled(tasks)) {
        if ('rejected' === task.status) {
          continue;
        }
        balances.push(task.value);
      }
    }

    return balances;
  }

  /**
   * Updates an account's balance in the platform
   * @param operation The operation to perform on the balance
   * @param amount The value by which to alter the account balance, positive or negative
   * @param comment The comment to add to the transaction
   * @param platformAccountId The account id to update the balance for
   * @param referenceId The reference id to associate with the transaction
   * @throws PlatformException
   */
  async updateBalance(
    operation: BalanceOperation,
    amount: number,
    comment: string,
    platformAccountId: string,
    referenceId?: string,
  ): Promise<boolean | string> {
    if ([BalanceOperation.CREDIT, BalanceOperation.DEBIT].includes(operation)) {
      const res = await this._managerApi.sendMessage<ProtoManagerChangeBonusRes>(
        ProtoCSPayloadType.PROTO_MANAGER_CHANGE_BONUS_REQ,
        'ProtoManagerChangeBonusReq',
        'ProtoManagerChangeBonusRes',
        await this.reqMapper
          .get<BalanceReqMapper>('BalanceReqMapper')
          .toChangeBonus(this._managerApi, operation, amount, comment, platformAccountId, referenceId),
      );

      return res.bonusHistoryId?.toString() ?? true;
    }

    const res = await this._managerApi.sendMessage<ProtoChangeBalanceRes>(
      ProtoCSPayloadType.PROTO_CHANGE_BALANCE_REQ,
      'ProtoChangeBalanceReq',
      'ProtoChangeBalanceRes',
      await this.reqMapper
        .get<BalanceReqMapper>('BalanceReqMapper')
        .toChangeBalance(this._managerApi, operation, amount, comment, platformAccountId, referenceId),
    );

    return res.balanceHistoryId?.toString() ?? true;
  }

  // Trades
  /////////////////////////////////////////////////////////////////////////

  /**
   * Opens an order on the trading platform
   * @param dto The details to open the order with
   * @param platformAccountId The account id to open the order for
   * @throws PlatformException
   */
  async openOrder(dto: OpenOrderDto, platformAccountId: string): Promise<Order> {
    // Send the order to the manager API
    const res = await this._managerApi.sendMessage<ProtoExecutionEvent>(
      ProtoCSPayloadType.PROTO_MANAGER_NEW_ORDER_REQ,
      'ProtoManagerNewOrderReq',
      'ProtoExecutionEvent',
      await this.reqMapper
        .get<OrderReqMapper>('OrderReqMapper')
        .toManagerNewOrderReq(platformAccountId, dto, this._managerApi, this.utcSecToServerSec.bind(this)),
    );

    if (!res.order) {
      throw new UnprocessableResponseException('order', res.order);
    }
    if (ProtoExecutionType.ORDER_ACCEPTED !== res.executionType) {
      throw new ActionRejectedException(
        new Error(`Failed to place ${dto.symbol} order with status ${res.executionType}`),
      );
    }

    return await this.resMapper
      .get<OrderMapper>('OrderMapper')
      .toOrder(res.order, this._managerApi, this.serverMsToUtcMs.bind(this));
  }

  /**
   * Updates an existing order on the trading platform
   * @param dto The details to update the order with
   * @param platformAccountId The account id to update the order for
   * @param platformOrderId The ID on the trading platform of the order to update
   * @throws PlatformException
   */
  async updateOrder(
    dto: UpdateOrderDto,
    platformAccountId: string,
    platformOrderId: string,
  ): Promise<UpdateOrderResult> {
    // Send the update to the manager API
    const res = await this._managerApi.sendMessage<ProtoExecutionEvent>(
      ProtoCSPayloadType.PROTO_MANAGER_AMEND_ORDER_REQ,
      'ProtoManagerAmendOrderReq',
      'ProtoExecutionEvent',
      await this.reqMapper
        .get<OrderReqMapper>('OrderReqMapper')
        .toManagerAmendOrderReq(
          platformAccountId,
          platformOrderId,
          dto,
          this._managerApi,
          this.serverMsToUtcMs.bind(this),
        ),
    );

    if (!res.order) {
      throw new UnprocessableResponseException('order', res.order);
    }
    if (ProtoExecutionType.ORDER_REPLACED !== res.executionType) {
      throw new ActionRejectedException(
        new Error(`Failed to cancel order '${platformOrderId}' with status ${res.executionType}`),
      );
    }

    const order = await this.resMapper
      .get<OrderMapper>('OrderMapper')
      .toOrder(res.order, this._managerApi, this.serverMsToUtcMs.bind(this));

    return {
      triggerPrice: order.triggerPrice,
      takeProfit: order.takeProfit,
      stopLoss: order.stopLoss,
      expiresAt: order.expiresAt,
    };
  }

  /**
   * Cancels an order on the trading platform
   * @param platformAccountId The account id the order belongs to
   * @param platformOrderId The order id to cancel
   * @throws PlatformException
   */
  async cancelOrder(platformAccountId: string, platformOrderId: string): Promise<boolean> {
    // Cancel the order
    const res = await this._managerApi.sendMessage<ProtoExecutionEvent>(
      ProtoCSPayloadType.PROTO_MANAGER_CANCEL_ORDER_REQ,
      'ProtoManagerCancelOrderReq',
      'ProtoExecutionEvent',
      { orderId: Long.fromValue(platformOrderId), traderId: Long.fromValue(platformAccountId) },
    );

    if (!res.order) {
      throw new UnprocessableResponseException('order', res.order);
    }
    if (ProtoExecutionType.ORDER_CANCELLED !== res.executionType) {
      throw new ActionRejectedException(
        new Error(`Failed to cancel order '${platformOrderId}' with status ${res.executionType}`),
      );
    }

    return true;
  }

  /**
   * Returns a boolean indicating whether the given account has open positions
   * @param platformAccountId The account id to get the positions for
   * @throws PlatformException
   */
  async hasOpenPositions(platformAccountId: string): Promise<boolean> {
    // Check if the trader has any open positions
    const { position } = await this._managerApi.sendMessage<ProtoPositionListRes>(
      ProtoCSPayloadType.PROTO_POSITION_LIST_REQ,
      'ProtoPositionListReq',
      'ProtoPositionListRes',
      {
        traderId: Long.fromValue(platformAccountId),
        fromTimestamp: Long.fromValue(this.utcMsToServerMs(DateTime.utc().minus({ year: 5 }).toMillis())),
        toTimestamp: Long.fromValue(this.utcMsToServerMs(DateTime.utc().plus({ minute: 10 }).toMillis())),
      },
    );

    return (position?.filter((p) => ProtoPositionStatus.POSITION_STATUS_OPEN === p.positionStatus)?.length || 0) > 0;
  }

  /**
   * Returns a boolean indicating whether the given account has pending orders
   * @param platformAccountId The account id to get the orders for
   * @throws PlatformException
   */
  async hasPendingOrders(platformAccountId: string): Promise<boolean> {
    // Check if the trader has any pending orders
    const { order } = await this._managerApi.sendMessage<ProtoPendingOrderListRes>(
      ProtoCSPayloadType.PROTO_PENDING_ORDER_LIST_REQ,
      'ProtoPendingOrderListReq',
      'ProtoPendingOrderListRes',
      {
        traderId: Long.fromValue(platformAccountId),
        fromTimestamp: Long.fromValue(this.utcMsToServerMs(DateTime.utc().minus({ year: 2 }).toMillis())),
        toTimestamp: Long.fromValue(this.utcMsToServerMs(DateTime.utc().plus({ minute: 10 }).toMillis())),
      },
    );

    return (order?.length || 0) > 0;
  }

  /**
   * Returns a list of open positions on the trading platform
   * @param platformAccountId Filter the positions by the given account id
   * @throws PlatformException
   */
  async getOpenPositions(platformAccountId?: string): Promise<Position[]> {
    // List all open positions as required
    const { position } = await this._managerApi.sendMessage<ProtoPositionListRes>(
      ProtoCSPayloadType.PROTO_POSITION_LIST_REQ,
      'ProtoPositionListReq',
      'ProtoPositionListRes',
      {
        ...(platformAccountId ? { traderId: Long.fromValue(platformAccountId) } : {}),
        fromTimestamp: Long.fromValue(this.utcMsToServerMs(DateTime.utc().minus({ year: 5 }).toMillis())),
        toTimestamp: Long.fromValue(this.utcMsToServerMs(DateTime.utc().plus({ minute: 10 }).toMillis())),
      },
    );

    // Map the positions
    const positions: Position[] = [];
    for (const pos of position?.filter((p) => ProtoPositionStatus.POSITION_STATUS_OPEN === p.positionStatus) ?? []) {
      positions.push(
        await this.resMapper
          .get<PositionMapper>('PositionMapper')
          .toPosition(pos, this._managerApi, this.serverMsToUtcMs.bind(this)),
      );
    }

    return positions;
  }

  /**
   * Opens a position on the trading platform
   * @param dto The details to open the position with
   * @param platformAccountId The account id to open the position for
   * @throws PlatformException
   */
  async openPosition(dto: OpenPositionDto, platformAccountId: string): Promise<Position> {
    // Send the order to the manager API
    const res = await this._managerApi.sendMessage<ProtoExecutionEvent>(
      ProtoCSPayloadType.PROTO_MANAGER_NEW_ORDER_REQ,
      'ProtoManagerNewOrderReq',
      'ProtoExecutionEvent',
      await this.reqMapper
        .get<OrderReqMapper>('OrderReqMapper')
        .toManagerNewOrderReq(platformAccountId, dto, this._managerApi, this.utcSecToServerSec.bind(this)),
      (res) =>
        [
          ProtoExecutionType.ORDER_FILLED,
          ProtoExecutionType.ORDER_PARTIAL_FILL,
          ProtoExecutionType.ORDER_REJECTED,
        ].includes(res.executionType),
    );

    if (!res.deal) {
      throw new UnprocessableResponseException('deal', res.deal);
    }
    if (!res.order) {
      throw new UnprocessableResponseException('order', res.order);
    }
    if (!res.position?.tradeData) {
      throw new UnprocessableResponseException('position.tradeData', res.position?.tradeData);
    }

    if (![ProtoDealStatus.FILLED, ProtoDealStatus.PARTIALLY_FILLED].includes(res.deal.dealStatus)) {
      throw new ActionRejectedException(new Error(`Failed to open ${dto.symbol} position for ${dto.lots} lots`));
    }

    return await this.resMapper
      .get<PositionMapper>('PositionMapper')
      .toPosition(res.position, this._managerApi, this.serverMsToUtcMs.bind(this), res.order, res.deal);
  }

  /**
   * Updates an existing position on the trading platform
   * @param dto The details to update the position with
   * @param platformAccountId The account id to update the position for
   * @param platformPositionId The ID on the trading platform of the position to update
   * @throws PlatformException
   */
  async updatePosition(
    dto: UpdatePositionDto,
    platformAccountId: string,
    platformPositionId: string,
  ): Promise<UpdatePositionResult> {
    // Define the event types we are interested in
    const validEvents = [ProtoExecutionType.ORDER_REPLACED];
    const inValidEvents = [ProtoExecutionType.ORDER_REJECTED];

    // Send the order to the manager API
    const res = await this._managerApi.sendMessage<ProtoExecutionEvent>(
      ProtoCSPayloadType.PROTO_MANAGER_AMEND_POSITION_REQ,
      'ProtoManagerAmendPositionReq',
      'ProtoExecutionEvent',
      this.reqMapper
        .get<PositionReqMapper>('PositionReqMapper')
        .toManagerAmendPositionReq(platformAccountId, platformPositionId, dto),
      (res) => validEvents.concat(inValidEvents).includes(res.executionType),
    );

    if (!res.position) {
      throw new UnprocessableResponseException('position', res.position);
    }
    if (inValidEvents.includes(res.executionType)) {
      throw new ActionRejectedException(new Error(`Failed to amend position ${platformPositionId}`));
    }

    return {
      takeProfit: res.position.takeProfit,
      stopLoss: res.position.stopLoss,
    };
  }

  /**
   * Closes a position on the trading platform. If the lots parameter is not provided,
   * the entire position will be closed.
   * @param platformAccountId The account id to close the position for
   * @param platformPositionId The position id to close
   * @param lots The number of lots to close, or undefined to close the entire position
   * @throws PlatformException
   */
  async closePosition(
    platformAccountId: string,
    platformPositionId: string,
    lots?: number,
  ): Promise<ClosePositionResult> {
    // Find the position we want to close
    const { position } = await this._managerApi.sendMessage<ProtoPositionDetailsLiteRes>(
      ProtoCSPayloadType.PROTO_POSITION_DETAILS_LITE_REQ,
      'ProtoPositionDetailsLiteReq',
      'ProtoPositionDetailsLiteRes',
      { positionId: Long.fromValue(platformPositionId) },
    );

    // Find the position we want to close
    if (!position) {
      throw new UnknownPositionException(platformPositionId);
    }

    // Define the event types we are interested in
    const validEvents = [ProtoExecutionType.ORDER_FILLED, ProtoExecutionType.ORDER_PARTIAL_FILL];
    const inValidEvents = [ProtoExecutionType.ORDER_REJECTED];

    // Close the position
    const res = await this._managerApi.sendMessage<ProtoExecutionEvent>(
      ProtoCSPayloadType.PROTO_MANAGER_CLOSE_POSITION_REQ,
      'ProtoManagerClosePositionReq',
      'ProtoExecutionEvent',
      await this.reqMapper
        .get<PositionReqMapper>('PositionReqMapper')
        .toManagerClosePositionReq(platformAccountId, position, this._managerApi, lots),
      (res) => validEvents.concat(inValidEvents).includes(res.executionType),
    );

    if (!res.deal) {
      throw new UnprocessableResponseException('deal', res.deal);
    }
    if (!res.position) {
      throw new UnprocessableResponseException('position', res.position);
    }
    if (inValidEvents.includes(res.executionType)) {
      throw new ActionRejectedException(new Error(`Failed to close position ${position.positionId.toString()}`));
    }

    // Convert to the internal format
    return this.resMapper
      .get<PositionMapper>('PositionMapper')
      .toClosePositionResult(res.position, res.deal, this.serverMsToUtcMs.bind(this));
  }

  /**
   * Closes all open positions for a given account
   * This method IS NOT transactional. Trades are closed one by one in parallel.
   *
   * @param platformAccountId The account id for which to close all positions
   * @param incOrders Whether to include orders in the closing
   * @throws PlatformException
   * @throws PlatformException
   */
  async closeAllTrades(platformAccountId: string, incOrders: boolean = true): Promise<CloseAllTradesResult> {
    // Prepare a base response
    const result = new CloseAllTradesResult({
      positionsClosed: [],
      positionsStatus: true,
      positionsResults: [],
      ordersClosed: [],
      ordersStatus: true,
    });

    // Fetch all open positions
    const from = this.utcMsToServerMs(DateTime.utc().minus({ year: 5 }).toMillis());
    const to = this.utcMsToServerMs(DateTime.utc().plus({ minute: 10 }).toMillis());

    // Close orders (if required)
    if (incOrders) {
      const cancelOrderResult = await this.cancelAllOrders(platformAccountId);
      result.ordersClosed = cancelOrderResult.ordersClosed;
      result.ordersStatus = cancelOrderResult.ordersStatus;
    }

    // Fetch all open positions
    const { position: positions } = await this._managerApi.sendMessage<ProtoPositionListRes>(
      ProtoCSPayloadType.PROTO_POSITION_LIST_REQ,
      'ProtoPositionListReq',
      'ProtoPositionListRes',
      {
        traderId: Long.fromValue(platformAccountId),
        fromTimestamp: Long.fromValue(from),
        toTimestamp: Long.fromValue(to),
      },
    );

    // If no positions are found, return an empty result
    if (!positions.length) {
      return result;
    }

    // Close all positions (in parallel)
    const tasks: Promise<ClosePositionResult>[] = [];
    for (const position of positions) {
      // Define the event types we are interested in
      const validEvents = [ProtoExecutionType.ORDER_FILLED, ProtoExecutionType.ORDER_PARTIAL_FILL];
      const inValidEvents = [ProtoExecutionType.ORDER_REJECTED];

      // Close the position
      tasks.push(
        (async () => {
          // Close the position
          const res = await this._managerApi.sendMessage<ProtoExecutionEvent>(
            ProtoCSPayloadType.PROTO_MANAGER_CLOSE_POSITION_REQ,
            'ProtoManagerClosePositionReq',
            'ProtoExecutionEvent',
            await this.reqMapper
              .get<PositionReqMapper>('PositionReqMapper')
              .toManagerClosePositionReq(platformAccountId, position, this._managerApi),
            (res) => validEvents.concat(inValidEvents).includes(res.executionType),
          );

          if (!res.deal) {
            throw new UnprocessableResponseException('deal', res.deal);
          }
          if (!res.position) {
            throw new UnprocessableResponseException('position', res.position);
          }

          if (inValidEvents.includes(res.executionType)) {
            throw new ActionRejectedException(new Error(`Failed to close position ${position.positionId.toString()}`));
          }

          return this.resMapper
            .get<PositionMapper>('PositionMapper')
            .toClosePositionResult(res.position, res.deal, this.serverMsToUtcMs.bind(this));
        })(),
      );
    }

    // Wait for all positions to close and collect data
    for (const task of await Promise.allSettled(tasks)) {
      if ('rejected' === task.status) {
        continue;
      }

      result.positionsClosed.push(task.value.platformPositionId);
      result.positionsResults.push(task.value);
    }

    // Set if all positions were closed
    result.positionsStatus = positions.length === result.positionsClosed.length;

    return result;
  }

  /**
   * Cancel all pending orders for a given account
   * This method IS NOT transactional. Orders are closed one by one in parallel.
   *
   * @param platformAccountId The account id for which to close all pending orders
   * @throws PlatformException
   * @throws PlatformException
   */
  async cancelAllOrders(platformAccountId: string): Promise<CancelAllOrdersResult> {
    // Prepare a base response
    const result = new CancelAllOrdersResult({
      ordersClosed: [],
      ordersStatus: true,
    });

    // Fetching params for all orders
    const from = this.utcMsToServerMs(DateTime.utc().minus({ year: 5 }).toMillis());
    const to = this.utcMsToServerMs(DateTime.utc().plus({ minute: 10 }).toMillis());

    // Check if the trader has any pending orders
    const res = await this._managerApi.sendMessage<ProtoPendingOrderListRes>(
      ProtoCSPayloadType.PROTO_PENDING_ORDER_LIST_REQ,
      'ProtoPendingOrderListReq',
      'ProtoPendingOrderListRes',
      {
        traderId: Long.fromValue(platformAccountId),
        fromTimestamp: Long.fromValue(from),
        toTimestamp: Long.fromValue(to),
      },
    );

    if (res && res.order?.length) {
      // Send a close request for each order
      for (const order of res.order) {
        const resOrder = await this._managerApi.sendMessage<ProtoExecutionEvent>(
          ProtoCSPayloadType.PROTO_MANAGER_CANCEL_ORDER_REQ,
          'ProtoManagerCancelOrderReq',
          'ProtoExecutionEvent',
          { orderId: order.orderId, traderId: Long.fromValue(platformAccountId) },
        );

        if (ProtoExecutionType.ORDER_CANCELLED === resOrder.executionType) {
          result.ordersClosed.push(order.orderId.toString());
        }
      }

      // Check if all orders were closed
      result.ordersStatus = res.order.length === result.ordersClosed.length;
    }

    return result;
  }

  // Symbols
  /////////////////////////////////////////////////////////////////////////

  /**
   * Given a set of symbol names, fetches the symbols from the platform.
   * If the symbols provided are empty, fetches all symbols.
   * @param symbols The symbols to fetch, or empty to fetch all symbols
   * @throws PlatformException
   */
  async getSymbols(symbols?: string[]): Promise<Symbol[]> {
    // Fetch the symbols from the platform
    const { symbol } = await this._managerApi.sendMessage<ProtoManagerSymbolListRes>(
      ProtoCSPayloadType.PROTO_MANAGER_SYMBOL_LIST_REQ,
      'ProtoManagerSymbolListReq',
      'ProtoManagerSymbolListRes',
    );

    // Filter out the symbols that are not enabled
    let data = (symbol || []).filter((s) => s && s.enabled);

    // Filter the symbols if a list of symbols is provided
    if (symbols && symbols.length > 0) {
      data = data.filter((s) => symbols.includes(s.name));
    }

    // Map the symbols to the internal format
    const mapper = this.resMapper.get<SymbolMapper>('SymbolMapper');
    return await mapper.toSymbols(data, this._managerApi);
  }

  /**
   * Given a set of symbol names, fetches the TradingSessions for the given symbols from the platform.
   * If the symbols provided are empty, fetches TradingSessions for all symbols.
   * @param symbols The symbols to fetch the TradingSessions for, or empty to fetch all TradingSessions
   * @throws PlatformException
   */
  async getTradingSessions(symbols?: string[]): Promise<Map<string, TradingSessions>> {
    const data = await this.getSymbols(symbols);

    const sessions = new Map<string, TradingSessions>();
    for (const symbol of data) {
      if (symbol.tradingSession) sessions.set(symbol.name, symbol.tradingSession);
    }

    return sessions;
  }

  /**
   * Returns the set of holidays configured for the platform
   * @throws PlatformException
   */
  async getHolidays(): Promise<TradingHoliday[]> {
    // Fetch the symbols from the platform
    const { symbol } = await this._managerApi.sendMessage<ProtoManagerSymbolListRes>(
      ProtoCSPayloadType.PROTO_MANAGER_SYMBOL_LIST_REQ,
      'ProtoManagerSymbolListReq',
      'ProtoManagerSymbolListRes',
    );

    // Map the holidays to the internal format
    return await this.resMapper.get<HolidayMapper>('HolidayMapper').toTradingHolidays(symbol, this._managerApi);
  }

  /**
   * Adds a new holiday to the platform for the given symbol.
   * @param _dto The holiday details to add
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addHoliday(_dto: AddHolidayDto): Promise<TradingHoliday> {
    throw new UnsupportedOperationException(Platform.CT);
  }

  /**
   * Updates an existing holiday on the platform.
   * @param _dto The details to update the holiday with
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHoliday(_dto: UpdateHolidayDto): Promise<TradingHoliday> {
    throw new UnsupportedOperationException(Platform.CT);
  }

  /**
   * Deletes an existing holiday from the provided symbols
   * @param _dto The holiday details
   * @throws PlatformException
   * @throws UnknownSymbolException If the symbol is not found on the platform
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deleteHoliday(_dto: DeleteHolidayDto): Promise<boolean> {
    throw new UnsupportedOperationException(Platform.CT);
  }

  /**
   * Returns the list of user securities configured and available for the platform
   * @throws PlatformException
   */
  async getSecurities(): Promise<string[]> {
    // Fetch the data from the platform
    const { assetClass } = await this._managerApi.sendMessage<ProtoAssetClassListRes>(
      ProtoCSPayloadType.PROTO_ASSET_CLASS_LIST_REQ,
      'ProtoAssetClassListReq',
      'ProtoAssetClassListRes',
    );

    // Return the list of securities
    return (assetClass || []).map((a) => a.name).filter(Boolean) as string[];
  }
}
