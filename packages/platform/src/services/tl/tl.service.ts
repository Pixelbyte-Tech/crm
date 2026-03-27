import Redis from 'ioredis';
import { chunk } from 'lodash';
import { DateTime } from 'luxon';
import { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';

import { Gender, Platform, Monetisation } from '@crm/types';

import { TlErrorMapper } from '../../mappers/error/tl-error.mapper';
import { ReportMapper } from '../../mappers/response/tl/report.mapper';
import { SymbolMapper } from '../../mappers/response/tl/symbol.mapper';
import { AccountMapper } from '../../mappers/response/tl/account.mapper';
import { TlRequestMapper } from '../../mappers/request/tl-request.mapper';
import { PositionMapper } from '../../mappers/response/tl/position.mapper';
import { RiskPlanMapper } from '../../mappers/response/tl/risk-plan.mapper';
import { TlResponseMapper } from '../../mappers/response/tl-response.mapper';
import { UserGroupMapper } from '../../mappers/response/tl/user-group.mapper';
import { AccountReqMapper } from '../../mappers/request/tl/account-req.mapper';
import { SpreadPlanMapper } from '../../mappers/response/tl/spread-plan.mapper';
import { CommissionPlanMapper } from '../../mappers/response/tl/commission-plan.mapper';

import { Bar } from '../../models';
import { Order } from '../../models';
import { Symbol } from '../../models';
import { Account } from '../../models';
import { Position } from '../../models';
import { RiskPlan } from '../../models';
import { UserGroup } from '../../models';
import { SpreadGroup } from '../../models';
import { AccountResult } from '../../models';
import { PasswordResult } from '../../models';
import { TradingHoliday } from '../../models';
import { TradingSessions } from '../../models';
import { CommissionGroup } from '../../models';
import { TotalOnlineUsers } from '../../models';
import { UpdateOrderResult } from '../../models';
import { ClosePositionResult } from '../../models';
import { UpdatePositionResult } from '../../models';
import { CloseAllTradesResult } from '../../models';
import { CancelAllOrdersResult } from '../../models';
import { Balance, BalanceOperation } from '../../models';
import { UserGroupAggregateBalance } from '../../models';
import { TLCredentials, PlatformServer } from '../../models';

import { TlUser } from '../../types/tl/user/user.type';
import { TlGroup } from '../../types/tl/account/group.type';
import { TlRiskPlan } from '../../types/tl/plan/risk-plan.type';
import { TlPosition } from '../../types/tl/trade/position.type';
import { TlAccount } from '../../types/tl/account/account.type';
import { TlSpreadPlan } from '../../types/tl/plan/spread-plan.type';
import { TlInstrument } from '../../types/tl/symbol/instrument.type';
import { TlOrder, TlOrderStatus } from '../../types/tl/trade/order.type';
import { TlCommissionPlan } from '../../types/tl/plan/commission-plan.type';
import { TlAccountOperation } from '../../types/tl/account/account-operation.type';
import { TlAccountStatementReport } from '../../types/tl/report/account-statement-report.type';
import { TlClosedPositionsHistoryReport } from '../../types/tl/report/closed-positions-history-report.type';

import { AbstractService } from './abstract.service';
import { CircuitBreakerAxios } from '../internal/circuit-breaker-axios.service';

import { OpenOrderDto } from '../../dto/open-order.dto';
import { UserGroupDto } from '../../dto/user-group.dto';
import { AddHolidayDto } from '../../dto/add-holiday.dto';
import { UpdateOrderDto } from '../../dto/update-order.dto';
import { OpenPositionDto } from '../../dto/open-position.dto';
import { DeleteHolidayDto } from '../../dto/delete-holiday.dto';
import { UpdateHolidayDto } from '../../dto/update-holiday.dto';
import { UpdatePasswordDto } from '../../dto/update-password.dto';
import { UpdateAccountDto, TlAdditionalUpdateAccountData } from '../../dto/update-account.dto';
import { CreateAccountDto, TlAdditionalCreateAccountData } from '../../dto/create-account.dto';

import { isOk } from '../../utils/http.utils';
import { PlatformService } from '../platform-service.interface';
import { UnsupportedOperationException } from '../../exceptions';

export class TlService extends AbstractService implements PlatformService {
  constructor(
    readonly axios: CircuitBreakerAxios,
    readonly _server: PlatformServer<TLCredentials>,
    readonly cache: Cache,
    readonly redis: Redis,
    readonly resMapper: TlResponseMapper,
    readonly reqMapper: TlRequestMapper,
    readonly errorMapper: TlErrorMapper,
  ) {
    super(axios, _server, cache, redis, resMapper, reqMapper, errorMapper, 1);
  }

  /** The logger for this service */
  readonly #logger = new Logger(this.constructor.name);

  /**
   * Basic health check on API
   */
  async isHealthy(): Promise<boolean> {
    const { status } = await this.axios.post(
      '/v1/brand/assets',
      { type: this._server.credentials.environment.toUpperCase() },
      { timeout: 5000 },
    );

    return isOk(status);
  }

  /**
   * Gets the total number of online users on the platform
   * This number is calculated across all brands
   */
  onlineTotal(): Promise<TotalOnlineUsers> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Returns a list of platform logs for the given time period
   * @param _startSecUTC The start time in UTC seconds
   * @param _endSecUTC The end time in UTC seconds
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getJournal(_startSecUTC: number, _endSecUTC: number): Promise<any[]> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  // Settings
  /////////////////////////////////////////////////////////////////////////

  /**
   * Returns a user group from the platform based on the given userGroupId
   * @param userGroupId The user group id to get the group for
   * @throws PlatformException
   */
  async getUserGroup(userGroupId: string): Promise<UserGroup | null> {
    const { data: groups } = await this.axios.post<{ data: TlGroup[] }>(`/v1/groups/all`, {
      type: this._server.credentials.environment.toUpperCase(),
    });

    // Find the user group with the given id
    const userGroup = groups.data.find((group) => group.id === userGroupId);
    if (!userGroup) {
      return null;
    }

    return this.resMapper.get<UserGroupMapper>('UserGroupMapper').toUserGroup(userGroup);
  }

  /**
   * Returns the aggregate balances for the given user group
   * @param userGroupId The user group id to get the balances for
   * @throws PlatformException
   */
  async getUserGroupAggregateBalances(userGroupId: string): Promise<UserGroupAggregateBalance[]> {
    // Fetch data via the appropriate report
    const { data } = await this.axios.post<{ data: TlAccountStatementReport[] }>(
      `/v1/reports/account-statement-report`,
      { type: this._server.credentials.environment.toUpperCase() },
    );

    return this.resMapper.get<ReportMapper>('ReportMapper').toUserGroupAggregateBalances(data.data, userGroupId);
  }

  /**
   * Returns the list of user groups configured and available for the platform
   * @param filter Filter the groups by the given string, e.g. (OSP)
   * @throws PlatformException
   */
  async getUserGroups(filter?: string): Promise<UserGroup[]> {
    const { data: groups } = await this.axios.post<{ data: TlGroup[] }>(`/v1/groups/all`, {
      type: this._server.credentials.environment.toUpperCase(),
    });

    // Filter the groups by the given string
    if (filter) {
      groups.data = groups.data.filter(
        (group) =>
          group.id.toString().toLowerCase().includes(filter.toLowerCase()) ||
          group.name.toString().toLowerCase().includes(filter.toLowerCase()),
      );
    }

    return this.resMapper.get<UserGroupMapper>('UserGroupMapper').toUserGroups(groups.data);
  }

  /**
   * Returns the list of user commission groups configured and available for the platform
   * @param filter Filter the groups by the given string, e.g. (OSP)
   * @throws PlatformException
   */
  async getCommissionGroups(filter?: string): Promise<CommissionGroup[]> {
    // Fetch the commission plans
    const { data } = await this.axios.get<{ data: TlCommissionPlan[] }>(`/v1/plans/commission`, {
      params: { type: this._server.credentials.environment.toUpperCase() },
    });

    // Filter the items by the given string (if required)
    let items: TlCommissionPlan[] = data.data;
    if (filter) {
      items = items.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    // Fetch the commission plan mapper
    const mapper = this.resMapper.get<CommissionPlanMapper>('CommissionPlanMapper');

    // Map the items to CommissionGroup
    const result: CommissionGroup[] = [];
    items.forEach((item) => result.push(mapper.toCommissionGroup(item)));

    return result;
  }

  /**
   * Returns the list of user spread groups configured and available for the platform
   * @param filter Filter the groups by the given string, e.g. (OSP)
   * @throws PlatformException
   */
  async getSpreadGroups(filter?: string): Promise<SpreadGroup[]> {
    // Fetch the spread plans
    const { data } = await this.axios.get<{ data: TlSpreadPlan[] }>(`/v1/plans/spread`, {
      params: { type: this._server.credentials.environment.toUpperCase() },
    });

    // Filter the items by the given string (if required)
    let items: TlSpreadPlan[] = data.data;
    if (filter) {
      items = items.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
    }

    // Fetch the spread plan mapper
    const mapper = this.resMapper.get<SpreadPlanMapper>('SpreadPlanMapper');

    // Map the items to SpreadGroup
    const result: SpreadGroup[] = [];
    items.forEach((item) => result.push(mapper.toSpreadGroup(item)));

    return result;
  }

  /**
   * Returns the list of risk plans configured and available for the platform
   * @throws PlatformException
   */
  async getRiskPlans(): Promise<RiskPlan[]> {
    // Fetch the risk plans
    const { data } = await this.axios.get<{ data: TlRiskPlan[] }>(`/v1/plans/risk`, {
      params: { type: this._server.credentials.environment.toUpperCase() },
    });

    // Fetch the risk plan mapper
    const mapper = this.resMapper.get<RiskPlanMapper>('RiskPlanMapper');

    // Map the items to RiskPlan
    const result: RiskPlan[] = [];
    data.data.forEach((item) => result.push(mapper.toRiskPlan(item)));

    return result;
  }

  // Charts
  /////////////////////////////////////////////////////////////////////////

  /**
   * Gets a set of 1 minute bars (chart candles) for the given symbol
   * between the given from and to timestamps.
   * Returns the timestamps in UTC seconds.
   * @param _symbol The symbol to get the candles for
   * @param _startSecUTC The start time in UTC seconds for the candles
   * @param _endSecUTC The end time in UTC seconds for the candles
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get1MBars(_symbol: string, _startSecUTC: number, _endSecUTC: number): Promise<Bar[]> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Gets a set of 1 minute bars (chart candles) for the given symbols
   * between the given from and to timestamps.
   * Returns the timestamps in UTC seconds.
   * @param _symbols The symbols to get the candles for
   * @param _startSecUTC The start time in UTC seconds for the candles
   * @param _endSecUTC The end time in UTC seconds for the candles
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get1MBarsForMultipleSymbols(_symbols: string[], _startSecUTC: number, _endSecUTC: number): Promise<Bar[]> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  // Accounts
  /////////////////////////////////////////////////////////////////////////

  /**
   * Creates a new account on the platform
   * @param dto The details to create the account with
   * @param group The group to create the account in
   * @throws PlatformException
   * @throws CredentialsMismatchException
   */
  async createAccount(
    dto: CreateAccountDto<TlAdditionalCreateAccountData>,
    group: UserGroupDto,
  ): Promise<AccountResult> {
    let userId: string | undefined;

    try {
      // Check if a user exists for this email
      const userResponse = await this.axios.post<TlUser>(`/v1/users/check-by-email`, {
        email: dto.email.toLowerCase().trim(),
      });
      userId = userResponse.data.userId;
    } catch (err: any) {
      if (404 !== err.cause.status) {
        throw err;
      }
    }

    // If not create a new user
    if (!userId) {
      const { data } = await this.axios.post<TlUser>(`/v1/users/create`, {
        email: dto.email.toLowerCase().trim(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: dto.password,
        phoneNumber: dto.phone,
        gender: Gender.MALE === dto.gender ? 'MALE' : 'FEMALE',
        language: dto.language,
        comment: dto.comment,
      });

      userId = data.userId;
    }

    // Prepare the account name
    const { data: accounts } = await this.axios.post<{ data: TlAccount[] }>(`/v1/accounts/all`, {
      userId,
    });

    const nextAccount = (accounts.data.length ?? 0) + 1;
    const accountName = `${dto.tenantUserId}#${nextAccount}#${nextAccount}`;

    // Determine the correct risk plan id based on the leverage or additional data
    const riskPlanId = await this.reqMapper
      .get<AccountReqMapper>('AccountReqMapper')
      .toRiskPlan(
        this.axios,
        this._server.credentials.environment,
        dto.additionalData?.riskPlanId?.toString(),
        dto.leverage,
      );

    // Create the account
    const { data } = await this.axios.post<TlAccount>(
      `/v1/accounts/create`,
      {
        userId,
        accountName,
        type: Monetisation.REAL === dto.monetisation ? 'LIVE' : 'DEMO',
        currency: dto.currency,
        groupId: group.id,
        riskPlanId: riskPlanId,
        externalId: dto.tenantUserId,
      },
      {
        headers: dto.additionalData?.idempotencyKey ? { 'Idempotency-Key': dto.additionalData?.idempotencyKey } : {},
      },
    );

    return this.resMapper
      .get<AccountMapper>('AccountMapper')
      .toAccountResult(userId, data.accountId, dto.email.toLowerCase().trim(), data.accountName, dto.password);
  }

  /**
   * Returns the commission group associated with the given account id
   * @param _platformAccountId The account id to get the commission group for
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAccountCommissionGroup(_platformAccountId: string): Promise<CommissionGroup> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Returns the account associated with the given account id
   * @param platformAccountId The account id to fetch
   * @throws PlatformException
   */
  async getAccount(platformAccountId: string): Promise<Account> {
    const { data } = await this.axios.post<TlAccount>(`/v1/accounts/details`, {
      accountId: platformAccountId,
    });

    return this.resMapper.get<AccountMapper>('AccountMapper').toAccount(data);
  }

  /**
   * Returns the accounts associated with the given account ids
   * @param platformAccountIds The account ids to fetch
   * @throws PlatformException
   */
  async getAccounts(platformAccountIds: string[]): Promise<Account[]> {
    // Chunk the account ids into groups with max length of 10 (API limitation)
    const chunked = chunk(platformAccountIds, 10);

    // Execute in parallel
    const tasks: Promise<AxiosResponse<{ data: TlAccount[] }>>[] = [];
    for (const chunk of chunked) {
      tasks.push(
        this.axios.post<{ data: TlAccount[] }>(`/v1/accounts/multiple-details`, {
          accountIds: chunk,
        }),
      );
    }

    // Check results and map to accounts
    const result: Account[] = [];
    for (const task of await Promise.allSettled(tasks)) {
      if ('rejected' === task.status) {
        continue;
      }

      task.value.data.data.forEach((value) => {
        result.push(this.resMapper.get<AccountMapper>('AccountMapper').toAccount(value));
      });
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
    dto: UpdateAccountDto<TlAdditionalUpdateAccountData>,
    platformAccountId: string,
  ): Promise<boolean> {
    // Fetch the account from the platform
    const { data: account } = await this.axios.post<TlAccount>(`/v1/accounts/details`, {
      accountId: platformAccountId,
    });

    const tasks: Promise<AxiosResponse<unknown>>[] = [];

    // Update the user's name if needed
    if (dto.firstName || dto.lastName) {
      tasks.push(
        this.axios.post(`/v1/users/set-personal-info`, {
          userId: account.userId,
          ...(dto.firstName ? { firstName: dto.firstName } : {}),
          ...(dto.lastName ? { lastName: dto.lastName } : {}),
        }),
      );
    }

    // Update the user's email if needed
    if (dto.email) {
      tasks.push(
        this.axios.post(`/v1/users/set-email`, {
          userId: account.userId,
          email: dto.email.toLowerCase().trim(),
        }),
      );
    }

    // Handle restriction status
    if (null != dto.isTradingAllowed) {
      if (dto.isTradingAllowed) {
        tasks.push(this.axios.put(`/v1/accounts/activate`, { accountId: platformAccountId }));
      }

      if (!dto.isTradingAllowed) {
        tasks.push(this.axios.put(`/v1/accounts/restrict`, { accountId: platformAccountId }));
      }
    }

    // Handle suspension status
    if (null != dto.isSuspended) {
      if (dto.isSuspended) {
        tasks.push(this.axios.put(`/v1/accounts/suspend`, { accountId: platformAccountId }));
      }

      if (!dto.isSuspended) {
        tasks.push(this.axios.put(`/v1/accounts/activate`, { accountId: platformAccountId }));
      }
    }

    // Handle the commission plan changes
    if (null != dto.additionalData?.commissionPlanId) {
      tasks.push(
        this.axios.put(`/v1/accounts/set-commission-plan`, {
          accountId: platformAccountId,
          commissionPlanId: dto.additionalData.commissionPlanId,
        }),
      );
    }

    // Handle the spread plan changes
    if (null != dto.additionalData?.spreadPlanId) {
      tasks.push(
        this.axios.put(`/v1/accounts/set-spread-plan`, {
          accountId: platformAccountId,
          spreadPlanId: dto.additionalData.spreadPlanId,
        }),
      );
    }

    // Handle the risk plan changes
    if (null != dto.additionalData?.riskPlanId) {
      tasks.push(
        this.axios.put(`/v1/accounts/set-risk-plan`, {
          accountId: platformAccountId,
          riskPlanId: dto.additionalData.riskPlanId,
        }),
      );
    }

    // Handle leverage changes
    if (null == dto.additionalData?.riskPlanId && dto.leverage) {
      const riskPlanId = await this.reqMapper
        .get<AccountReqMapper>('AccountReqMapper')
        .toRiskPlan(this.axios, this._server.credentials.environment, undefined, dto.leverage);

      tasks.push(this.axios.put(`/v1/accounts/set-risk-plan`, { accountId: platformAccountId, riskPlanId }));
    }

    // Ensure all tasks are completed
    for (const task of await Promise.allSettled(tasks)) {
      if ('rejected' === task.status) {
        throw task.reason;
      }
    }

    return true;
  }

  /**
   * Updates an account's password on the platform
   * @param dto The details to update
   * @param platformAccountId The account id to update
   * @throws PlatformException
   */
  async updateAccountPassword(dto: UpdatePasswordDto, platformAccountId: string): Promise<PasswordResult> {
    // Fetch the account from the platform
    const { data: account } = await this.axios.post<TlAccount>(`/v1/accounts/details`, {
      accountId: platformAccountId,
    });

    // Perform the password update
    await this.axios.post(`/v1/users/set-password`, {
      userId: account.userId,
      password: dto.password,
    });

    return { ...(dto?.password ? { master: true } : {}) };
  }

  /**
   * Deletes an account from the platform. The user to which the account belongs
   * will be deleted as well.
   * @param _platformAccountId The account id to delete
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deleteAccount(_platformAccountId: string): Promise<boolean> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  // Balances
  /////////////////////////////////////////////////////////////////////////

  /**
   * Fetches the balance from the platform for a given account
   * @param platformAccountId The account id to fetch the balance for
   * @throws PlatformException
   */
  async getBalance(platformAccountId: string): Promise<Balance> {
    // Fetch the account from the platform
    const { data: account } = await this.axios.post<TlAccount>(`/v1/accounts/details`, {
      accountId: platformAccountId,
    });

    return this.resMapper.get<AccountMapper>('AccountMapper').toBalance(account);
  }

  /**
   * Fetches the balance from the platform for a given set of accounts
   * @param platformAccountId The account ids to fetch the balance for
   * @throws PlatformException
   */
  async getBalances(platformAccountId: string[]): Promise<Balance[]> {
    // Chunk the account ids into groups with max length of 10 (API limitation)
    const chunked = chunk(platformAccountId, 10);

    // Execute in parallel
    const tasks: Promise<AxiosResponse<{ data: TlAccount[] }>>[] = [];
    for (const chunk of chunked) {
      tasks.push(
        this.axios.post<{ data: TlAccount[] }>(`/v1/accounts/multiple-details`, {
          accountIds: chunk,
          type: this._server.credentials.environment.toUpperCase(),
        }),
      );
    }

    // Check results and map to balances
    const result: Balance[] = [];
    for (const task of await Promise.allSettled(tasks)) {
      if ('rejected' === task.status) {
        continue;
      }

      task.value.data.data.forEach((value) => {
        result.push(this.resMapper.get<AccountMapper>('AccountMapper').toBalance(value));
      });
    }

    return result;
  }

  /**
   * Updates an account's balance in the platform
   * @param operation The operation to perform on the account balance
   * @param amount The value by which to alter the account balance, positive or negative
   * @param comment The comment to add to the transaction
   * @param platformAccountId The account id to update the balance for
   * @param referenceId The unique reference ID for this transaction
   * @throws PlatformException
   */
  async updateBalance(
    operation: BalanceOperation,
    amount: number,
    comment: string,
    platformAccountId: string,
    referenceId?: string,
  ): Promise<boolean | string> {
    // Prepare the request headers
    const headers = {
      headers: { ...(referenceId ? { 'Idempotency-Key': referenceId } : {}) },
    };

    // Handle deposits
    if (BalanceOperation.ADD === operation) {
      const result = await this.axios.post<TlAccountOperation>(
        `/v1/account-operations/deposit`,
        { accountId: platformAccountId, amount: `${Math.abs(amount)}`, note: comment },
        headers,
      );

      return result.data.operationId.toString();
    }

    // Handle withdrawals
    if (BalanceOperation.SUB === operation) {
      const result = await this.axios.post<TlAccountOperation>(
        `/v1/account-operations/withdraw`,
        { accountId: platformAccountId, amount: `${Math.abs(amount)}`, note: comment },
        headers,
      );

      return result.data.operationId.toString();
    }

    // Handle adjustments
    if (BalanceOperation.ADJUSTMENT === operation) {
      const result = await this.axios.post<TlAccountOperation>(
        `/v1/account-operations/adjust`,
        { accountId: platformAccountId, amount: `${amount}`, note: comment },
        headers,
      );

      return result.data.operationId.toString();
    }

    // Handle credit operations
    if (BalanceOperation.CREDIT === operation) {
      const result = await this.axios.post<TlAccountOperation>(
        `/v1/account-operations/credit`,
        { accountId: platformAccountId, amount: `${Math.abs(amount)}`, note: comment },
        headers,
      );

      return result.data.operationId.toString();
    }

    // Handle debit operations
    if (BalanceOperation.DEBIT === operation) {
      const result = await this.axios.post<TlAccountOperation>(
        `/v1/account-operations/credit`,
        { accountId: platformAccountId, amount: `-${Math.abs(amount)}`, note: comment },
        headers,
      );

      return result.data.operationId.toString();
    }

    // Handle bonus operations
    if (BalanceOperation.BONUS === operation) {
      const result = await this.axios.post<TlAccountOperation>(
        `/v1/account-operations/bonus`,
        { accountId: platformAccountId, amount: `${amount}`, note: comment },
        headers,
      );

      return result.data.operationId.toString();
    }

    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  // Trades
  /////////////////////////////////////////////////////////////////////////

  /**
   * Opens an order on the trading platform
   * @param _dto The details to open the order with
   * @param _platformAccountId The account id to open the order for
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openOrder(_dto: OpenOrderDto, _platformAccountId: string): Promise<Order> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Updates an existing order on the trading platform
   * @param _dto The details to update the order with
   * @param _platformAccountId The account id to update the order for
   * @param _platformOrderId The ID on the trading platform of the order to update
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateOrder(_dto: UpdateOrderDto, _platformAccountId: string, _platformOrderId: string): Promise<UpdateOrderResult> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Cancels an order on the trading platform
   * @param _platformAccountId The account id the order belongs to
   * @param platformOrderId The order id to cancel
   * @param comment The comment to add to the order when cancelling it
   * @throws PlatformException
   */
  async cancelOrder(_platformAccountId: string, platformOrderId: string, comment?: string): Promise<boolean> {
    const result = await this.axios.post(`/v1/orders/cancel`, {
      orderId: platformOrderId,
      comment,
      type: this._server.credentials.environment.toUpperCase(),
    });
    return isOk(result.status);
  }

  /**
   * Returns a boolean indicating whether the given account has open positions
   * @param platformAccountId The account id to get the positions for
   * @throws PlatformException
   */
  async hasOpenPositions(platformAccountId: string): Promise<boolean> {
    const { data: positions } = await this.axios.post<{ data: TlPosition[] }>(`/v2/positions/get-open-positions`, {
      accountId: platformAccountId,
      type: this._server.credentials.environment.toUpperCase(),
    });

    return positions.data.length > 0;
  }

  /**
   * Returns a boolean indicating whether the given account has pending orders
   * @param platformAccountId The account id to get the orders for
   * @throws PlatformException
   */
  async hasPendingOrders(platformAccountId: string): Promise<boolean> {
    const { data: orders } = await this.axios.post<{ data: TlOrder[] }>(`/v1/orders/all`, {
      accountId: platformAccountId,
      orderStatuses: [
        TlOrderStatus.STATUS_NONE,
        TlOrderStatus.STATUS_PENDING_NEW,
        TlOrderStatus.STATUS_PENDING_EXECUTION,
        TlOrderStatus.STATUS_PENDING_CANCEL,
        TlOrderStatus.STATUS_PENDING_REPLACE,
        TlOrderStatus.STATUS_PENDING_REPLACE_NOT_ACTIVE,
        TlOrderStatus.STATUS_NEW,
        TlOrderStatus.STATUS_ACCEPTED,
        TlOrderStatus.STATUS_PART_FILLED,
        TlOrderStatus.STATUS_WAITING_MARKET,
        TlOrderStatus.STATUS_OFF_MARKET,
        TlOrderStatus.STATUS_UNPLACED,
      ],
      type: this._server.credentials.environment.toUpperCase(),
    });

    return orders.data?.length > 0;
  }

  /**
   * Returns a list of open positions on the trading platform
   * @param platformAccountId Filter the positions by the given account id
   * @throws PlatformException
   */
  async getOpenPositions(platformAccountId?: string): Promise<Position[]> {
    const { data: positions } = await this.axios.post<{ data: TlPosition[] }>(`/v2/positions/get-open-positions`, {
      accountId: platformAccountId,
      type: this._server.credentials.environment.toUpperCase(),
    });

    return this.resMapper.get<PositionMapper>('PositionMapper').toPositions(positions.data);
  }

  /**
   * Opens a position on the trading platform
   * @param _dto The details to open the position with
   * @param _platformAccountId The account id to open the position for
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openPosition(_dto: OpenPositionDto, _platformAccountId: string): Promise<Position> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Updates an existing position on the trading platform
   * @throws PlatformException
   */
  updatePosition(): Promise<UpdatePositionResult> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Closes a position on the trading platform. If the lots parameter is not provided,
   * the entire position will be closed.
   * @throws PlatformException
   */
  closePosition(): Promise<ClosePositionResult> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Closes all open positions for a given account
   * @param platformAccountId The account id for which to close all positions
   * @param incOrders Whether to include orders in the close all operation
   * @param comment The comment to add to the trades when closing them
   * @throws PlatformException
   */
  async closeAllTrades(
    platformAccountId: string,
    incOrders: boolean = true,
    comment?: string,
  ): Promise<CloseAllTradesResult> {
    let allOrdersClosed = false;
    let allPositionsClosed = false;
    const closedOrderIds: string[] = [];
    const closedPositionIds: string[] = [];

    // If we need to cancel orders, we do so now
    if (incOrders) {
      const closeOrdersResult = await this.cancelAllOrders(platformAccountId, comment);
      allOrdersClosed = closeOrdersResult.ordersStatus;
      closedOrderIds.push(...closeOrdersResult.ordersClosed);
    }

    const msg = `Closing all positions for ${platformAccountId}`;
    this.#logger.debug(`${msg} - Start`);

    // Close all positions
    const { data: positions } = await this.axios.post<{ positionIdsOrderedToBeClosed: string[] }>(
      `/v1/accounts/close-all-positions`,
      { accountId: platformAccountId, comment },
    );

    this.#logger.debug(`${msg} - Complete`, positions);

    // Wait a bit before checking
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if all positions are closed
    const now = DateTime.now().toUnixInteger();
    const result: ClosePositionResult[] = [];

    while (!allPositionsClosed && now > DateTime.now().minus({ seconds: 10 }).toUnixInteger()) {
      const { data: report } = await this.axios.post<{ data: TlClosedPositionsHistoryReport[] }>(
        `/v1/reports/closed-positions-history-report`,
        {
          accountIds: [platformAccountId],
          startDateTime: this.utcSecToServerTime(DateTime.now().toUnixInteger() - 20),
          endDateTime: this.utcSecToServerTime(DateTime.now().toUnixInteger() + 10),
          type: this._server.credentials.environment.toUpperCase(),
        },
      );

      // Find the position ids in the report
      const closed = report.data.filter((pos) =>
        positions.positionIdsOrderedToBeClosed.includes(pos.positionId.toString()),
      );

      // Check if all positions are closed
      allPositionsClosed = closed?.length === positions.positionIdsOrderedToBeClosed.length;

      // Add the closed position ids to the result
      closed.forEach((pos) => {
        closedPositionIds.push(pos.positionId.toString());
        result.push(
          this.resMapper.get<ReportMapper>('ReportMapper').toClosePositionResult(pos, pos.positionId.toString()),
        );
      });

      // Wait a bit before checking again
      if (!allPositionsClosed) await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return {
      positionsResults: result,
      positionsClosed: closedPositionIds.map((p) => p.toString()),
      positionsStatus: allPositionsClosed,
      ordersClosed: closedOrderIds,
      ordersStatus: !incOrders || allOrdersClosed,
    };
  }

  /**
   * Closes all open orders for a given account
   * @param platformAccountId The account id for which to close all orders
   * @param comment The comment to add to the orders when closing them
   * @throws PlatformException
   */
  async cancelAllOrders(platformAccountId: string, comment?: string): Promise<CancelAllOrdersResult> {
    const msg = `Closing all orders for ${platformAccountId}`;
    this.#logger.debug(`${msg} - Start`);

    // Ask the platform to close the orders
    const { data: orders } = await this.axios.post<{
      orderIdsOrderedToBeCanceled: string[];
      orderIdsFailedToCancel: string[];
    }>(`/v1/accounts/cancel-all-orders`, { comment });

    this.#logger.debug(`${msg} - Complete`, orders);

    // Check the status of the orders
    return new CancelAllOrdersResult({
      ordersStatus: 0 === orders.orderIdsFailedToCancel.length,
      ordersClosed: orders.orderIdsOrderedToBeCanceled.map(String),
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
    const { data: instruments } = await this.axios.post<{ data: TlInstrument[] }>(`/v1/brand/instrument-details`, {
      type: this._server.credentials.environment.toUpperCase(),
    });

    // Map the instruments to symbols
    const mapper = this.resMapper.get<SymbolMapper>('SymbolMapper');
    const results: Symbol[] = instruments.data.map<Symbol>((i) => mapper.toSymbol(i));

    // Filter the symbols by the given string
    return symbols?.length ? results.filter((r) => symbols.includes(r.name)) : results;
  }

  /**
   * Given a set of symbol names, fetches the TradingSessions for the given symbols from the platform.
   * If the symbols provided are empty, fetches TradingSessions for all symbols.
   * @param _symbols  The symbols to fetch the TradingSessions for, or empty to fetch all TradingSessions
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTradingSessions(_symbols: string[]): Promise<Map<string, TradingSessions>> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Returns the set of holidays configured for the platform
   * @throws PlatformException
   */
  getHolidays(): Promise<TradingHoliday[]> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Adds a new holiday to the platform for the given symbol.
   * @param _dto The holiday details to add
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addHoliday(_dto: AddHolidayDto): Promise<TradingHoliday> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Updates an existing holiday on the platform.
   * @param _dto The details to update the holiday with
   * @throws PlatformException
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHoliday(_dto: UpdateHolidayDto): Promise<TradingHoliday> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Deletes an existing holiday from the provided symbols
   * @param _dto The holiday details
   * @throws PlatformException
   * @throws UnknownSymbolException If the symbol is not found on the platform
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deleteHoliday(_dto: DeleteHolidayDto): Promise<boolean> {
    throw new UnsupportedOperationException(`${Platform.TL}`);
  }

  /**
   * Returns the list of user securities configured and available for the platform
   * @throws PlatformException
   */
  async getSecurities(): Promise<string[]> {
    const { data: instruments } = await this.axios.post<{ data: TlInstrument[] }>(`/v1/brand/instrument-details`, {
      type: this._server.credentials.environment.toUpperCase(),
    });

    function isString(item: unknown): item is string {
      return typeof item === 'string';
    }

    // Map the instruments to securities
    const mapper = this.resMapper.get<SymbolMapper>('SymbolMapper');
    const results: string[] = instruments.data.map<string | null>((i) => mapper.toSecurity(i)).filter<string>(isString);

    // Remove duplicates and return
    return [...new Set(results)];
  }
}
