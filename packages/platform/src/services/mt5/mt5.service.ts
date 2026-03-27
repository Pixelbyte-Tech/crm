import Redis from 'ioredis';
import { chunk } from 'lodash';
import { DateTime } from 'luxon';
import { AxiosResponse } from 'axios';
import { Cache } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';

import { Platform } from '@crm/types';

import { BarMapper } from '../../mappers/response/mt5/bar.mapper';
import { DealMapper } from '../../mappers/response/mt5/deal.mapper';
import { Mt5ErrorMapper } from '../../mappers/error/mt5-error.mapper';
import { OrderMapper } from '../../mappers/response/mt5/order.mapper';
import { SymbolMapper } from '../../mappers/response/mt5/symbol.mapper';
import { AccountMapper } from '../../mappers/response/mt5/account.mapper';
import { HolidayMapper } from '../../mappers/response/mt5/holiday.mapper';
import { JournalMapper } from '../../mappers/response/mt5/journal.mapper';
import { Mt5RequestMapper } from '../../mappers/request/mt5-request.mapper';
import { PositionMapper } from '../../mappers/response/mt5/position.mapper';
import { Mt5ResponseMapper } from '../../mappers/response/mt5-response.mapper';
import { UserGroupMapper } from '../../mappers/response/mt5/user-group.mapper';
import { CommandReqMapper } from '../../mappers/request/mt5/command-req.mapper';
import { CommissionGroupMapper } from '../../mappers/response/mt5/commission-group.mapper';
import { BalanceOperationReqMapper } from '../../mappers/request/mt5/balance-operation-req.mapper';

import { Bar } from '../../models/bar';
import { Order } from '../../models/order';
import { Symbol } from '../../models/symbol';
import { Account } from '../../models/account';
import { Position } from '../../models/position';
import { RiskPlan } from '../../models/risk-plan';
import { UserGroup } from '../../models/user-group';
import { SpreadGroup } from '../../models/spread-group';
import { JournalEntry } from '../../models/journal-entry';
import { AccountResult } from '../../models/account-result';
import { PasswordResult } from '../../models/password-result';
import { TradingHoliday } from '../../models/trading-holiday';
import { TradingSessions } from '../../models/trading-session';
import { CommissionGroup } from '../../models/commission-group';
import { Balance, BalanceOperation } from '../../models/balance';
import { TotalOnlineUsers } from '../../models/total-online-users';
import { UpdateOrderResult } from '../../models/update-order-result';
import { ClosePositionResult } from '../../models/close-position-result';
import { UpdatePositionResult } from '../../models/update-position-result';
import { CloseAllTradesResult } from '../../models/close-all-trades-result';
import { MTCredentials, PlatformServer } from '../../models/platform-server';
import { CancelAllOrdersResult } from '../../models/close-all-orders-result';
import { UserGroupAggregateBalance } from '../../models/user-group-aggregate-balance';

import { Mt5Deal } from '../../types/mt5/trade/deal.type';
import { Mt5Order } from '../../types/mt5/trade/order.type';
import { Mt5User } from '../../types/mt5/account/user.type';
import { Mt5Group } from '../../types/mt5/account/group.type';
import { Mt5Candle } from '../../types/mt5/candle/candle.type';
import { Mt5Symbol } from '../../types/mt5/symbol/symbol.type';
import { Mt5Holiday } from '../../types/mt5/symbol/holiday.type';
import { Mt5Account } from '../../types/mt5/account/account.type';
import { Mt5Position } from '../../types/mt5/trade/position.type';
import { Mt5CommandResponse } from '../../types/mt5/commands/send.type';
import { Mt5BalanceUpdate } from '../../types/mt5/balance/balance-update.type';
import { Mt5JournalEntry } from '../../types/mt5/statistics/journal-entry.type';

import { AbstractMtService } from './abstract.mt.service';
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
import { CreateAccountDto, Mt5AdditionalCreateAccountData } from '../../dto/create-account.dto';
import { UpdateAccountDto, Mt5AdditionalUpdateAccountData } from '../../dto/update-account.dto';

import { isOk } from '../../utils/http.utils';
import { CredentialType, PlatformService } from '../../factory/platform.factory';
import {
  DuplicateAccountIdException,
  UnsupportedOperationException,
  InvalidMethodParametersException,
  AccountCommissionGroupNotFoundException,
} from '../../exceptions';

export class Mt5Service extends AbstractMtService implements PlatformService {
  constructor(
    readonly axios: CircuitBreakerAxios,
    readonly _server: PlatformServer<MTCredentials>,
    readonly credentialType: CredentialType,
    readonly cache: Cache,
    readonly redis: Redis,
    readonly resMapper: Mt5ResponseMapper,
    readonly reqMapper: Mt5RequestMapper,
    readonly errorMapper: Mt5ErrorMapper,
  ) {
    super(axios, _server, credentialType, cache, redis, resMapper, reqMapper, errorMapper, 5);
  }

  /**
   * Basic health check on platform API
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.axios.get('/.version', { timeout: 5000 });
      return isOk(response.status);
    } catch {
      return false;
    }
  }

  /**
   * Gets the total number of online users on the platform
   * This number is calculated across all brands
   */
  async onlineTotal(): Promise<TotalOnlineUsers> {
    const { data } = await this.axios.get<{ data: number }>(`/online/total`);

    return new TotalOnlineUsers({
      totalOnlineUsers: data.data,
      server: { url: this._server.endpoint },
    });
  }

  /**
   * Returns a list of platform logs for the given time period
   * @param startSecUTC The start time in UTC seconds
   * @param endSecUTC The end time in UTC seconds
   * @throws PlatformException
   */
  async getJournal(startSecUTC: number, endSecUTC: number): Promise<JournalEntry[]> {
    const start = this.utcSecToServerTime(startSecUTC);
    const end = this.utcSecToServerTime(endSecUTC);

    const tasks: Promise<AxiosResponse<Mt5JournalEntry[]>>[] = [];
    for (const type of ['MTLogTypeUser', 'MTLogTypeTrade']) {
      tasks.push(
        this.axios.get<Mt5JournalEntry[]>(`/journal/manager/server`, {
          params: { Mode: 'MTLogModeStd', Type: type, StartDate: start, EndDate: end },
          timeout: 120_000,
        }),
      );
    }

    const journalEntries: JournalEntry[] = [];
    for (const task of await Promise.allSettled(tasks)) {
      if ('rejected' === task.status) {
        continue;
      }

      const { data: entries } = task.value;
      for (const entry of entries) {
        journalEntries.push(
          this.resMapper.get<JournalMapper>('JournalMapper').toJournalEntry(entry, this.utcOffsetSec),
        );
      }
    }

    return journalEntries;
  }

  // Settings
  /////////////////////////////////////////////////////////////////////////

  /**
   * Returns a user group from the platform based on the given userGroupId
   * @param userGroupId The user group id to get the group for
   * @throws PlatformException
   */
  async getUserGroup(userGroupId: string): Promise<UserGroup> {
    const { data } = await this.axios.get<Mt5Group>(`/groups/${encodeURIComponent(userGroupId)}`);

    return this.resMapper.get<UserGroupMapper>('UserGroupMapper').toUserGroup(data);
  }

  /**
   * Returns the aggregate balances for the given user group
   * @param _userGroupId The user group id to get the balances for
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getUserGroupAggregateBalances(_userGroupId: string): Promise<UserGroupAggregateBalance[]> {
    throw new UnsupportedOperationException(Platform.MT5);
  }

  /**
   * Returns the list of user groups configured and available for the platform
   * @param filter Filter the groups by the given string, e.g. (OSP)
   * @throws PlatformException
   */
  async getUserGroups(filter?: string): Promise<UserGroup[]> {
    const groups = await this.#retrieveMt5Groups(filter);

    return this.resMapper.get<UserGroupMapper>('UserGroupMapper').toUserGroups(groups);
  }

  /**
   * Returns the list of user commission groups configured and available for the platform
   * @param filter Filter the groups by the given string, e.g. (OSP)
   * @throws PlatformException
   */
  async getCommissionGroups(filter?: string): Promise<CommissionGroup[]> {
    const groups = await this.#retrieveMt5Groups(filter);

    return this.resMapper.get<CommissionGroupMapper>('CommissionGroupMapper').toCommissionGroups(groups);
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
   * The concept of risk plans does not exist on MT
   * @throws UnsupportedOperationException
   */
  getRiskPlans(): Promise<RiskPlan[]> {
    throw new UnsupportedOperationException(Platform.MT5);
  }

  /**
   * Returns a list of groups from the platform, optionally filtered by
   * the filter param provided.
   * @param filter The filter by which to restrict the groups returned
   * @throws PlatformException
   */
  async #retrieveMt5Groups(filter?: string): Promise<Mt5Group[]> {
    const { data: groups } = await this.axios.get<{ data: Mt5Group[] }>('/groups');

    return filter ? groups.data.filter((g) => g.group.includes(filter)) : groups.data;
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
    const response = await this.axios.get<{ data: Mt5Candle[] }>(`/charts`, {
      params: {
        symbol,
        from: this.utcSecToServerTime(startSecUTC),
        to: this.utcSecToServerTime(endSecUTC),
      },
    });

    // Return only candles which are in the range we wanted
    const items = (response && response.data.data.length > 0 ? response.data.data : []).filter(
      (item) => item.datetime >= startSecUTC && item.datetime <= endSecUTC,
    );

    return this.resMapper.get<BarMapper>('BarMapper').toBars(symbol, items);
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
    dto: CreateAccountDto<Mt5AdditionalCreateAccountData>,
    group: UserGroupDto,
  ): Promise<AccountResult> {
    let response: AxiosResponse<Mt5Account>;
    try {
      response = await this.axios.post<Mt5Account>(`/users`, {
        masterPassword: dto.password,
        ...(dto?.readonlyPassword ? { investorPassword: dto.readonlyPassword } : {}),
        user: {
          rights: [
            'USER_RIGHT_ENABLED',
            'USER_RIGHT_PASSWORD',
            'USER_RIGHT_TRAILING',
            'USER_RIGHT_REPORTS',
            'USER_RIGHT_EXPERT',
          ].join(','),

          leverage: dto.leverage,
          group: group.name,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email.toLowerCase().trim(),
          registration: DateTime.now().toSeconds(),

          ...(dto.platformAccountId ? { login: dto.platformAccountId } : {}),

          ...(dto.address ? { address: dto.address } : {}),
          ...(dto.city ? { city: dto.city } : {}),
          ...(dto.zipcode ? { zipcode: dto.zipcode } : {}),
          ...(dto.state ? { state: dto.state } : {}),
          ...(dto.country ? { country: dto.country } : {}),

          ...(dto.phone ? { phone: dto.phone } : {}),
          ...(dto.comment ? { comment: dto.comment } : {}),

          ...(dto.phonePassword ? { phonePassword: dto.phonePassword } : {}),
          ...(dto.leadSource ? { leadSource: dto.leadSource } : {}),
        },
      });
    } catch (err) {
      // Special case for duplicate account ids
      if (err instanceof DuplicateAccountIdException) {
        throw new DuplicateAccountIdException(dto.platformAccountId, err.cause);
      }

      throw err;
    }

    return this.resMapper
      .get<AccountMapper>('AccountMapper')
      .toAccountResult(response.data, dto.password, dto.readonlyPassword, dto.phonePassword);
  }

  /**
   * Returns the commission group associated with the given account id
   * @param platformAccountId The account id to get the commission group for
   * @throws PlatformException
   */
  async getAccountCommissionGroup(platformAccountId: string): Promise<CommissionGroup> {
    const { data: user } = await this.axios.get<Mt5User>(`/users/${platformAccountId}`);

    const groups = await this.getCommissionGroups(user.group);
    const commissionGroup = groups.find((g) => g.name === user.group);

    if (commissionGroup) {
      return commissionGroup;
    }

    throw new AccountCommissionGroupNotFoundException(platformAccountId);
  }

  /**
   * Returns the account associated with the given account id
   * @param platformAccountId The account id to fetch
   * @throws PlatformException
   */
  async getAccount(platformAccountId: string): Promise<Account> {
    const { data } = await this.axios.get<Mt5User>(`/users/${platformAccountId}`);

    return await this.resMapper.get<AccountMapper>('AccountMapper').toAccount(this.axios, data, platformAccountId);
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
   * @throws InvalidMethodParametersException
   */
  async updateAccount(
    dto: UpdateAccountDto<Mt5AdditionalUpdateAccountData>,
    platformAccountId: string,
  ): Promise<boolean> {
    const account = await this.axios.get<Mt5User>(`/users/${platformAccountId}`);
    const data = account.data;

    // If the commission or spread groups are being updated,
    // either one must be set or they must both match.
    if (dto.commissionGroup && dto.spreadGroup && dto.commissionGroup !== dto.spreadGroup) {
      throw new InvalidMethodParametersException(`Commission and spread groups must match for MT4`);
    }

    const group: string | undefined = dto.commissionGroup || dto.spreadGroup;

    // Disable or enable trading
    if ('isTradingAllowed' in dto && typeof dto.isTradingAllowed === 'boolean') {
      let rights = account.data.rights.split(',').map((right) => right.trim());

      if (dto.isTradingAllowed) {
        rights = rights.filter((r) => r !== 'USER_RIGHT_TRADE_DISABLED');
      } else {
        rights.push('USER_RIGHT_TRADE_DISABLED');
      }
      data.rights = rights.join(', ');
    }

    // Disable or enable account
    if ('isSuspended' in dto && typeof dto.isSuspended === 'boolean') {
      let rights = account.data.rights.split(',').map((right) => right.trim());

      if (dto.isSuspended) {
        rights = rights.filter((r) => r !== 'USER_RIGHT_ENABLED');
      } else {
        rights.push('USER_RIGHT_ENABLED');
      }
      data.rights = rights.join(', ');
    }

    if (dto.firstName && dto.lastName) {
      data.name = `${dto.firstName} ${dto.lastName}`;
    }

    if (dto.leverage) data.leverage = dto.leverage;
    if (dto.email) data.eMail = dto.email.toLowerCase().trim();
    if (dto.phone) data.phone = dto.phone;
    if (dto.address) data.address = dto.address;
    if (dto.city) data.city = dto.city;
    if (dto.state) data.state = dto.state;
    if (dto.zipcode) data.zipCode = dto.zipcode;
    if (dto.country) data.country = dto.country;
    if (group) data.group = group;

    const response = await this.axios.put<Mt5User>(`/users/${platformAccountId}`, data);

    return isOk(response.status);
  }

  /**
   * Updates an account's password on the platform
   * @param dto The details to update
   * @param platformAccountId The account id to update
   */
  async updateAccountPassword(dto: UpdatePasswordDto, platformAccountId: string): Promise<PasswordResult> {
    const tasks: Promise<AxiosResponse>[] = [];
    let result = {};

    // Update the password
    if (dto?.password) {
      const passwordType = 'master';
      result = { ...result, [passwordType]: false };

      tasks.push(
        this.axios.post(
          `/commands/password`,
          {
            login: Number(platformAccountId),
            password: dto.password,
            type: 'USER_PASS_MAIN',
            command: 'change',
          },
          { headers: { passwordType } },
        ),
      );
    }

    // Update the readonly password
    if (dto?.passwordReadOnly) {
      const passwordType = 'readonly';
      result = { ...result, [passwordType]: false };

      tasks.push(
        this.axios.post(
          `/commands/password`,
          {
            login: Number(platformAccountId),
            password: dto.passwordReadOnly,
            type: 'USER_PASS_INVESTOR',
            command: 'change',
          },
          { headers: { passwordType } },
        ),
      );
    }

    for (const task of await Promise.allSettled(tasks)) {
      if ('rejected' === task.status) {
        continue;
      }

      const { value } = task as PromiseFulfilledResult<AxiosResponse>;
      const { passwordType } = value.config.headers;

      if (passwordType && typeof passwordType === 'string') {
        result = { ...result, [passwordType]: true };
      }
    }

    return result;
  }

  /**
   * Deletes an account from the platform. The user to which the account belongs
   * will be deleted as well.
   * @param platformAccountId The account id to delete
   * @throws PlatformException
   */
  async deleteAccount(platformAccountId: string): Promise<boolean> {
    const response = await this.axios.delete(`/users/${platformAccountId}`);
    return isOk(response.status);
  }

  // Balances
  /////////////////////////////////////////////////////////////////////////

  /**
   * Fetches the balance from the platform for a given account
   * @param platformAccountId The account id to fetch the balance for
   * @throws PlatformException
   */
  async getBalance(platformAccountId: string): Promise<Balance> {
    const response = await this.axios.get<Mt5Account>(`/accounts/${platformAccountId}`);

    return this.resMapper.get<AccountMapper>('AccountMapper').toBalance(platformAccountId, response.data);
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
   * @throws PlatformException
   */
  async updateBalance(
    operation: BalanceOperation,
    amount: number,
    comment: string,
    platformAccountId: string,
  ): Promise<boolean | string> {
    const response = await this.axios.post<Mt5BalanceUpdate>(
      '/dealer/commands/balance',
      this.reqMapper
        .get<BalanceOperationReqMapper>('BalanceOperationReqMapper')
        .toBalanceOperation(platformAccountId, amount, operation, comment),
    );

    return isOk(response.status) ? response.data.dealId.toString() : false;
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
    const { data } = await this.axios.post<{ request: Mt5CommandResponse }>(
      `/dealer/commands/send`,
      this.reqMapper.get<CommandReqMapper>('CommandReqMapper').toOrderOpenCmd({
        platformAccountId,
        symbol: dto.symbol,
        type: this.reqMapper.get<CommandReqMapper>('CommandReqMapper').toCmdType(dto.type),
        volume: dto.lots * 10_000,
        comment: dto.comment ?? 'Opened via PixelByte CRM',
        takeProfit: dto?.takeProfit,
        stopLoss: dto?.stopLoss,
        triggerPrice: dto?.triggerPrice,
        expiryTime: dto?.expiresAt ? this.utcSecToServerSec(DateTime.fromISO(dto.expiresAt).toSeconds()) : undefined,
      }),
    );

    const { data: orderUpdated } = await this.axios.get<Mt5Order>(`/orders/${data.request.order}`);
    return this.resMapper.get<OrderMapper>('OrderMapper').toOrder(orderUpdated, this.serverSecToUtcSec.bind(this));
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
    // Find the initial order
    const { data: orderInitial } = await this.axios.get<Mt5Order>(`/orders/${platformOrderId}`);

    // Check if the order is already cancelled or filled
    if (['ORDER_STATE_CANCELED', 'ORDER_STATE_FILLED'].includes(orderInitial.state)) {
      throw new BadRequestException(`Order ${platformOrderId} is already cancelled or filled`);
    }

    // Prepare the expiry time
    let expiryTime = orderInitial.timeExpiration;
    if (undefined !== dto.expiresAt) {
      expiryTime = null === dto.expiresAt ? 0 : this.utcSecToServerSec(DateTime.fromISO(dto.expiresAt).toMillis());
    }

    // Update the order
    const { data: cmd } = await this.axios.post<{ request: Mt5CommandResponse }>(
      `/dealer/commands/send`,
      this.reqMapper.get<CommandReqMapper>('CommandReqMapper').toOrderUpdateCmd({
        platformAccountId,
        platformOrderId,
        symbol: orderInitial.symbol,
        type: orderInitial.type,
        comment: 'Updated via PixelByte CRM',
        takeProfit: undefined === dto.takeProfit ? orderInitial.priceTP : dto.takeProfit,
        stopLoss: undefined === dto.stopLoss ? orderInitial.priceSL : dto.stopLoss,
        triggerPrice: dto?.triggerPrice ?? orderInitial.priceOrder,
        expiryTime: expiryTime,
      }),
    );

    return new UpdateOrderResult({
      triggerPrice: cmd.request.priceOrder,
      takeProfit: cmd.request?.priceTP && cmd.request.priceTP > 0 ? cmd.request.priceTP : undefined,
      stopLoss: cmd.request.priceSL && cmd.request.priceSL > 0 ? cmd.request.priceSL : undefined,
      expiresAt:
        cmd.request?.timeExpiration && cmd.request.timeExpiration > 0
          ? DateTime.fromSeconds(this.serverSecToUtcSec(cmd.request.timeExpiration / 1000)).toJSDate()
          : undefined,
    });
  }

  /**
   * Cancels an order on the trading platform
   * @param _platformAccountId The account id the order belongs to
   * @param platformOrderId The order id to cancel
   * @param comment The comment to add to the order when cancelling it
   * @throws PlatformException
   */
  async cancelOrder(_platformAccountId: string, platformOrderId: string, comment?: string): Promise<boolean> {
    // Find the initial order
    const { data: orderInitial } = await this.axios.get<Mt5Order>(`/orders/${platformOrderId}`);

    // Check if the order is already cancelled or filled
    if (['ORDER_STATE_CANCELED', 'ORDER_STATE_FILLED'].includes(orderInitial.state)) {
      throw new BadRequestException(`Order ${platformOrderId} is already cancelled or filled`);
    }

    // Cancel the order
    const response = await this.axios.post<{ request: Mt5CommandResponse }>(
      `/dealer/commands/send`,
      this.reqMapper.get<CommandReqMapper>('CommandReqMapper').toOrderCloseCmd({
        platformOrderId,
        platformAccountId: orderInitial.login,
        symbol: orderInitial.symbol,
        type: orderInitial.type,
        comment: comment ?? 'Cancelled via PixelByte CRM',
      }),
    );

    return isOk(response.status);
  }

  /**
   * Returns a boolean indicating whether the given account has open positions
   * @param platformAccountId The account id to get the positions for
   * @throws PlatformException
   */
  async hasOpenPositions(platformAccountId: string): Promise<boolean> {
    // Fetch all open positions
    const result = await this.axios.get<{ data: Mt5Position[] }>(`/positions`, {
      params: { login: platformAccountId },
    });

    return result.data.data?.length > 0;
  }

  /**
   * Returns a boolean indicating whether the given account has pending orders
   * @param platformAccountId The account id to get the orders for
   * @throws PlatformException
   */
  async hasPendingOrders(platformAccountId: string): Promise<boolean> {
    // Fetch all orders
    const result = await this.axios.get<{ data: Mt5Order[] }>(`/orders`, {
      params: { login: platformAccountId },
    });
    const orders: Mt5Order[] = [];

    // Check the orders for any that are not cancelled or filled
    for (const order of result.data.data) {
      if (!['ORDER_STATE_CANCELED', 'ORDER_STATE_FILLED'].includes(order.state)) {
        orders.push(order);
      }
    }

    return orders?.length > 0;
  }

  /**
   * Returns a list of open positions on the trading platform
   * @param platformAccountId Filter the positions by the given account id
   * @throws PlatformException
   */
  async getOpenPositions(platformAccountId?: string): Promise<Position[]> {
    // Fetch all open positions
    const result = await this.axios.get<{ data: Mt5Position[] }>(`/positions`, {
      params: { ...(platformAccountId ? { login: platformAccountId } : {}) },
    });

    const positions: Position[] = [];

    // Separate positions from orders
    for (const mt5Pos of result.data.data) {
      positions.push(
        this.resMapper.get<PositionMapper>('PositionMapper').toPosition(mt5Pos, this.serverSecToUtcSec.bind(this)),
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
    const { data } = await this.axios.post<{ request: Mt5CommandResponse }>(
      `/dealer/commands/send`,
      this.reqMapper.get<CommandReqMapper>('CommandReqMapper').toPositionOpenCmd({
        platformAccountId,
        symbol: dto.symbol,
        type: this.reqMapper.get<CommandReqMapper>('CommandReqMapper').toCmdType(dto.side),
        volume: dto.lots * 10_000,
        comment: dto.comment ?? 'Opened via CRM',
        takeProfit: dto?.takeProfit,
        stopLoss: dto?.stopLoss,
      }),
    );

    const { data: deal } = await this.axios.get<Mt5Deal>(`/deals/${data.request.resultDeal}`);

    return this.resMapper.get<DealMapper>('DealMapper').toPosition(deal, this.serverSecToUtcSec.bind(this));
  }

  /**
   * Updates an existing position on the trading platform
   * @param dto The details to update the position with
   * @param platformAccountId The account id to position the order for
   * @param platformPositionId The ID on the trading platform of the position to update
   * @throws PlatformException
   */
  async updatePosition(
    dto: UpdatePositionDto,
    platformAccountId: string,
    platformPositionId: string,
  ): Promise<UpdatePositionResult> {
    // Fetch all open positions
    const { data: positions } = await this.axios.get<{ data: Mt5Position[] }>(`/positions`, {
      params: { login: platformAccountId },
    });

    // Find the position we want to update
    const position = positions.data.find((p) => p.position.toString() === platformPositionId);
    if (!position) {
      throw new BadRequestException(`Position ${platformPositionId} not found for account ${platformAccountId}`);
    }

    // Update the order
    const { data: cmd } = await this.axios.post<{ request: Mt5CommandResponse }>(
      `/dealer/commands/send`,
      this.reqMapper.get<CommandReqMapper>('CommandReqMapper').toPositionUpdateCmd({
        platformAccountId: position.login,
        platformPositionId,
        symbol: position.symbol,
        type: 'POSITION_BUY' === position.action ? 'OP_BUY' : 'OP_SELL',
        comment: 'Updated via PixelByte CRM',
        takeProfit: undefined === dto.takeProfit ? position.priceTP : dto.takeProfit,
        stopLoss: undefined === dto.stopLoss ? position.priceSL : dto.stopLoss,
      }),
    );

    return new UpdatePositionResult({
      takeProfit: cmd.request.priceTP && cmd.request.priceTP > 0 ? cmd.request.priceTP : undefined,
      stopLoss: cmd.request.priceSL && cmd.request.priceSL > 0 ? cmd.request.priceSL : undefined,
    });
  }

  /**
   * Closes a position on the trading platform. If the lots parameter is not provided,
   * the entire position will be closed.
   * @param platformAccountId The account id to close the position for
   * @param platformPositionId The position id to close
   * @param lots The number of lots to close, or undefined to close the entire position
   * @param comment The comment to add to the trade when closing it
   * @throws PlatformException
   */
  async closePosition(
    platformAccountId: string,
    platformPositionId: string,
    lots?: number,
    comment?: string,
  ): Promise<ClosePositionResult> {
    // Fetch all open positions
    const { data: positions } = await this.axios.get<{ data: Mt5Position[] }>(`/positions`, {
      params: { login: platformAccountId },
    });

    // Find the position we want to close
    const position = positions.data.find((p) => p.position.toString() === platformPositionId);
    if (!position) {
      throw new BadRequestException(`Position ${platformPositionId} not found for account ${platformAccountId}`);
    }

    // Convert the volume to lots
    const positionLots = position.volume / 10_000;

    // If the lots parameter is not provided, we close the entire position
    lots = Math.min(lots ?? positionLots, positionLots);

    // Close the position
    const { data } = await this.axios.post<{ request: Mt5CommandResponse }>(
      `/dealer/commands/send`,
      this.reqMapper.get<CommandReqMapper>('CommandReqMapper').toPositionCloseCmd({
        platformAccountId: position.login,
        platformPositionId: position.position,
        symbol: position.symbol,
        type: 'POSITION_BUY' === position.action ? 'OP_SELL' : 'OP_BUY',
        volume: lots * 10_000,
        comment: comment ?? 'Closed via PixelByte CRM',
      }),
    );

    // Find the resulting deal for the close trade
    const { data: deal } = await this.axios.get<Mt5Deal>(`/deals/${data.request.resultDeal}`);

    // Calculate the remaining lots
    const lotsRemaining = positionLots - lots;

    return new ClosePositionResult({
      platformPositionId: deal.positionID.toString(),
      platformTradeId: deal.deal.toString(),
      closePrice: deal.price,
      closedAt: DateTime.fromSeconds(this.serverSecToUtcSec(deal.time)).toJSDate(),
      profit: deal.profit,
      lotsRemaining,
    });
  }

  /**
   * Closes all open positions for a given account
   * This method IS NOT transactional. Trades are closed one by one in parallel.
   *
   * @param platformAccountId The account id for which to close all positions
   * @param incOrders Whether to include orders in the closing
   * @param comment The comment to add to the trades when closing them
   * @throws PlatformException
   */
  async closeAllTrades(
    platformAccountId: string,
    incOrders: boolean = true,
    comment?: string,
  ): Promise<CloseAllTradesResult> {
    let closeOrdersStatus = false;

    const closedDealIds: string[] = [];
    const closedOrderIds: string[] = [];
    const closedPositionIds: string[] = [];

    if (incOrders) {
      const closeOrdersResult = await this.cancelAllOrders(platformAccountId);
      closedOrderIds.push(...closeOrdersResult.ordersClosed);
      closeOrdersStatus = closeOrdersResult.ordersStatus;
    }

    // Fetch all open positions
    const { data } = await this.axios.get<{ data: Mt5Position[] }>(`/positions`, {
      params: { login: platformAccountId },
    });

    const positions: Mt5Position[] = data.data;
    const tasksPositions: Promise<AxiosResponse>[] = [];

    // Prepare a payload to close each position individually.
    // This is necessary because the does not support closing all positions at once.
    for (const position of positions) {
      tasksPositions.push(
        this.axios.post(
          `/dealer/commands/send`,
          this.reqMapper.get<CommandReqMapper>('CommandReqMapper').toPositionCloseCmd({
            platformAccountId: position.login,
            platformPositionId: position.position,
            symbol: position.symbol,
            type: 'POSITION_BUY' === position.action ? 'OP_SELL' : 'OP_BUY',
            volume: position.volume,
            comment: comment ?? 'Closed via PixelByte CRM',
          }),
        ),
      );
    }

    // Wait for all positions to be closed
    for (const task of await Promise.allSettled(tasksPositions)) {
      if ('rejected' !== task.status) {
        closedDealIds.push(task.value.data.request.resultDeal.toString());
      }
    }

    // Prepare the response
    const positionsResults: ClosePositionResult[] = [];
    const response = new CloseAllTradesResult({
      positionsResults,
      positionsClosed: [],
      positionsStatus: false,
      ordersClosed: closedOrderIds,
      ordersStatus: closeOrdersStatus,
    });

    const now = DateTime.now().toUnixInteger();

    while (positions.length !== closedDealIds.length && now > DateTime.now().minus({ seconds: 10 }).toUnixInteger()) {
      // Fetch the most recent deals to find the ones we just closed
      const { data: deals } = await this.axios.get<{ data: Mt5Deal[] }>(`/deals`, {
        params: {
          Login: platformAccountId,
          From: this.utcSecToServerTime(DateTime.now().minus({ second: 60 }).toSeconds()),
        },
      });

      // Filter out the ones we just closed
      const closedDeals = deals.data.filter((t) => closedDealIds.includes(t.deal.toString()));

      // Update the results with the closed deals, only
      // adding the ones we haven't already added
      for (const deal of closedDeals) {
        const positionId = deal.positionID.toString();
        if (closedPositionIds.includes(positionId)) {
          continue;
        }

        closedPositionIds.push(positionId);
        positionsResults.push(
          new ClosePositionResult({
            platformPositionId: deal.positionID.toString(),
            platformTradeId: deal.deal.toString(),
            closePrice: deal.price,
            closedAt: DateTime.fromSeconds(this.serverSecToUtcSec(deal.time)).toJSDate(),
            profit: deal.profit,
            lotsRemaining: 0,
          }),
        );
      }

      // Wait a bit before checking again
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    response.positionsResults = positionsResults;
    response.positionsClosed = closedPositionIds;
    response.positionsStatus = positions.length === closedPositionIds.length;

    return response;
  }

  /**
   * Closes all orders for a given account
   * This method IS NOT transactional. Orders are closed one by one in parallel.
   *
   * @param platformAccountId The account id for which to close all positions
   * @throws PlatformException
   */
  async cancelAllOrders(platformAccountId: string): Promise<CancelAllOrdersResult> {
    const closedOrderIds: string[] = [];

    const result = await this.axios.get<{ data: Mt5Order[] }>(`/orders`, {
      params: { login: platformAccountId },
    });

    const tasksOrders: Promise<AxiosResponse>[] = [];
    const orders: Mt5Order[] = result.data.data;

    // Prepare a payload to close each order individually.
    // This is necessary because the does not support closing all orders at once.
    for (const order of orders) {
      if (!['ORDER_STATE_CANCELED', 'ORDER_STATE_FILLED'].includes(order.state)) {
        tasksOrders.push(this.axios.delete(`/orders/${order.order}`, { headers: { 'x-orderId': order.order } }));
      }
    }

    // Wait for all orders to be closed
    for (const task of await Promise.allSettled(tasksOrders)) {
      if ('rejected' !== task.status) {
        closedOrderIds.push(task.value.config.headers['x-orderId'].toString());
      }
    }

    return new CancelAllOrdersResult({
      ordersClosed: closedOrderIds,
      ordersStatus: orders.length === closedOrderIds.length,
    });
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
    const response = await this.axios.get<{ data: Mt5Symbol[] }>(`/symbols`);

    const result: Symbol[] = [];
    for (const data of response.data.data) {
      if (symbols && !symbols.includes(data.symbol)) {
        continue;
      }

      result.push(
        this.resMapper
          .get<SymbolMapper>('SymbolMapper')
          .toSymbol(data, this._server.serverTimeZone, this._server.offsetHours),
      );
    }

    return result;
  }

  /**
   * Given a set of symbol names, fetches the TradingSessions for the given symbols from the platform.
   * If the symbols provided are empty, fetches TradingSessions for all symbols.
   * @param symbols  The symbols to fetch the TradingSessions for, or empty to fetch all TradingSessions
   * @throws PlatformException
   */
  async getTradingSessions(symbols?: string[]): Promise<Map<string, TradingSessions>> {
    const response = await this.axios.get<{ data: Mt5Symbol[] }>(`/symbols`);

    const result = new Map<string, TradingSessions>();
    for (const data of response.data.data) {
      if (symbols && !symbols.includes(data.symbol)) {
        continue;
      }

      result.set(
        data.symbol,
        this.resMapper
          .get<SymbolMapper>('SymbolMapper')
          .toTradingSessions(data, this._server.serverTimeZone, this._server.offsetHours),
      );
    }

    return result;
  }

  /**
   * Returns the set of holidays configured for the platform
   * @throws PlatformException
   */
  async getHolidays(): Promise<TradingHoliday[]> {
    const response = await this.axios.get<{ data: Mt5Holiday[] }>(`/configuration/holidays`);
    const result: TradingHoliday[] = [];

    for (const data of response.data.data) {
      const symbols = data.symbols.map((symbol) => symbol.replace(/.*\\/g, ''));

      const holiday = this.resMapper
        .get<HolidayMapper>('HolidayMapper')
        .toHoliday(data as Mt5Holiday, this._server.serverTimeZone, symbols);

      if (holiday) result.push(holiday);
    }

    return result;
  }

  /**
   * Adds a new holiday to the platform for the given symbol.
   * @param _dto The holiday details to add
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addHoliday(_dto: AddHolidayDto): Promise<TradingHoliday> {
    throw new UnsupportedOperationException(Platform.MT5);
  }

  /**
   * Updates an existing holiday on the platform.
   * @param _dto The details to update the holiday with
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHoliday(_dto: UpdateHolidayDto): Promise<TradingHoliday> {
    throw new UnsupportedOperationException(Platform.MT5);
  }

  /**
   * Deletes an existing holiday from the provided symbols
   * @param _dto The holiday details
   * @throws PlatformException
   * @throws UnknownSymbolException If the symbol is not found on the platform
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deleteHoliday(_dto: DeleteHolidayDto): Promise<boolean> {
    throw new UnsupportedOperationException(Platform.MT5);
  }

  /**
   * Returns the list of user securities configured and available for the platform
   * @throws PlatformException
   */
  async getSecurities(): Promise<string[]> {
    const response = await this.axios.get<{ data: Mt5Symbol[] }>(`/symbols`);

    const result: string[] = [];
    for (const data of response.data.data) {
      result.push(this.resMapper.get<SymbolMapper>('SymbolMapper').toSecurity(data));
    }

    return result;
  }
}
