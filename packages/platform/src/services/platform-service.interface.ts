import { CircuitBreakerAxios } from './internal/circuit-breaker-axios.service';

import { UserGroupDto } from '../dto/user-group.dto';
import { OpenOrderDto } from '../dto/open-order.dto';
import { AddHolidayDto } from '../dto/add-holiday.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OpenPositionDto } from '../dto/open-position.dto';
import { DeleteHolidayDto } from '../dto/delete-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { UpdateAccountDto, UpdateAccountAdditionalData } from '../dto/update-account.dto';
import { CreateAccountDto, CreateAccountAdditionalData } from '../dto/create-account.dto';

import { Bar } from '../models/bar';
import { Order } from '../models/order';
import { Symbol } from '../models/symbol';
import { Account } from '../models/account';
import { Position } from '../models/position';
import { RiskPlan } from '../models/risk-plan';
import { UserGroup } from '../models/user-group';
import { SpreadGroup } from '../models/spread-group';
import { JournalEntry } from '../models/journal-entry';
import { AccountResult } from '../models/account-result';
import { PasswordResult } from '../models/password-result';
import { TradingHoliday } from '../models/trading-holiday';
import { TradingSessions } from '../models/trading-session';
import { CommissionGroup } from '../models/commission-group';
import { Balance, BalanceOperation } from '../models/balance';
import { TotalOnlineUsers } from '../models/total-online-users';
import { UpdateOrderResult } from '../models/update-order-result';
import { ClosePositionResult } from '../models/close-position-result';
import { Credentials, PlatformServer } from '../models/platform-server';
import { UpdatePositionResult } from '../models/update-position-result';
import { CloseAllTradesResult } from '../models/close-all-trades-result';
import { CancelAllOrdersResult } from '../models/close-all-orders-result';
import { UserGroupAggregateBalance } from '../models/user-group-aggregate-balance';

export interface PlatformService {
  get server(): PlatformServer<Credentials>;

  get client(): CircuitBreakerAxios;

  isHealthy(): Promise<boolean>;

  getJournal(startSecUTC: number, endSecUTC: number): Promise<JournalEntry[]>;

  onlineTotal(): Promise<TotalOnlineUsers>;

  // Groups & Plans
  getUserGroup(userGroupId: string): Promise<UserGroup | null>;

  getUserGroupAggregateBalances(userGroupId: string): Promise<UserGroupAggregateBalance[]>;

  getUserGroups(filter?: string): Promise<UserGroup[]>;

  getCommissionGroups(filter?: string): Promise<CommissionGroup[]>;

  getSpreadGroups(filter?: string): Promise<SpreadGroup[]>;

  getRiskPlans(): Promise<RiskPlan[]>;

  // Charts
  get1MBars(symbol: string, startSecUTC: number, endSecUTC: number): Promise<Bar[]>;

  get1MBarsForMultipleSymbols(symbols: string[], startSecUTC: number, endSecUTC: number): Promise<Bar[]>;

  // Accounts
  createAccount(dto: CreateAccountDto<CreateAccountAdditionalData>, group: UserGroupDto): Promise<AccountResult>;

  getAccountCommissionGroup(platformAccountId: string): Promise<CommissionGroup | null>;

  getAccount(platformAccountId: string): Promise<Account>;

  getAccounts(platformAccountId: string[]): Promise<Account[]>;

  updateAccount(dto: UpdateAccountDto<UpdateAccountAdditionalData>, platformAccountId: string): Promise<boolean>;

  updateAccountPassword(dto: UpdatePasswordDto, platformAccountId: string): Promise<PasswordResult>;

  deleteAccount(platformAccountId: string): Promise<boolean>;

  // Balances
  getBalance(platformAccountId: string): Promise<Balance>;

  getBalances(platformAccountIds: string[]): Promise<Balance[]>;

  updateBalance(
    operation: BalanceOperation,
    amount: number,
    comment: string,
    platformAccountId: string,
    referenceId?: string,
  ): Promise<boolean | string>;

  // Trades
  openOrder(dto: OpenOrderDto, platformAccountId: string): Promise<Order>;

  updateOrder(dto: UpdateOrderDto, platformAccountId: string, platformOrderId: string): Promise<UpdateOrderResult>;

  cancelOrder(platformAccountId: string, platformOrderId: string, comment?: string): Promise<boolean>;

  hasOpenPositions(platformAccountId: string): Promise<boolean>;

  hasPendingOrders(platformAccountId: string): Promise<boolean>;

  getOpenPositions(platformAccountId?: string): Promise<Position[]>;

  openPosition(dto: OpenPositionDto, platformAccountId: string): Promise<Position>;

  updatePosition(
    dto: UpdatePositionDto,
    platformAccountId: string,
    platformPositionId: string,
  ): Promise<UpdatePositionResult>;

  closePosition(
    platformAccountId: string,
    platformPositionId: string,
    lots?: number,
    comment?: string,
  ): Promise<ClosePositionResult>;

  closeAllTrades(platformAccountId: string, incOrders?: boolean, comment?: string): Promise<CloseAllTradesResult>;

  cancelAllOrders(platformAccountId: string, comment?: string): Promise<CancelAllOrdersResult>;

  // Symbols
  getSymbols(symbols?: string[]): Promise<Symbol[]>;

  getTradingSessions(symbols?: string[]): Promise<Map<string, TradingSessions>>;

  getHolidays(): Promise<TradingHoliday[]>;

  addHoliday(dto: AddHolidayDto): Promise<TradingHoliday>;

  updateHoliday(dto: UpdateHolidayDto): Promise<TradingHoliday>;

  deleteHoliday(dto: DeleteHolidayDto): Promise<boolean>;

  getSecurities(): Promise<string[]>;
}
