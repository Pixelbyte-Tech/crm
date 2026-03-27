import { Bar } from '../models';
import { Order } from '../models';
import { Symbol } from '../models';
import { Account } from '../models';
import { Position } from '../models';
import { RiskPlan } from '../models';
import { UserGroup } from '../models';
import { SpreadGroup } from '../models';
import { JournalEntry } from '../models';
import { AccountResult } from '../models';
import { PasswordResult } from '../models';
import { TradingHoliday } from '../models';
import { TradingSessions } from '../models';
import { CommissionGroup } from '../models';
import { TotalOnlineUsers } from '../models';
import { UpdateOrderResult } from '../models';
import { ClosePositionResult } from '../models';
import { UpdatePositionResult } from '../models';
import { CloseAllTradesResult } from '../models';
import { CancelAllOrdersResult } from '../models';
import { Balance, BalanceOperation } from '../models';
import { UserGroupAggregateBalance } from '../models';
import { Credentials, PlatformServer } from '../models';

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
